import ENV from "../config/env";

/**
 * Enhanced Geocoding Service - Accurate road names
 */
class GeocodingService {
  constructor() {
    this.cache = new Map();
    this.lastRequest = 0;
    this.minRequestInterval = 1500; // 1.5s between requests
  }

  // Generate cache key with higher precision
  generateKey(lat, lng) {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  // Main method - Get detailed road information
  async getRoadInfo(latitude, longitude, language = "ar") {
    try {
      // Check cache first
      const key = this.generateKey(latitude, longitude);
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        if (Date.now() - cached.timestamp < 300000) {
          // 5 min cache
          return cached.data;
        }
        this.cache.delete(key);
      }

      // Rate limiting
      const now = Date.now();
      if (now - this.lastRequest < this.minRequestInterval) {
        return this.getFromCache(latitude, longitude);
      }
      this.lastRequest = now;

      // Try Google first
      if (ENV.GOOGLE_MAPS_API_KEY) {
        const googleResult = await this.fetchFromGoogle(
          latitude,
          longitude,
          language
        );
        if (googleResult) {
          this.cacheResult(key, googleResult);
          return googleResult;
        }
      }

      // Fallback to Nominatim
      const osmResult = await this.fetchFromNominatim(
        latitude,
        longitude,
        language
      );
      if (osmResult) {
        this.cacheResult(key, osmResult);
        return osmResult;
      }

      // Final fallback
      return this.getDefaultRoadInfo(language);
    } catch (error) {
      console.error("Geocoding error:", error);
      return this.getDefaultRoadInfo(language);
    }
  }

  // Google Geocoding API (Enhanced)
  async fetchFromGoogle(lat, lng, lang) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${lang}&result_type=route|street_address|establishment&location_type=ROOFTOP|RANGE_INTERPOLATED&key=${ENV.GOOGLE_MAPS_API_KEY}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // ✅ وقت أطول

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn("Google geocoding HTTP error:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        console.warn("Google geocoding no results:", data.status);
        return null;
      }

      // ✅ تجربة عدة نتائج للعثور على أفضل اسم طريق
      for (let i = 0; i < Math.min(3, data.results.length); i++) {
        const result = data.results[i];
        const components = result.address_components;

        // Extract road information with priority
        const route = components.find((c) => c.types.includes("route"));
        const street = components.find((c) => c.types.includes("street_address"));
        const neighborhood = components.find((c) =>
          c.types.includes("neighborhood")
        );
        const sublocality = components.find((c) =>
          c.types.includes("sublocality")
        );
        const locality = components.find((c) => c.types.includes("locality"));
        const adminArea = components.find((c) =>
          c.types.includes("administrative_area_level_1")
        );

        // Priority: route > street > neighborhood > sublocality
        const roadName =
          route?.long_name ||
          street?.long_name ||
          neighborhood?.long_name ||
          sublocality?.long_name ||
          locality?.long_name ||
          result.formatted_address.split(",")[0];

        // ✅ تخطي النتائج الفارغة أو غير المفيدة
        if (roadName && roadName !== "Unnamed Road" && roadName.length > 3) {
          // Determine road type
          const roadType = this.determineRoadType(roadName, result.types);

          return {
            roadName: roadName,
            fullAddress: result.formatted_address,
            roadType: roadType,
            city: locality?.long_name || adminArea?.long_name || "غير محدد",
            neighborhood: neighborhood?.long_name || sublocality?.long_name,
            source: "google",
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          };
        }
      }

      // إذا لم نجد أي نتيجة مفيدة
      return null;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Google geocoding timeout");
      } else {
        console.error("Google geocoding error:", error);
      }
      return null;
    }
  }

  // Nominatim (OSM) - Enhanced
  async fetchFromNominatim(lat, lng, lang) {
    try {
      // ✅ استعلام محسّن مع تفاصيل أكثر
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${lang}&addressdetails=1&extratags=1&namedetails=1&zoom=18`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // ✅ وقت أطول

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "SurahApp/1.0 (Speed Limit App)",
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn("Nominatim HTTP error:", response.status);
        return null;
      }

      const data = await response.json();

      if (!data || !data.address) {
        console.warn("Nominatim no data");
        return null;
      }

      const addr = data.address;

      // ✅ Extract road with enhanced priority
      const roadName =
        addr.road ||
        addr.highway ||
        data.namedetails?.name || // ✅ اسم المكان المحلي
        addr.pedestrian ||
        addr.cycleway ||
        addr.footway ||
        addr.path ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.quarter ||
        data.display_name.split(",")[0];

      // Get road type from OSM tags
      const roadType = this.determineRoadTypeOSM(data.extratags, roadName);

      return {
        roadName: roadName,
        fullAddress: data.display_name,
        roadType: roadType,
        city: addr.city || addr.town || addr.village || "جدة",
        neighborhood: addr.neighbourhood || addr.suburb || addr.quarter,
        source: "osm",
        coordinates: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
        },
      };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Nominatim timeout");
      } else {
        console.error("Nominatim error:", error);
      }
      return null;
    }
  }

  // Determine road type from name/tags
  determineRoadType(roadName, types = []) {
    const name = roadName.toLowerCase();

    // Highway detection
    if (
      name.includes("highway") ||
      name.includes("طريق سريع") ||
      name.includes("expressway") ||
      types.includes("route")
    ) {
      return "highway";
    }

    // Main road detection
    if (
      name.includes("طريق") ||
      name.includes("road") ||
      name.includes("avenue") ||
      name.includes("شارع رئيسي")
    ) {
      return "main_road";
    }

    // Street detection
    if (
      name.includes("شارع") ||
      name.includes("street") ||
      name.includes("st.")
    ) {
      return "street";
    }

    return "unknown";
  }

  // Determine road type from OSM tags
  determineRoadTypeOSM(tags = {}, roadName = "") {
    if (tags.highway) {
      const hw = tags.highway;
      if (["motorway", "trunk"].includes(hw)) return "highway";
      if (["primary", "secondary"].includes(hw)) return "main_road";
      if (["residential", "tertiary", "unclassified"].includes(hw))
        return "street";
    }

    return this.determineRoadType(roadName);
  }

  // Get from nearby cache
  getFromCache(lat, lng) {
    // Check nearby cached locations (within 100m)
    for (const [key, value] of this.cache.entries()) {
      const [cachedLat, cachedLng] = key.split(",").map(parseFloat);
      const distance = this.calculateDistance(lat, lng, cachedLat, cachedLng);

      if (distance < 0.1) {
        // Within 100 meters
        return value.data;
      }
    }
    return null;
  }

  // Calculate distance between two points (km)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Cache result with timestamp
  cacheResult(key, data) {
    // Limit cache size to 500 entries
    if (this.cache.size >= 500) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  }

  // Default road info
  getDefaultRoadInfo(language = "ar") {
    return {
      roadName: language === "ar" ? "طريق غير معروف" : "Unknown Road",
      fullAddress: language === "ar" ? "موقع غير محدد" : "Unknown Location",
      roadType: "unknown",
      city: language === "ar" ? "جدة" : "Jeddah",
      neighborhood: null,
      source: "default",
      coordinates: null,
    };
  }

  // Get cache stats
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: 500,
      usage: ((this.cache.size / 500) * 100).toFixed(2) + "%",
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Singleton
const geocodingService = new GeocodingService();

export default geocodingService;
