import Constants from "expo-constants";

const ENV = {
  // API Keys - SECURE VERSION (no hardcoded values)
  GOOGLE_MAPS_API_KEY:
    Constants.expoConfig?.extra?.googleMapsApiKey ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  GOOGLE_ROADS_API_KEY:
    Constants.expoConfig?.extra?.googleRoadsApiKey ||
    process.env.EXPO_PUBLIC_GOOGLE_ROADS_API_KEY,

  // Google OAuth - for Authentication
  GOOGLE_WEB_CLIENT_ID:
    Constants.expoConfig?.extra?.googleWebClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "165501651858-vegl69tgtb79up5b3jrb1pe81pt23fni.apps.googleusercontent.com",
  GOOGLE_ANDROID_CLIENT_ID:
    Constants.expoConfig?.extra?.googleAndroidClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    "165501651858-qs3kh46cl49oh8rlihfbvoc8gomc7rg9.apps.googleusercontent.com",
  GOOGLE_IOS_CLIENT_ID:
    Constants.expoConfig?.extra?.googleIosClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,

  // Firebase - Load from environment only
  FIREBASE_API_KEY:
    Constants.expoConfig?.extra?.firebaseApiKey ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID:
    Constants.expoConfig?.extra?.firebaseProjectId ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID:
    Constants.expoConfig?.extra?.firebaseAppId ||
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID:
    Constants.expoConfig?.extra?.firebaseMeasurementId ||
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,

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

  // Security Validation
  isConfigured: function () {
    return Boolean(
      this.GOOGLE_MAPS_API_KEY &&
      this.FIREBASE_API_KEY &&
      this.FIREBASE_PROJECT_ID,
    );
  },

  // Validate required keys are present
  validateSecurity: function () {
    const requiredKeys = [
      "GOOGLE_MAPS_API_KEY",
      "FIREBASE_API_KEY",
      "FIREBASE_PROJECT_ID",
    ];

    const missing = requiredKeys.filter((key) => !this[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }

    return true;
  },
};

// Validate security on load
try {
  ENV.validateSecurity();
} catch (error) {
  if (__DEV__) {
    console.error("Security validation failed:", error.message);
  }
}

export default ENV;
