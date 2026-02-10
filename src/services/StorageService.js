import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Keys
const KEYS = {
  USER_ID: "user_id",
  API_TOKEN: "api_token",

  SETTINGS: "app_settings",
  LANGUAGE: "app_language",
  THEME: "app_theme",

  // Permissions
  LOCATION_PERMISSION_GRANTED: "location_permission_granted",
  NOTIFICATION_PERMISSION_GRANTED: "notification_permission_granted",
  ONBOARDING_COMPLETE: "onboarding_complete",
};

export const secureStorage = {
  // Save encrypted data
  save: async (key, value) => {
    try {
      if (!key || value === undefined) {
        throw new Error("Invalid key or value");
      }
      await SecureStore.setItemAsync(key, String(value));
      return true;
    } catch (error) {
      console.error("Secure save error:", error);
      return false;
    }
  },

  // Get encrypted data
  get: async (key) => {
    try {
      if (!key) {
        throw new Error("Invalid key");
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Secure get error:", error);
      return null;
    }
  },

  // Delete encrypted data
  delete: async (key) => {
    try {
      if (!key) {
        throw new Error("Invalid key");
      }
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error("Secure delete error:", error);
      return false;
    }
  },
};

// Regular Storage (for non-sensitive data)
export const regularStorage = {
  // Save data
  save: async (key, value) => {
    try {
      if (!key || value === undefined) {
        throw new Error("Invalid key or value");
      }
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error("Storage save error:", error);
      return false;
    }
  },

  // Get data
  get: async (key) => {
    try {
      if (!key) {
        throw new Error("Invalid key");
      }
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  // Delete data
  delete: async (key) => {
    try {
      if (!key) {
        throw new Error("Invalid key");
      }
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage delete error:", error);
      return false;
    }
  },

  // Compatibility methods
  setItem: async (key, value) => {
    return await regularStorage.save(key, value);
  },

  getItem: async (key) => {
    return await regularStorage.get(key);
  },

  // Clear all
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },
};

// Settings Manager
export const settingsManager = {
  // Default settings
  DEFAULT_SETTINGS: {
    soundAlert: true,
    vibration: true,
    cameraAlerts: true,
    darkMode: false,
    keepScreenOn: true,
    unit: "kmh", // kmh or mph
    language: "ar", // ar or en
  },

  // Get settings
  get: async () => {
    try {
      const settings = await regularStorage.get(KEYS.SETTINGS);
      return settings || settingsManager.DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Get settings error:", error);
      return settingsManager.DEFAULT_SETTINGS;
    }
  },

  // Save settings
  save: async (settings) => {
    try {
      // Validate settings object
      if (!settings || typeof settings !== "object") {
        throw new Error("Invalid settings");
      }

      // Merge with defaults
      const mergedSettings = {
        ...settingsManager.DEFAULT_SETTINGS,
        ...settings,
      };

      return await regularStorage.save(KEYS.SETTINGS, mergedSettings);
    } catch (error) {
      console.error("Save settings error:", error);
      return false;
    }
  },

  // Update single setting
  update: async (key, value) => {
    try {
      const currentSettings = await settingsManager.get();
      currentSettings[key] = value;
      return await settingsManager.save(currentSettings);
    } catch (error) {
      console.error("Update setting error:", error);
      return false;
    }
  },

  // Reset to defaults
  reset: async () => {
    try {
      return await settingsManager.save(settingsManager.DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Reset settings error:", error);
      return false;
    }
  },
};

export default {
  secureStorage,
  regularStorage,
  settingsManager,
  KEYS,
};

// Permission manager for easier access
export const PermissionManager = {
  // Check if location permission has been granted before
  hasLocationPermission: async () => {
    try {
      const granted = await regularStorage.get(
        KEYS.LOCATION_PERMISSION_GRANTED,
      );
      return granted === "true";
    } catch (error) {
      console.error("Check location permission error:", error);
      return false;
    }
  },

  // Save location permission status
  setLocationPermission: async (granted) => {
    try {
      return await regularStorage.save(
        KEYS.LOCATION_PERMISSION_GRANTED,
        granted ? "true" : "false",
      );
    } catch (error) {
      console.error("Save location permission error:", error);
      return false;
    }
  },

  // Check if notification permission has been granted before
  hasNotificationPermission: async () => {
    try {
      const granted = await regularStorage.get(
        KEYS.NOTIFICATION_PERMISSION_GRANTED,
      );
      return granted === "true";
    } catch (error) {
      console.error("Check notification permission error:", error);
      return false;
    }
  },

  // Save notification permission status
  setNotificationPermission: async (granted) => {
    try {
      return await regularStorage.save(
        KEYS.NOTIFICATION_PERMISSION_GRANTED,
        granted ? "true" : "false",
      );
    } catch (error) {
      console.error("Save notification permission error:", error);
      return false;
    }
  },

  // Check if onboarding is complete
  isOnboardingComplete: async () => {
    try {
      const complete = await regularStorage.get(KEYS.ONBOARDING_COMPLETE);
      return complete === "true";
    } catch (error) {
      console.error("Check onboarding status error:", error);
      return false;
    }
  },

  // Mark onboarding as complete
  setOnboardingComplete: async () => {
    try {
      return await regularStorage.save(KEYS.ONBOARDING_COMPLETE, "true");
    } catch (error) {
      console.error("Save onboarding status error:", error);
      return false;
    }
  },

  // Reset all permissions (for testing/development)
  resetPermissions: async () => {
    try {
      await regularStorage.delete(KEYS.LOCATION_PERMISSION_GRANTED);
      await regularStorage.delete(KEYS.NOTIFICATION_PERMISSION_GRANTED);
      await regularStorage.delete(KEYS.ONBOARDING_COMPLETE);
      return true;
    } catch (error) {
      console.error("Reset permissions error:", error);
      return false;
    }
  },
};

// Export as named export for convenience
export const StorageService = regularStorage;
