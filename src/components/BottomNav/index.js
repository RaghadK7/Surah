// src/components/BottomNav/index.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../config/colors';

/**
 * مكون شريط التنقل السفلي
 */
const BottomNav = ({ activeTab = 'map', onTabPress }) => {
  const tabs = [
    { id: 'map', icon: '🏠', label: 'الرئيسية' },
    { id: 'stats', icon: '📊', label: 'الإحصائيات' },
    { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress?.(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[
              styles.navLabel,
              isActive && styles.navLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navItemActive: {
    // يمكن إضافة تأثير
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default BottomNav;