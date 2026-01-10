import React, { createContext, useState, useEffect, useContext } from "react";
import { settingsManager } from "../services/StorageService";

// Create context
const SettingsContext = createContext();

// Provider component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(settingsManager.DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load from storage
  const loadSettings = async () => {
    try {
      const savedSettings = await settingsManager.get();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Load settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update setting
  const updateSetting = async (key, value) => {
    try {
      // Validate input
      if (!key || value === undefined) {
        throw new Error("Invalid key or value");
      }

      // Update locally
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Save to storage
      await settingsManager.update(key, value);
      return true;
    } catch (error) {
      console.error("Update setting error:", error);
      return false;
    }
  };

  // Reset settings
  const resetSettings = async () => {
    try {
      await settingsManager.reset();
      setSettings(settingsManager.DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error("Reset settings error:", error);
      return false;
    }
  };

  const value = {
    settings,
    loading,
    updateSetting,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export default SettingsContext;
