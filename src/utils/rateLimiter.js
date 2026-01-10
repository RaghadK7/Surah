import ENV from "../config/env";

class RateLimiter {
  constructor(maxRequests = ENV.MAX_API_CALLS_PER_MINUTE) {
    this.maxRequests = maxRequests;
    this.requests = [];
    this.windowMs = 60000; // 1 minute
  }

  // Check if request allowed
  canMakeRequest() {
    const now = Date.now();

    // Remove old requests
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    // Check limit
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    this.requests.push(now);
    return true;
  }

  // Get remaining requests
  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  // Get time until next available slot
  getResetTime() {
    if (this.requests.length === 0) {
      return 0;
    }

    const oldest = this.requests[0];
    const resetTime = oldest + this.windowMs - Date.now();
    return Math.max(0, resetTime);
  }

  // Reset limiter
  reset() {
    this.requests = [];
  }

  // Get stats
  getStats() {
    return {
      used: this.requests.length,
      remaining: this.getRemaining(),
      limit: this.maxRequests,
      resetIn: this.getResetTime(),
    };
  }
}

export const googleRoadsLimiter = new RateLimiter();
export const osmLimiter = new RateLimiter(30); // Lower for free API

export default RateLimiter;
