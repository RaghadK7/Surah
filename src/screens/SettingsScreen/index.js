// src/screens/SettingsScreen/index.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { AntDesign } from "@expo/vector-icons";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { styles } from "./styles";
import { useSettings } from "../../contexts/SettingsContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage, LANGUAGES } from "../../contexts/LanguageContext";
import ToggleSwitch from "../../components/ToggleSwitch";
import BottomNav from "../../components/BottomNav";

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const {
    currentLanguage,
    languages,
    changeLanguage,
    toggleLanguage,
    forceUpdate,
  } = useLanguage();
  const { settings, loading, updateSetting, resetSettings } = useSettings();

  // User state
  const [currentUser, setCurrentUser] = useState(null);

  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Force re-render when language changes
  useEffect(() => {
    console.log("🔄 SettingsScreen: Language changed, re-rendering...");
    setRenderKey((prev) => prev + 1);
  }, [currentLanguage, forceUpdate, i18n.language]);

  // Handle tab navigation
  const handleTabPress = (tabId) => {
    if (tabId === "map") {
      navigation.navigate("Map");
    } else if (tabId === "stats") {
      navigation.navigate("Statistics");
    }
  };

  // Handle language change
  const handleLanguageChange = async (languageCode) => {
    console.log(`🌐 Attempting to change language to: ${languageCode}`);
    const success = await changeLanguage(languageCode);

    if (success) {
      setShowLanguageModal(false);
      setTimeout(() => {
        Alert.alert(t("common.success"), t("settings.language_changed"), [
          { text: t("common.ok") },
        ]);
      }, 100);
    } else {
      Alert.alert(t("common.error"), "Failed to change language", [
        { text: t("common.ok") },
      ]);
    }
  };

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return "U";
    if (user.displayName) {
      const names = user.displayName.split(" ");
      return names.length > 1 
        ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
        : names[0].charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get username from email
  const getUsernameFromEmail = (user) => {
    if (!user?.email) return "";
    // استخراج الجزء الأول من الإيميل قبل @
    const emailParts = user.email.split("@");
    if (emailParts.length > 0) {
      // تحويل أول حرف لكبير والباقي صغير
      const username = emailParts[0];
      return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    }
    return user.email;
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      t("settings.logout"),
      t("settings.logout_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(t("common.error"), t("settings.logout_error"), [
                { text: t("common.ok") },
              ]);
            }
          },
        },
      ]
    );
  };

  // Handle theme change
  const handleThemeChange = async (isDarkMode) => {
    const success = await updateSetting("darkMode", isDarkMode);
    if (success) {
      Alert.alert(t("common.success"), t("settings.theme_changed"), [
        { text: t("common.ok") },
      ]);
    }
  };

  // Handle reset
  const handleReset = () => {
    Alert.alert(t("settings.reset"), t("settings.reset_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.reset"),
        style: "destructive",
        onPress: async () => {
          const success = await resetSettings();
          if (success) {
            Alert.alert(t("common.success"), t("settings.reset_success"), [
              { text: t("common.ok") },
            ]);
          }
        },
      },
    ]);
  };

  // ========== ✅ DYNAMIC THEME COLORS ==========
  const getThemeColors = () => {
    if (isDark) {
      return {
        background: "#0A0A0A",
        headerBg: "#0A0A0A",
        headerText: "#FFFFFF",
        headerSubtext: "#AAAAAA",
        cardBg: "#1C1C1E",
        cardBgHover: "#2C2C2E",
        text: "#FFFFFF",
        textSecondary: "#AAAAAA",
        border: "#2C2C2E",
        iconBg: "#2C2C2E",
        shadow: "rgba(0, 0, 0, 0.4)",
        modalOverlay: "rgba(0, 0, 0, 0.8)",
        modalBg: "#1C1C1E",
        selectedCardBg: "#2A2A2C",
        selectedBorder: "#FFFFFF",
        checkmark: "#FFFFFF",
      };
    } else {
      return {
        background: "#F8F9FA",
        headerBg: "#F8F9FA",
        headerText: "#000000",
        headerSubtext: "#666666",
        cardBg: "#FFFFFF",
        cardBgHover: "#F5F5F5",
        text: "#000000",
        textSecondary: "#666666",
        border: "#E5E5E5",
        iconBg: "#F5F5F5",
        shadow: "rgba(0, 0, 0, 0.1)",
        modalOverlay: "rgba(0, 0, 0, 0.6)",
        modalBg: "#FFFFFF",
        selectedCardBg: "#F0F0F2",
        selectedBorder: "#000000",
        checkmark: "#000000",
      };
    }
  };

  const colors = getThemeColors();

  // Language Modal
  const LanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("settings.language_settings")}
            </Text>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.iconBg },
              ]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text
                style={[styles.modalCloseText, { color: colors.textSecondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {languages.map((language) => {
              const isSelected = currentLanguage === language.code;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: isSelected
                        ? colors.selectedCardBg
                        : colors.cardBg,
                      borderColor: isSelected
                        ? colors.selectedBorder
                        : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        {
                          color: isSelected
                            ? colors.selectedBorder
                            : colors.text,
                        },
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.languageCode,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {language.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text
                      style={[styles.checkmark, { color: colors.checkmark }]}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Theme Modal
  const ThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("settings.theme_settings")}
            </Text>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.iconBg },
              ]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text
                style={[styles.modalCloseText, { color: colors.textSecondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Light Mode Card */}
            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: !isDark
                    ? colors.selectedCardBg
                    : colors.cardBg,
                  borderColor: !isDark ? colors.selectedBorder : colors.border,
                  borderWidth: !isDark ? 2 : 1,
                },
              ]}
              onPress={() => {
                handleThemeChange(false);
                setShowThemeModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.themeIcon}>☀️</Text>
              <View style={styles.themeInfo}>
                <Text
                  style={[
                    styles.themeName,
                    { color: !isDark ? colors.selectedBorder : colors.text },
                  ]}
                >
                  {t("settings.light_mode")}
                </Text>
                <Text
                  style={[styles.themeDesc, { color: colors.textSecondary }]}
                >
                  {t("settings.light_mode_desc")}
                </Text>
              </View>
              {!isDark && (
                <Text style={[styles.checkmark, { color: colors.checkmark }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Dark Mode Card */}
            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: isDark
                    ? colors.selectedCardBg
                    : colors.cardBg,
                  borderColor: isDark ? colors.selectedBorder : colors.border,
                  borderWidth: isDark ? 2 : 1,
                },
              ]}
              onPress={() => {
                handleThemeChange(true);
                setShowThemeModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.themeIcon}>🌙</Text>
              <View style={styles.themeInfo}>
                <Text
                  style={[
                    styles.themeName,
                    { color: isDark ? colors.selectedBorder : colors.text },
                  ]}
                >
                  {t("settings.dark_mode")}
                </Text>
                <Text
                  style={[styles.themeDesc, { color: colors.textSecondary }]}
                >
                  {t("settings.dark_mode_desc")}
                </Text>
              </View>
              {isDark && (
                <Text style={[styles.checkmark, { color: colors.checkmark }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render setting item
  const renderSettingItem = (config) => {
    const {
      icon,
      title,
      description,
      type = "toggle",
      settingKey,
      onPress,
      isLast = false,
    } = config;

    return (
      <TouchableOpacity
        style={[
          styles.settingItem,
          isLast && styles.settingItemLast,
          { backgroundColor: colors.cardBg },
        ]}
        onPress={onPress}
        activeOpacity={type === "toggle" ? 1 : 0.7}
        disabled={type === "toggle"}
      >
        <View style={[styles.settingIcon, { backgroundColor: colors.iconBg }]}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>

        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              {description}
            </Text>
          )}
        </View>

        {type === "toggle" && (
          <ToggleSwitch
            value={settings[settingKey]}
            onValueChange={(value) => updateSetting(settingKey, value)}
          />
        )}

        {type === "navigation" && (
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>
            ›
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View
      key={`settings-${currentLanguage}`}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {t("settings.title")}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerSubtext }]}>
          {t("settings.subtitle")}
        </Text>
      </View>

      {/* User Profile Section */}
      {currentUser && (
        <View style={[styles.userSectionCompact, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.userInfoCompact}>
            {/* User Avatar */}
            <View style={[styles.userAvatarCompact, { backgroundColor: "#007AFF" }]}>
              <Text style={styles.userAvatarTextCompact}>
                {getUserInitials(currentUser)}
              </Text>
            </View>
            
            {/* User Details */}
            <View style={styles.userDetailsCompact}>
              <Text style={[styles.userNameCompact, { color: colors.text }]}>
                {getUsernameFromEmail(currentUser)}
              </Text>
              <Text style={[styles.userEmailCompact, { color: colors.textSecondary }]}>
                {currentUser.email || ""}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("settings.general")}
            </Text>
          </View>

          {renderSettingItem({
            icon: "🌐",
            title: t("settings.language"),
            description: currentLanguage === "ar" ? "عربي" : "English",
            type: "navigation",
            onPress: () => setShowLanguageModal(true),
          })}
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("settings.display")}
            </Text>
          </View>

          {renderSettingItem({
            icon: isDark ? "🌙" : "☀️",
            title: isDark ? t("settings.dark_mode") : t("settings.light_mode"),
            description: isDark
              ? t("settings.dark_mode_desc")
              : t("settings.light_mode_desc"),
            type: "navigation",
            onPress: () => setShowThemeModal(true),
          })}

          {renderSettingItem({
            icon: "📱",
            title: t("settings.keep_screen_on"),
            description: t("settings.keep_screen_on_desc"),
            settingKey: "keepScreenOn",
            isLast: true,
          })}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("settings.notifications")}
            </Text>
          </View>

          {renderSettingItem({
            icon: "🔊",
            title: t("settings.sound_alert"),
            description: t("settings.sound_alert_desc"),
            settingKey: "soundAlert",
          })}

          {renderSettingItem({
            icon: "📳",
            title: t("settings.vibration"),
            description: t("settings.vibration_desc"),
            settingKey: "vibration",
          })}

          {renderSettingItem({
            icon: "📷",
            title: t("settings.camera_alerts"),
            description: t("settings.camera_alerts_desc"),
            settingKey: "cameraAlerts",
            isLast: true,
          })}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("settings.general")}
            </Text>
          </View>

          {renderSettingItem({
            icon: "📏",
            title: t("settings.unit"),
            description:
              settings.unit === "kmh"
                ? t("settings.unit_kmh")
                : t("settings.unit_mph"),
            type: "navigation",
            onPress: () => {
              Alert.alert(t("settings.unit_title"), t("settings.unit_select"), [
                {
                  text: t("settings.unit_kmh"),
                  onPress: () => updateSetting("unit", "kmh"),
                },
                {
                  text: t("settings.unit_mph"),
                  onPress: () => updateSetting("unit", "mph"),
                },
                {
                  text: t("common.cancel"),
                  style: "cancel",
                },
              ]);
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
            <Text style={styles.resetButtonText}>{t("settings.reset")}</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          {currentUser && (
            <TouchableOpacity
              style={[styles.logoutButtonSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.logoutButtonContent}>
                <AntDesign name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutButtonText}>
                  {t("settings.logout")}
                </Text>
              </View>
              <AntDesign name="right" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {t("app_name")} {t("settings.version")} 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <LanguageModal />
      <ThemeModal />

      {/* Bottom Navigation */}
      <BottomNav activeTab="settings" onTabPress={handleTabPress} />
    </View>
  );
};

export default SettingsScreen;
