import ENV from "../config/env";
import { speedLimitCache } from "../utils/cacheManager";
import { googleRoadsLimiter, osmLimiter } from "../utils/rateLimiter.js";
import {
  DEFAULT_SPEED_LIMITS,
  SAUDI_SPEED_RULES,
  SPECIAL_ZONES,
} from "../config/constants";

// أولويات تصنيف الطرق
const ROAD_PRIORITY = {
  motorway: 1, // لا تطبق المناطق القريبة أبداً
  trunk: 2, // لا تطبق المناطق القريبة أبداً
  primary: 3, // إنشاءات فقط
  secondary: 4, // مناطق خاصة مع حدود
  residential: 5, // كل المناطق
  service: 6, // كل المناطق
  unclassified: 7, // كل المناطق
};

class RoadsAPIService {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
    this.lastSpeedLimit = null;
  }

  async getSpeedLimit(
    latitude,
    longitude,
    userHeading = null,
    activeRoute = null,
    currentRoadSegment = null,
  ) {
    try {
      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error("Invalid coordinates");
      }

      // 1. فحص الكاش
      const cacheKey = speedLimitCache.generateKey(latitude, longitude);
      const cached = speedLimitCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // 2. محاولة OSM
      const osmResult = await this.fetchFromOSM(latitude, longitude);
      if (osmResult !== null) {
        speedLimitCache.set(cacheKey, osmResult);
        return osmResult;
      }

      // 3. ✅ Smart Fallback المُحسّن
      const baseSpeed = await this.getSmartFallback(latitude, longitude);

      // 4. ✅ فحص المناطق الخاصة (مدارس، مستشفيات)
      const nearbyZones = await this.detectNearbySpeedZones(
        { latitude, longitude },
        150,
      );

      // 5. ✅ تطبيق المناطق بذكاء (بدون تأثير على الطرق السريعة)
      const finalSpeed = this.applySpecialZonesIntelligently(
        baseSpeed,
        nearbyZones,
        currentRoadSegment,
      );

      speedLimitCache.set(cacheKey, finalSpeed);
      return finalSpeed;
    } catch (error) {
      console.error("Get speed limit error:", error);
      return this.getFallbackSpeedLimit();
    }
  }

  validateCoordinates(lat, lng) {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  async fetchFromOSM(latitude, longitude) {
    try {
      if (!osmLimiter.canMakeRequest()) {
        console.warn("OSM rate limit reached");
        return null;
      }

      const query = `
        [out:json][timeout:5];
        way(around:50,${latitude},${longitude})["maxspeed"];
        out body;
      `;

      const url = `${ENV.OSM_OVERPASS_API_URL}?data=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const element = data.elements[0];
        const maxspeed = element.tags?.maxspeed;

        if (maxspeed) {
          console.log(`OSM: ${maxspeed}`);
          return this.parseOSMSpeed(maxspeed);
        }
      }

      console.log("OSM: No data");
      return null;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("OSM request timeout");
      } else {
        console.error("OSM error:", error);
      }
      return null;
    }
  }

  /**
   * Get detailed road information for precision speed engine
   * @param {number} latitude - GPS latitude
   * @param {number} longitude - GPS longitude
   * @returns {Promise<Object|null>} - Detailed road data
   */
  async getDetailedRoadInfo(latitude, longitude) {
    try {
      if (!osmLimiter.canMakeRequest()) {
        console.warn("OSM rate limit reached for detailed road info");
        return null;
      }

      const query = `
        [out:json][timeout:8];
        (
          way(around:30,${latitude},${longitude})["highway"];
        );
        out body;
      `;

      const url = `${ENV.OSM_OVERPASS_API_URL}?data=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        // Find the best matching road
        let bestRoad = null;
        let bestScore = 0;

        for (const element of data.elements) {
          if (element.tags) {
            const score = this.scoreRoadInfo(element.tags);
            if (score > bestScore) {
              bestScore = score;
              bestRoad = element;
            }
          }
        }

        if (bestRoad) {
          const tags = bestRoad.tags;
          const maxspeedStr = tags.maxspeed;
          let maxspeed = null;

          if (maxspeedStr) {
            maxspeed = this.parseOSMSpeed(maxspeedStr);
          }

          const roadInfo = {
            highway: tags.highway,
            name: tags.name || tags.name_en || tags.name_ar,
            maxspeed: maxspeed,
            surface: tags.surface,
            lanes: tags.lanes,
            confidence: bestScore > 5 ? 'high' : 'medium'
          };

          console.log(`🛣️ Road info: ${roadInfo.highway} (${roadInfo.name || 'unnamed'})`);
          return roadInfo;
        }
      }

      return null;

    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("OSM detailed road info timeout");
      } else {
        console.error("Detailed road info error:", error);
      }
      return null;
    }
  }

  /**
   * Score road information quality for best match selection
   */
  scoreRoadInfo(tags) {
    let score = 0;
    
    // Highway type (required)
    if (tags.highway) score += 3;
    
    // Speed limit available
    if (tags.maxspeed) score += 3;
    
    // Road name available
    if (tags.name || tags.name_en || tags.name_ar) score += 2;
    
    // Additional useful info
    if (tags.lanes) score += 1;
    if (tags.surface) score += 1;
    
    return score;
  }

  /**
   * ✅ Smart Fallback المُصلح
   */
  async getSmartFallback(latitude, longitude) {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const types = result.types || [];
        const addressComponents = result.address_components || [];
        const formattedAddress = result.formatted_address?.toLowerCase() || "";

        // 1️⃣ طرق الملك
        for (const comp of addressComponents) {
          const longName = comp.long_name?.toLowerCase() || "";
          if (longName.includes("king") || longName.includes("الملك")) {
            console.log(`✅ Smart Fallback: King Road → 100 km/h`);
            return 100;
          }
          if (
            comp.types.includes("route") &&
            (longName.includes("highway") || longName.includes("طريق سريع"))
          ) {
            console.log(`✅ Smart Fallback: Highway → 120 km/h`);
            return 120;
          }
        }

        // 2️⃣ نوع "route"
        if (types.includes("route")) {
          console.log(`✅ Smart Fallback: Road (route type) → 80 km/h`);
          return 80;
        }

        // 3️⃣ سكني صريح
        const isDefinitelyResidential =
          types.includes("premise") ||
          types.includes("street_address") ||
          (types.includes("neighborhood") && !types.includes("route"));

        if (isDefinitelyResidential) {
          console.log(`✅ Smart Fallback: Residential → 40 km/h`);
          return 40;
        }

        // 4️⃣ افتراضي
        console.log(`✅ Smart Fallback: Default road → 80 km/h`);
        return 80;
      }

      return 80;
    } catch (error) {
      console.error("Smart fallback error:", error);
      return 80;
    }
  }

  /**
   * ✅ كشف المناطق الخاصة (مدارس، مستشفيات)
   */
  async detectNearbySpeedZones(userLocation, radius = 150) {
    try {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=${radius}&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(placesUrl);
      const data = await response.json();

      const zones = [];

      if (data.results && data.results.length > 0) {
        for (const place of data.results) {
          const placeTypes = place.types || [];

          // مناطق المدارس
          if (
            placeTypes.some((type) =>
              [
                "school",
                "university",
                "primary_school",
                "secondary_school",
              ].includes(type),
            )
          ) {
            zones.push({
              type: "school_zone",
              speedLimit: 30,
              coordinates: place.geometry.location,
              name: place.name,
              distance: this.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng,
              ),
            });
          }

          // مناطق المستشفيات
          if (
            placeTypes.some((type) =>
              ["hospital", "doctor", "health"].includes(type),
            )
          ) {
            zones.push({
              type: "hospital_zone",
              speedLimit: 40,
              coordinates: place.geometry.location,
              name: place.name,
              distance: this.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng,
              ),
            });
          }
        }
      }

      return zones;
    } catch (error) {
      console.error("Error detecting nearby zones:", error);
      return [];
    }
  }

  /**
   * ✅ تطبيق المناطق الخاصة بذكاء
   */
  applySpecialZonesIntelligently(baseSpeed, zones, roadSegment) {
    // لا توجد مناطق
    if (!zones || zones.length === 0) {
      return baseSpeed;
    }

    // تحديد نوع الطريق
    const roadClass = roadSegment?.classification || "unclassified";
    const roadPriority = ROAD_PRIORITY[roadClass] || 7;

    // ✅ الطرق السريعة والرئيسية: لا تتأثر أبداً
    if (roadPriority <= 2) {
      console.log(
        `🚗 Highway/Trunk road (priority ${roadPriority}) - ignoring zones`,
      );
      return baseSpeed;
    }

    // ✅ الطرق الأساسية: تتأثر فقط إذا قريبة جداً (30م)
    if (roadPriority === 3) {
      const veryCloseZone = zones.find((z) => z.distance < 30);
      if (veryCloseZone) {
        console.log(
          `⚠️  Very close ${veryCloseZone.type}: ${veryCloseZone.speedLimit} km/h`,
        );
        return veryCloseZone.speedLimit;
      }
      return baseSpeed;
    }

    // ✅ الطرق الثانوية والسكنية: تتأثر إذا قريبة (50م)
    const nearbyZone = zones.find((z) => z.distance < 50);
    if (nearbyZone) {
      console.log(
        `🏫 ${nearbyZone.type} detected (${nearbyZone.distance.toFixed(0)}m): ${nearbyZone.speedLimit} km/h`,
      );
      return nearbyZone.speedLimit;
    }

    return baseSpeed;
  }

  /**
   * حساب المسافة بين نقطتين
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

  async getSpeedLimitsForPath(coordinates) {
    try {
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        console.warn("Invalid coordinates array");
        return [];
      }

      console.log(`Getting speed limits for ${coordinates.length} points...`);
      return this.fallbackToIndividualRequests(coordinates);
    } catch (error) {
      console.error("Error getting speed limits:", error);
      return this.fallbackToIndividualRequests(coordinates);
    }
  }

  async fallbackToIndividualRequests(coordinates) {
    console.log("Using individual requests with smart fallback");

    const results = [];
    const batchSize = 3;

    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (coord) => {
          const cacheKey = speedLimitCache.generateKey(
            coord.latitude,
            coord.longitude,
          );
          const cached = speedLimitCache.get(cacheKey);

          if (cached !== null) {
            return {
              coordinate: coord,
              speedLimit: cached,
              source: "cache",
            };
          }

          const speedLimit = await this.getSpeedLimit(
            coord.latitude,
            coord.longitude,
          );

          return {
            coordinate: coord,
            speedLimit,
            source: "api",
          };
        }),
      );

      results.push(...batchResults);

      if (i + batchSize < coordinates.length) {
        await this.delay(1000);
      }
    }

    console.log(`Got ${results.length} speed limits`);
    return results;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  parseOSMSpeed(maxspeed) {
    const match = maxspeed.match(/(\d+)\s*(mph|kmh|km\/h)?/i);

    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2]?.toLowerCase();

      if (unit === "mph") {
        return Math.round(value * 1.60934);
      }

      return value;
    }

    return null;
  }

  getFallbackSpeedLimit() {
    return DEFAULT_SPEED_LIMITS.main_road;
  }

  async batchGetSpeedLimits(coordinates) {
    try {
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error("Invalid coordinates array");
      }

      const maxBatch = 10;
      const batch = coordinates.slice(0, maxBatch);

      const results = await Promise.all(
        batch.map((coord) =>
          this.getSpeedLimit(coord.latitude, coord.longitude),
        ),
      );

      return results;
    } catch (error) {
      console.error("Batch get error:", error);
      return [];
    }
  }

  getStats() {
    return {
      cache: speedLimitCache.getStats(),
      googleRateLimit: googleRoadsLimiter.getStats(),
      osmRateLimit: osmLimiter.getStats(),
    };
  }

  clearCache() {
    speedLimitCache.clear();
  }
}

const roadsAPIService = new RoadsAPIService();

export default roadsAPIService;
