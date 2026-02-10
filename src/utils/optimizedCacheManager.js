// src/utils/optimizedCacheManager.js
import ENV from "../config/env";

class OptimizedCacheManager {
  constructor(maxSize = ENV.MAX_CACHE_SIZE || 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Generate optimized cache key with lower precision for better hit rate
  generateKey(latitude, longitude, precision = 2) {
    const lat = latitude.toFixed(precision);
    const lng = longitude.toFixed(precision);
    return `${lat},${lng}`;
  }

  // Get with automatic cleanup of expired items
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.missCount++;
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    this.hitCount++;

    return item.data;
  }

  // Batch get for multiple locations
  getMultiple(keys) {
    return keys.map(key => ({
      key,
      data: this.get(key)
    })).filter(item => item.data !== null);
  }

  // Set with automatic cleanup
  set(key, data, duration = ENV.CACHE_DURATION || 3600000) { // 1 hour default
    if (!key || data === undefined) {
      return false;
    }

    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + duration,
      timestamp: Date.now(),
      hitCount: 0
    });

    return true;
  }

  // Batch set for multiple items
  setMultiple(items, duration) {
    items.forEach(({ key, data }) => {
      this.set(key, data, duration);
    });
  }

  // Smart cleanup - remove oldest 25% when full
  cleanup() {
    const entries = Array.from(this.cache.entries());
    const toRemove = Math.floor(entries.length * 0.25);
    
    // Sort by access time (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  // Get cache statistics
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: ((this.cache.size / this.maxSize) * 100).toFixed(2),
      hitRate: `${hitRate}%`,
      hitCount: this.hitCount,
      missCount: this.missCount
    };
  }

  // Clear expired entries
  clearExpired() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  // Get nearby cached items (useful for location-based data)
  getNearby(latitude, longitude, radiusKm = 1, maxResults = 10) {
    const results = [];
    const targetLat = parseFloat(latitude);
    const targetLng = parseFloat(longitude);

    for (const [key, item] of this.cache) {
      if (Date.now() > item.expiry) continue;

      const [lat, lng] = key.split(',').map(parseFloat);
      const distance = this.calculateDistance(targetLat, targetLng, lat, lng);

      if (distance <= radiusKm) {
        results.push({
          key,
          data: item.data,
          distance,
          age: Date.now() - item.timestamp
        });
      }

      if (results.length >= maxResults) break;
    }

    // Sort by distance
    return results.sort((a, b) => a.distance - b.distance);
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Enhanced road speed cache with nearby lookup
class RoadSpeedCache extends OptimizedCacheManager {
  constructor() {
    super(500); // Smaller cache size for speed data
    this.roadNameCache = new Map();
  }

  getSpeedLimit(latitude, longitude, checkNearby = true) {
    // Try exact match first
    const key = this.generateKey(latitude, longitude);
    let result = this.get(key);

    if (result !== null) {
      return result;
    }

    // If no exact match, try nearby locations (within 500m)
    if (checkNearby) {
      const nearby = this.getNearby(latitude, longitude, 0.5, 3);
      if (nearby.length > 0) {
        // Return the closest cached speed limit
        return nearby[0].data;
      }
    }

    return null;
  }

  setSpeedLimit(latitude, longitude, speedLimit, roadName = null, confidence = 1.0) {
    const key = this.generateKey(latitude, longitude);
    
    // Store speed limit with metadata
    const data = {
      speedLimit,
      roadName,
      confidence,
      timestamp: Date.now()
    };

    // Cache for longer if confidence is high
    const duration = confidence >= 0.8 ? 7200000 : 3600000; // 2 hours vs 1 hour
    
    return this.set(key, data, duration);
  }

  // Cache road names separately for faster lookup
  setRoadName(latitude, longitude, roadName, roadType = null) {
    const key = this.generateKey(latitude, longitude, 1); // Lower precision for road names
    this.roadNameCache.set(key, {
      roadName,
      roadType,
      timestamp: Date.now(),
      expiry: Date.now() + 3600000 // 1 hour
    });
  }

  getRoadName(latitude, longitude) {
    const key = this.generateKey(latitude, longitude, 1);
    const item = this.roadNameCache.get(key);
    
    if (!item || Date.now() > item.expiry) {
      this.roadNameCache.delete(key);
      return null;
    }
    
    return item.roadName;
  }

  // Clean up road name cache periodically
  cleanupRoadNames() {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, item] of this.roadNameCache) {
      if (now > item.expiry) {
        this.roadNameCache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }

  // Enhanced stats including road name cache
  getStats() {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      roadNameCacheSize: this.roadNameCache.size,
      totalCacheSize: this.cache.size + this.roadNameCache.size
    };
  }
}

export const optimizedSpeedLimitCache = new RoadSpeedCache();
export const routeCache = new OptimizedCacheManager(200); // For route data

export default OptimizedCacheManager;