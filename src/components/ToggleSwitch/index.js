import React from "react";
import { Switch, Platform } from "react-native";
import { COLORS } from "../../config/colors";

const ToggleSwitch = ({ value, onValueChange, disabled = false }) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: COLORS.gray300,
        true: COLORS.primary,
      }}
      thumbColor={
        Platform.OS === "ios"
          ? COLORS.white
          : value
          ? COLORS.white
          : COLORS.gray100
      }
      ios_backgroundColor={COLORS.gray300}
    />
  );
};

export default ToggleSwitch;
