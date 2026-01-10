const ENV = {
  // API Keys
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
  GOOGLE_ROADS_API_KEY: process.env.GOOGLE_ROADS_API_KEY || "",

  // API URLs
  GOOGLE_ROADS_API_URL: "https://roads.googleapis.com/v1/speedLimits",
  OSM_OVERPASS_API_URL: "https://overpass-api.de/api/interpreter",

  // Rate limiting (requests per minute)
  MAX_API_CALLS_PER_MINUTE: 60,

  // Cache settings (milliseconds)
  CACHE_DURATION: 3600000, // 1 hour
  MAX_CACHE_SIZE: 1000, // Max cached locations

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Request timeout
  REQUEST_TIMEOUT: 10000, // 10 seconds

  // Validation
  isConfigured: function () {
    return Boolean(this.GOOGLE_ROADS_API_KEY || this.OSM_OVERPASS_API_URL);
  },
};

// Validate on load
if (!ENV.isConfigured() && __DEV__) {
  console.warn("API keys not configured. Using fallback.");
}

export default ENV;
