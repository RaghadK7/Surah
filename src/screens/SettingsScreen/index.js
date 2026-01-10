// src/screens/SettingsScreen/index.js

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './styles';
import { COLORS } from '../../config/colors';
import { useSettings } from '../../contexts/SettingsContext';
import ToggleSwitch from '../../components/ToggleSwitch';
import BottomNav from '../../components/BottomNav';

const SettingsScreen = ({ navigation }) => {
  const { settings, loading, updateSetting, resetSettings } = useSettings();

  // Handle tab navigation
  const handleTabPress = (tabId) => {
    if (tabId === 'map') {
      navigation.navigate('Map');
    } else if (tabId === 'stats') {
      Alert.alert('الإحصائيات', 'قريباً');
    }
  };

  // Handle reset
  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد؟ سيتم استعادة الإعدادات الافتراضية',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            const success = await resetSettings();
            if (success) {
              Alert.alert('تم', 'تم إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  // Render setting item
  const renderSettingItem = (config) => {
    const {
      icon,
      title,
      description,
      type = 'toggle',
      settingKey,
      onPress,
      isLast = false,
    } = config;

    return (
      <TouchableOpacity
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={onPress}
        activeOpacity={type === 'toggle' ? 1 : 0.7}
        disabled={type === 'toggle'}
      >
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>

        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>

        {type === 'toggle' && (
          <ToggleSwitch
            value={settings[settingKey]}
            onValueChange={(value) => updateSetting(settingKey, value)}
          />
        )}

        {type === 'navigation' && (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <Text style={styles.headerSubtitle}>تخصيص تجربتك</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>التنبيهات</Text>
          </View>

          {renderSettingItem({
            icon: '🔊',
            title: 'تنبيه صوتي',
            description: 'صوت عند تجاوز السرعة',
            settingKey: 'soundAlert',
          })}

          {renderSettingItem({
            icon: '📳',
            title: 'اهتزاز',
            description: 'اهتزاز عند التحذير',
            settingKey: 'vibration',
          })}

          {renderSettingItem({
            icon: '📷',
            title: 'تنبيه الكاميرات',
            description: 'تنبيه عند الاقتراب من ساهر',
            settingKey: 'cameraAlerts',
            isLast: true,
          })}
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>العرض</Text>
          </View>

          {renderSettingItem({
            icon: '🌙',
            title: 'الوضع الليلي',
            description: 'مظهر داكن',
            settingKey: 'darkMode',
          })}

          {renderSettingItem({
            icon: '📱',
            title: 'إبقاء الشاشة مضاءة',
            description: 'منع القفل أثناء القيادة',
            settingKey: 'keepScreenOn',
            isLast: true,
          })}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>عام</Text>
          </View>

          {renderSettingItem({
            icon: '📏',
            title: 'وحدة القياس',
            description: `${settings.unit === 'kmh' ? 'كم/س' : 'ميل/س'}`,
            type: 'navigation',
            onPress: () => {
              Alert.alert(
                'وحدة القياس',
                'اختر وحدة القياس',
                [
                  {
                    text: 'كيلومتر/ساعة',
                    onPress: () => updateSetting('unit', 'kmh'),
                  },
                  {
                    text: 'ميل/ساعة',
                    onPress: () => updateSetting('unit', 'mph'),
                  },
                  { text: 'إلغاء', style: 'cancel' },
                ]
              );
            },
          })}

          {renderSettingItem({
            icon: '🌐',
            title: 'اللغة',
            description: settings.language === 'ar' ? 'العربية' : 'English',
            type: 'navigation',
            onPress: () => {
              Alert.alert(
                'اللغة',
                'اختر لغة التطبيق',
                [
                  {
                    text: 'العربية',
                    onPress: () => updateSetting('language', 'ar'),
                  },
                  {
                    text: 'English',
                    onPress: () => updateSetting('language', 'en'),
                  },
                  { text: 'إلغاء', style: 'cancel' },
                ]
              );
            },
            isLast: true,
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>إعادة تعيين الإعدادات</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>سُرعة v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="settings" onTabPress={handleTabPress} />
    </View>
  );
};

export default SettingsScreen;