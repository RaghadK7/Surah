import ENV from "../config/env";
import { speedLimitCache } from "../utils/cacheManager";
import { googleRoadsLimiter, osmLimiter } from "../utils/rateLimiter.js";
import { DEFAULT_SPEED_LIMITS } from "../config/constants";

class RoadsAPIService {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
  }

  // Main method to get speed limit
  async getSpeedLimit(latitude, longitude) {
    try {
      // Validate input
      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error("Invalid coordinates");
      }

      // Check cache first
      const cacheKey = speedLimitCache.generateKey(latitude, longitude);
      const cached = speedLimitCache.get(cacheKey);

      if (cached !== null) {
        return cached;
      }

      // Try Google Roads API
      if (ENV.GOOGLE_ROADS_API_KEY) {
        const googleResult = await this.fetchFromGoogleRoads(
          latitude,
          longitude
        );
        if (googleResult !== null) {
          speedLimitCache.set(cacheKey, googleResult);
          return googleResult;
        }
      }

      // Fallback to OpenStreetMap
      const osmResult = await this.fetchFromOSM(latitude, longitude);
      if (osmResult !== null) {
        speedLimitCache.set(cacheKey, osmResult);
        return osmResult;
      }

      // Final fallback to default
      const fallback = this.getFallbackSpeedLimit();
      speedLimitCache.set(cacheKey, fallback);
      return fallback;
    } catch (error) {
      console.error("Get speed limit error:", error);
      return this.getFallbackSpeedLimit();
    }
  }

  // Validate coordinates
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

  // Fetch from Google Roads API
  async fetchFromGoogleRoads(latitude, longitude) {
    try {
      // Check rate limit
      if (!googleRoadsLimiter.canMakeRequest()) {
        console.warn("Google Roads rate limit reached");
        return null;
      }

      const url = `${ENV.GOOGLE_ROADS_API_URL}?path=${latitude},${longitude}&key=${ENV.GOOGLE_ROADS_API_KEY}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV.REQUEST_TIMEOUT
      );

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      if (data.speedLimits && data.speedLimits.length > 0) {
        const speedLimit = data.speedLimits[0].speedLimit;
        return this.convertToKmh(speedLimit, data.speedLimits[0].units);
      }

      return null;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Google Roads request timeout");
      } else {
        console.error("Google Roads error:", error);
      }
      return null;
    }
  }

  // Fetch from OpenStreetMap
  async fetchFromOSM(latitude, longitude) {
    try {
      // Check rate limit
      if (!osmLimiter.canMakeRequest()) {
        console.warn("OSM rate limit reached");
        return null;
      }

      // OSM Overpass query
      const query = `
        [out:json][timeout:5];
        way(around:50,${latitude},${longitude})["maxspeed"];
        out body;
      `;

      const url = `${ENV.OSM_OVERPASS_API_URL}?data=${encodeURIComponent(
        query
      )}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ENV.REQUEST_TIMEOUT
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

      // Parse response
      if (data.elements && data.elements.length > 0) {
        const element = data.elements[0];
        const maxspeed = element.tags?.maxspeed;

        if (maxspeed) {
          return this.parseOSMSpeed(maxspeed);
        }
      }

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

  // Convert speed to km/h
  convertToKmh(speed, unit) {
    if (unit === "MPH") {
      return Math.round(speed * 1.60934);
    }
    return speed;
  }

  // Parse OSM speed format
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
    // Return safe default
    return DEFAULT_SPEED_LIMITS.main_road;
  }

  async batchGetSpeedLimits(coordinates) {
    try {
      // Validate input
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error("Invalid coordinates array");
      }

      // Limit batch size
      const maxBatch = 10;
      const batch = coordinates.slice(0, maxBatch);

      // Process in parallel with rate limiting
      const results = await Promise.all(
        batch.map((coord) =>
          this.getSpeedLimit(coord.latitude, coord.longitude)
        )
      );

      return results;
    } catch (error) {
      console.error("Batch get error:", error);
      return [];
    }
  }

  // Get service stats
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
