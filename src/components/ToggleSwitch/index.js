import React from "react";
import { Switch, Platform } from "react-native";
import { COLORS } from "../../config/colors";
import { useTheme } from "../../contexts/ThemeContext";

const ToggleSwitch = ({ value, onValueChange, disabled = false }) => {
  const { isDark } = useTheme();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: isDark ? "#757575" : "#BDBDBD", // OFF
        true: "#4CAF50", // ON
      }}
      thumbColor={
        Platform.OS === "ios"
          ? COLORS.white
          : value
            ? COLORS.white
            : isDark
              ? "#FFFFFF"
              : "#F5F5F5" // light grey
      }
      ios_backgroundColor={isDark ? "#757575" : "#BDBDBD"}
    />
  );
};

export default ToggleSwitch;
