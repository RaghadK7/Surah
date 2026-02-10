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
        false: isDark ? "#757575" : "#BDBDBD", // OFF: رمادي داكن للدارك مود، فاتح للايت مود
        true: "#4CAF50", // ON: أخضر
      }}
      thumbColor={
        Platform.OS === "ios"
          ? COLORS.white
          : value
          ? COLORS.white
          : isDark 
            ? "#FFFFFF"  // الـ thumb أبيض في الدارك مود
            : "#F5F5F5"  // الـ thumb رمادي فاتح في الايت مود
      }
      ios_backgroundColor={isDark ? "#757575" : "#BDBDBD"}
    />
  );
};

export default ToggleSwitch;
