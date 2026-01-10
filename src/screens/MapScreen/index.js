import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { styles } from "./styles";
import { COLORS } from "../../config/colors";
import {
  MAP_CONFIG,
  DEFAULT_SPEED_LIMITS,
  SPEED_STATUS,
} from "../../config/constants";
import { getSpeedStatus, shouldAlert } from "../../utils/speedCalculator";
import useLocation from "../../hooks/useLocation";
import SpeedDisplay from "../../components/SpeedDisplay";
import SpeedLimitBadge from "../../components/SpeedLimitBadge";
import roadsAPIService from "../../services/RoadsAPIService";

const MapScreen = ({ navigation }) => {
  const {
    location,
    speed,
    error: locationError,
    isTracking,
    startTracking,
    stopTracking,
  } = useLocation();

  const [speedLimit, setSpeedLimit] = useState(DEFAULT_SPEED_LIMITS.main_road);
  const [currentRoad, setCurrentRoad] = useState("طريق الملك فهد");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const lastAlertTime = useRef(0);
  const lastSpeedLimitUpdate = useRef(0);

  // Update speed limit from API (throttled)
  useEffect(() => {
    if (location && isNavigating) {
      const now = Date.now();
      // Update speed limit only every 10 seconds to save API calls
      if (now - lastSpeedLimitUpdate.current > 10000) {
        updateSpeedLimit();
        lastSpeedLimitUpdate.current = now;
      }
    }
  }, [location, isNavigating]);

  // Fetch speed limit
  const updateSpeedLimit = async () => {
    try {
      const limit = await roadsAPIService.getSpeedLimit(
        location.latitude,
        location.longitude
      );
      setSpeedLimit(limit);
    } catch (error) {
      console.error("Update speed limit error:", error);
    }
  };

  // Calculate speed status
  const speedStatus = getSpeedStatus(speed, speedLimit);

  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (location && mapReady && isNavigating) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: MAP_CONFIG.LATITUDE_DELTA,
          longitudeDelta: MAP_CONFIG.LONGITUDE_DELTA,
        },
        1000
      );
    }
  }, [location, mapReady, isNavigating]);

  useEffect(() => {
    if (shouldAlert(speedStatus) && isNavigating) {
      const now = Date.now();
      if (now - lastAlertTime.current > 5000) {
        console.log("ALERT: Speed limit exceeded!");
        lastAlertTime.current = now;
      }
    }
  }, [speedStatus, isNavigating]);

  const handleNavigationToggle = () => {
    if (isNavigating) {
      Alert.alert("إيقاف الملاحة؟", "هل تريد إيقاف تتبع السرعة؟", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إيقاف",
          style: "destructive",
          onPress: () => {
            setIsNavigating(false);
            stopTracking();
          },
        },
      ]);
    } else {
      setIsNavigating(true);
      startTracking();
    }
  };

  const handleTabPress = (tabId) => {
    if (tabId === "settings") {
      navigation.navigate("Settings");
    } else if (tabId === "stats") {
      Alert.alert("الإحصائيات", "سيتم إضافة صفحة الإحصائيات قريباً");
    }
  };

  const renderAlertBanner = () => {
    if (!isNavigating || speedStatus === SPEED_STATUS.SAFE) {
      return null;
    }

    const isWarning = speedStatus === SPEED_STATUS.WARNING;
    const isDanger = speedStatus === SPEED_STATUS.DANGER;

    return (
      <View
        style={[styles.alertBanner, isWarning && styles.alertBannerWarning]}
      >
        <Text style={styles.alertIcon}>{isDanger ? "🚨" : "⚠️"}</Text>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertText}>{isDanger ? "خطر!" : "تحذير"}</Text>
          <Text style={styles.alertSubtext}>
            {isDanger ? "خفف السرعة فوراً" : "تجاوزت الحد الأقصى للسرعة"}
          </Text>
        </View>
      </View>
    );
  };

  const renderInfoCard = () => {
    if (!isNavigating) {
      return null;
    }

    return (
      <View style={styles.bottomCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الطريق الحالي</Text>
          <Text style={styles.infoValue}>{currentRoad}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>حالة السرعة</Text>
          <Text
            style={[
              styles.infoValue,
              {
                color:
                  speedStatus === SPEED_STATUS.SAFE
                    ? COLORS.statusSafe
                    : speedStatus === SPEED_STATUS.WARNING
                    ? COLORS.statusWarning
                    : COLORS.statusDanger,
              },
            ]}
          >
            {speedStatus === SPEED_STATUS.SAFE
              ? "آمن ✓"
              : speedStatus === SPEED_STATUS.WARNING
              ? "تحذير ⚠️"
              : "خطر 🚨"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.infoRow, styles.infoRowLast]}>
          <Text style={styles.infoLabel}>دقة GPS</Text>
          <Text style={styles.infoValue}>عالية</Text>
        </View>
      </View>
    );
  };

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>خطأ في الموقع</Text>
        <Text style={styles.errorSubtext}>
          لا يمكن الوصول إلى موقعك. تأكد من تفعيل GPS والسماح بالأذونات
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={startTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحديد موقعك...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/*Map*/}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: MAP_CONFIG.LATITUDE_DELTA,
          longitudeDelta: MAP_CONFIG.LONGITUDE_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsTraffic={false}
        onMapReady={() => setMapReady(true)}
      >
        {/*Current location mark*/}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="موقعك الحالي"
        />
      </MapView>

      {/*Alert*/}
      {renderAlertBanner()}

      {/* View speed and speed limit*/}
      {isNavigating && (
        <View style={styles.topOverlay}>
          <View style={styles.speedDisplayContainer}>
            <SpeedDisplay speed={speed} status={speedStatus} />
          </View>
          <View style={styles.speedLimitContainer}>
            <SpeedLimitBadge speedLimit={speedLimit} />
          </View>
        </View>
      )}

      {/* Card Info*/}
      {renderInfoCard()}

      {/*Start and End Navigation*/}
      <TouchableOpacity
        style={[
          styles.navigationButton,
          isNavigating && styles.navigationButtonActive,
        ]}
        onPress={handleNavigationToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.navigationButtonText}>
          {isNavigating ? "🛑 إيقاف الملاحة" : "🧭 ابدأ الملاحة"}
        </Text>
      </TouchableOpacity>

      {/*Bottom Navbar*/}
      <BottomNav activeTab="map" onTabPress={handleTabPress} />
    </View>
  );
};

export default MapScreen;
