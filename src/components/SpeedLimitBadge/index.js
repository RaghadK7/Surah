// src/components/SpeedLimitBadge/index.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

/**
 * مكون عرض حد السرعة (لوحة دائرية)
 */
const SpeedLimitBadge = ({ speedLimit }) => {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.number}>{speedLimit}</Text>
      </View>
      <Text style={styles.label}>الحد الأقصى</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    borderWidth: 6,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  label: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 8,
    fontWeight: '600',
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SpeedLimitBadge;