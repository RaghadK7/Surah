import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { styles } from "./styles";
import { COLORS } from "../../config/colors";

const PermissionsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);

  // Check Permissions when open the app
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check Permissions States
  const checkPermissions = async () => {
    try {
      // Check Permissions "Location"
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationGranted(locationStatus.status === "granted");

      // Check Permissions "Notifications"
      const notificationStatus = await Notifications.getPermissionsAsync();
      setNotificationGranted(notificationStatus.status === "granted");
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  // Permissions Request
  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setLocationGranted(true);
      } else {
        Alert.alert(
          "الإذن مرفوض",
          "لن يتمكن التطبيق من العمل بدون إذن الموقع. يمكنك تفعيله من الإعدادات.",
          [{ text: "حسناً" }]
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء طلب الإذن");
    } finally {
      setLoading(false);
    }
  };

  // Notification Request
  const requestNotificationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        setNotificationGranted(true);
      } else {
        Alert.alert(
          "الإذن مرفوض",
          "لن تتلقى تنبيهات عند تجاوز السرعة. يمكنك تفعيله لاحقاً من الإعدادات.",
          [{ text: "حسناً" }]
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء طلب الإذن");
    } finally {
      setLoading(false);
    }
  };

  // Moving to next page
  const handleContinue = () => {
    if (locationGranted) {
      // Move to the main page "Map"

      navigation.replace("Map");
    } else {
      Alert.alert(
        "إذن الموقع مطلوب",
        "يجب السماح بالوصول للموقع لكي يعمل التطبيق",
        [{ text: "حسناً" }]
      );
    }
  };

  // Skip "While Developing"
  const handleSkip = () => {
    Alert.alert(
      "تخطي الأذونات؟",
      "لن يعمل التطبيق بشكل صحيح بدون الأذونات المطلوبة",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تخطي",
          style: "destructive",
          onPress: () => navigation.replace("Splash"),
        },
      ]
    );
  };

  // Permisssions Styles
  const renderPermissionCard = (config) => {
    const {
      icon,
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      granted,
      onPress,
    } = config;

    return (
      <TouchableOpacity
        style={[styles.permissionCard, granted && styles.permissionCardGranted]}
        onPress={granted ? null : onPress}
        activeOpacity={granted ? 1 : 0.7}
        disabled={loading}
      >
        <View style={styles.permissionHeader}>
          <View
            style={[
              styles.iconContainer,
              granted && styles.iconContainerGranted,
            ]}
          >
            <Text style={styles.icon}>{icon}</Text>
          </View>

          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>{titleAr}</Text>
            <Text style={styles.permissionTitleEn}>{titleEn}</Text>
          </View>
        </View>

        <Text style={styles.permissionDescription}>{descriptionAr}</Text>
        <Text style={styles.permissionDescriptionEn}>{descriptionEn}</Text>

        <View
          style={[
            styles.statusBadge,
            granted ? styles.statusBadgeGranted : styles.statusBadgeDenied,
          ]}
        >
          <Text style={styles.icon}>{granted ? "✓" : "✗"}</Text>
          <Text
            style={[styles.statusText, granted && styles.statusTextGranted]}
          >
            {granted ? "ممنوح" : "اضغط للسماح"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري طلب الإذن...</Text>
        </View>
      </View>
    );
  }

  const allGranted = locationGranted && notificationGranted;
  const canContinue = locationGranted;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الأذونات المطلوبة</Text>
        <Text style={styles.headerSubtitle}>
          نحتاج بعض الأذونات لكي يعمل التطبيق بشكل صحيح
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Permission Card*/}
        {renderPermissionCard({
          icon: "📍",
          titleAr: "الموقع",
          titleEn: "Location",
          descriptionAr:
            "نحتاج إلى موقعك لتتبع سرعتك وتحديد حدود السرعة على الطريق",
          descriptionEn:
            "We need your location to track your speed and determine road speed limits",
          granted: locationGranted,
          onPress: requestLocationPermission,
        })}

        {/* Permission Notification*/}
        {renderPermissionCard({
          icon: "🔔",
          titleAr: "الإشعارات",
          titleEn: "Notifications",
          descriptionAr: "لإرسال تنبيهات فورية عند تجاوز الحد الأقصى للسرعة",
          descriptionEn:
            "To send instant alerts when exceeding the speed limit",
          granted: notificationGranted,
          onPress: requestNotificationPermission,
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {allGranted ? "متابعة ✓" : "متابعة"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>تخطي (للتطوير)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PermissionsScreen;
