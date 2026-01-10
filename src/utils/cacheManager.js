import ENV from "../config/env";

class CacheManager {
  constructor(maxSize = ENV.MAX_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  // Generate cache key from coordinates
  generateKey(latitude, longitude, precision = 3) {
    const lat = latitude.toFixed(precision);
    const lng = longitude.toFixed(precision);
    return `${lat},${lng}`;
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data;
  }

  set(key, data, duration = ENV.CACHE_DURATION) {
    // Validate input
    if (!key || data === undefined) {
      return false;
    }

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + duration,
      timestamp: Date.now(),
    });

    return true;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: ((this.cache.size / this.maxSize) * 100).toFixed(2),
    };
  }
}

export const speedLimitCache = new CacheManager();

export default CacheManager;
