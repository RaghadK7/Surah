import React, { createContext, useContext } from "react";
import { useSettings } from "./SettingsContext";

const ThemeContext = createContext();

// Light theme colors
const LIGHT_THEME = {
  // Background
  background: "#FFFFFF",
  surface: "#FFFFFF",
  cardBackground: "#FFFFFF",

  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textTertiary: "#999999",

  // Primary
  primary: "#007AFF",
  primaryLight: "#4A9EFE",

  // Status
  statusSafe: "#4CAF50",
  statusWarning: "#FF9800",
  statusDanger: "#F44336",

  // Gray
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#757575",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Shadows
  shadowColor: "#000000",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.2)",

  // Info card specific
  cardBorder: "#EEEEEE",
  cardShadow: "rgba(0, 0, 0, 0.15)",
};

// Dark theme colors
const DARK_THEME = {
  // Background
  background: "#121212",
  surface: "#1E1E1E",
  cardBackground: "#2D2D2D",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textTertiary: "#808080",

  // Primary
  primary: "#007AFF",
  primaryLight: "#4A9EFE",

  // Status
  statusSafe: "#66BB6A",
  statusWarning: "#FFB74D",
  statusDanger: "#EF5350",

  // Gray
  gray50: "#2D2D2D",
  gray100: "#383838",
  gray200: "#424242",
  gray300: "#4F4F4F",
  gray400: "#616161",
  gray500: "#757575",
  gray600: "#9E9E9E",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.7)",

  // Shadows
  shadowColor: "#000000",
  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowMedium: "rgba(0, 0, 0, 0.3)",
  shadowDark: "rgba(0, 0, 0, 0.5)",

  // Info card specific
  cardBorder: "#424242",
  cardShadow: "rgba(0, 0, 0, 0.3)",
};

export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();
  const isDark = settings?.darkMode || false;

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const value = {
    theme,
    isDark,
    colors: theme, // Alias for backward compatibility
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default ThemeContext;
