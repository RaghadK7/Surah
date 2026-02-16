import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../config/colors";

const BottomNav = ({ activeTab = "map", onTabPress }) => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isDark } = useTheme();

  const getThemeColors = () => {
    if (isDark) {
      return {
        background: "#1C1C1E",
        border: "#2C2C2E",
        iconActive: "#FFFFFF",
        iconInactive: "#666666",
        textActive: "#FFFFFF",
        textInactive: "#888888",
        shadow: "rgba(0, 0, 0, 0.5)",
      };
    } else {
      return {
        background: "#FFFFFF",
        border: "#E5E5E5",
        iconActive: "#000000",
        iconInactive: "#999999",
        textActive: "#000000",
        textInactive: "#666666",
        shadow: "rgba(0, 0, 0, 0.1)",
      };
    }
  };

  const colors = getThemeColors();

  // Force tabs to re-evaluate when language change
  const tabs = React.useMemo(
    () => [
      { id: "map", icon: "🏠", label: t("nav.home") },
      { id: "stats", icon: "📈", label: t("nav.stats") },
      { id: "settings", icon: "⚙️", label: t("nav.settings") },
    ],
    [t, currentLanguage, i18n.language],
  );

  return (
    <View
      key={currentLanguage}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onTabPress?.(tab.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && [
                  styles.iconContainerActive,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  {
                    opacity: isActive ? 1 : 0.5,
                  },
                ]}
              >
                {tab.icon}
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: isActive ? colors.textActive : colors.textInactive },
                isActive && styles.navLabelActive,
              ]}
            >
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 100,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  navItemActive: {},
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  navLabelActive: {
    fontWeight: "700",
  },
});

export default BottomNav;
