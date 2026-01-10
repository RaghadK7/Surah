import React from "react";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SettingsProvider>
      <AppNavigator />
    </SettingsProvider>
  );
}
