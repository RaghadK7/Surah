import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";
import { styles } from "./styles";

const NotificationPermissionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  React.useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const requestNotificationPermission = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        Alert.alert(
          t("permissions.notification.success_title"),
          t("permissions.notification.success_message"),
          [
            {
              text: t("common.continue"),
              onPress: () => navigation.replace("Map"),
            },
          ]
        );
      } else {
        Alert.alert(
          t("permissions.notification.denied_title"),
          t("permissions.notification.denied_message"),
          [
            {
              text: t("common.ok"),
              onPress: () => navigation.replace("Map"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      Alert.alert(
        t("common.error"),
        t("permissions.notification.error_message"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      t("permissions.skip_title"),
      t("permissions.notification.skip_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("permissions.skip_confirm"),
          style: "destructive",
          onPress: () => navigation.replace("Map"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔔</Text>
        </View>

        <Text style={styles.title}>{t("permissions.notification.title")}</Text>
        <Text style={styles.subtitle}>
          {t("permissions.notification.subtitle")}
        </Text>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>
            {t("permissions.notification.description_title")}
          </Text>
          <Text style={styles.descriptionText}>
            {t("permissions.notification.description_text")}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.notification.feature_1")}
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.notification.feature_2")}
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.notification.feature_3")}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestNotificationPermission}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {loading
              ? t("permissions.requesting")
              : t("permissions.notification.allow_button")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            {t("permissions.skip_button")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.privacyNote}>{t("permissions.privacy_note")}</Text>
      </View>
    </View>
  );
};

export default NotificationPermissionScreen;