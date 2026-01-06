// src/components/SpeedDisplay/index.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';
import { formatSpeed, getSpeedColor } from '../../utils/speedCalculator';

/**
 * مكون عرض السرعة الحالية
 */
const SpeedDisplay = ({ speed, status }) => {
  const speedColor = getSpeedColor(status, COLORS);
  const displaySpeed = formatSpeed(speed);

  return (
    <View style={styles.container}>
      <Text style={[styles.speed, { color: speedColor }]}>
        {displaySpeed}
      </Text>
      <Text style={styles.unit}>كم/س</Text>
      <Text style={styles.label}>سرعتك الحالية</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.gray100,
  },
  speed: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    color: COLORS.gray600,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray500,
  },
});

export default SpeedDisplay;