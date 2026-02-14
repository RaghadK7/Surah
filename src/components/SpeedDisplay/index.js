import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../config/colors";
import { formatSpeed, getSpeedColor } from "../../utils/speedCalculator";

const SpeedDisplay = ({ speed, status }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const speedColor = getSpeedColor(status, COLORS);
  const displaySpeed = formatSpeed(speed);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      <Text style={[styles.speed, { color: speedColor }]}>{displaySpeed}</Text>
      <Text style={[styles.unit, { color: theme.textSecondary }]}>km/h</Text>
      <Text style={[styles.label, { color: theme.textTertiary }]}>
        {t("map.current_speed")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
  },
  speed: {
    fontSize: 56,
    fontWeight: "bold",
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
});

export default SpeedDisplay;
