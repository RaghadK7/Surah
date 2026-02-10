import React from "react";
import "./src/locales/i18n"; // Initialize i18n
import { SettingsProvider } from "./src/contexts/SettingsContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
