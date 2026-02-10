import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import { styles } from "./styles";

const LocationPermissionScreen = ({ navigation }) => {
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

  const requestLocationPermission = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        Alert.alert(
          t("permissions.location.success_title"),
          t("permissions.location.success_message"),
          [
            {
              text: t("common.continue"),
              onPress: () => navigation.replace("NotificationPermission"),
            },
          ]
        );
      } else {
        Alert.alert(
          t("permissions.location.denied_title"),
          t("permissions.location.denied_message"),
          [
            {
              text: t("common.ok"),
              onPress: () => navigation.replace("NotificationPermission"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Location permission error:", error);
      Alert.alert(
        t("common.error"),
        t("permissions.location.error_message"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      t("permissions.skip_title"),
      t("permissions.location.skip_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("permissions.skip_confirm"),
          style: "destructive",
          onPress: () => navigation.replace("NotificationPermission"),
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
          <Text style={styles.iconText}>📍</Text>
        </View>

        <Text style={styles.title}>{t("permissions.location.title")}</Text>
        <Text style={styles.subtitle}>
          {t("permissions.location.subtitle")}
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
            {t("permissions.location.description_title")}
          </Text>
          <Text style={styles.descriptionText}>
            {t("permissions.location.description_text")}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.location.feature_1")}
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.location.feature_2")}
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>
            <Text style={styles.featureText}>
              {t("permissions.location.feature_3")}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestLocationPermission}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {loading
              ? t("permissions.requesting")
              : t("permissions.location.allow_button")}
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

export default LocationPermissionScreen;