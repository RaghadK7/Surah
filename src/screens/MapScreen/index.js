import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { createStyles } from "./styles";
import { COLORS } from "../../config/colors";
import {
  MAP_CONFIG,
  DEFAULT_SPEED_LIMITS,
  SPEED_STATUS,
} from "../../config/constants";
import { getSpeedStatus, shouldAlert } from "../../utils/speedCalculator";
import { decodePolyline } from "../../utils/polylineDecoder";
import useLocation from "../../hooks/useLocation";
import roadsAPIService from "../../services/RoadsAPIService";
import { optimizedSpeedLimitCache } from "../../utils/optimizedCacheManager";
import geocodingService from "../../services/GeocodingService";
import directionsService from "../../services/DirectionsService";
import alertService from "../../services/AlertService";
import RouteSpeedZonesService from "../../services/RouteSpeedZonesService";
import SpeedDisplay from "../../components/SpeedDisplay";
import SpeedLimitBadge from "../../components/SpeedLimitBadge";
import BottomNav from "../../components/BottomNav";
import DestinationPicker from "../../components/DestinationPicker";
import SpeedZoneMarker from "../../components/SpeedZoneMarker";
import RouteOptionsModal from "../../components/RouteOptionsModal";
import UserMarker from "../../components/UserMarker";
import CameraMarker from "../../components/CameraMarker";
import cameraService from "../../services/CameraService";

const MapScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const { currentLanguage } = useLanguage();

  // Create dynamic styles based on current language
  const styles = createStyles(currentLanguage);

  //  Dark Map Style for Google Maps
  const darkMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#242f3e",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#746855",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#242f3e",
        },
      ],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#d59563",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#d59563",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#263c3f",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#6b9a76",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#38414e",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#212a37",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9ca5b3",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#746855",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#1f2835",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#f3d19c",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [
        {
          color: "#2f3948",
        },
      ],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#d59563",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#17263c",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#515c6d",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#17263c",
        },
      ],
    },
  ];

  const {
    location,
    speed,
    heading,
    error: locationError,
    isTracking,
    startTracking,
    stopTracking,
  } = useLocation();

  const [speedLimit, setSpeedLimit] = useState(DEFAULT_SPEED_LIMITS.main_road);
  const [currentRoad, setCurrentRoad] = useState(t("map.unknown_road"));
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [remainingInfo, setRemainingInfo] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [speedZones, setSpeedZones] = useState([]);
  const [loadingSpeedZones, setLoadingSpeedZones] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [nearbyCameras, setNearbyCameras] = useState([]);
  const [cameraAlert, setCameraAlert] = useState(null);

  // ✅ Info card animation - الكارد تبدأ ظاهرة كاملاً عند بدء الملاحة
  const cardAnimY = useRef(new Animated.Value(235)).current; // تبدأ مطوية (خط صغير)
  const CARD_EXPANDED = 0; // الكارد مفتوحة كاملاً
  const CARD_COLLAPSED = 235; // الكارد مطوية (بس drag handle ظاهر)

  const mapRef = useRef(null);
  const lastAlertTime = useRef(0);
  const lastSpeedLimitUpdate = useRef(0);
  const lastRoadNameUpdate = useRef(0);

  const speedStatus = getSpeedStatus(speed, speedLimit);

  // ✅ PanResponder - يسمح لليوزر بسحب الكارد لأعلى ولأسفل
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        // ✅ السماح بالحركة من 0 (ظاهرة كاملاً) إلى 220 (خط صغير)
        const newY = Math.max(0, Math.min(CARD_COLLAPSED, gestureState.dy));
        cardAnimY.setValue(newY);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 80; // إذا سحب أكثر من 80px

        if (gestureState.dy > threshold) {
          // سحب لأسفل = طوي الكارد (خط صغير)
          Animated.spring(cardAnimY, {
            toValue: CARD_COLLAPSED,
            useNativeDriver: false,
            tension: 80,
            friction: 10,
          }).start();
        } else {
          // رجوع للأعلى = إظهار الكارد كاملاً
          Animated.spring(cardAnimY, {
            toValue: CARD_EXPANDED,
            useNativeDriver: false,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    alertService.initialize().catch(console.error);
    return () => {
      alertService.cleanup().catch(console.error);
    };
  }, []);

  useEffect(() => {
    roadsAPIService.clearCache();
    console.log("✅ Cache cleared on app start");

    startTracking();
    return () => stopTracking();
  }, []);

  useEffect(() => {
    if (location && mapReady && isNavigating) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 45,
          heading: heading || 0,
          altitude: 1000,
          zoom: 17,
        },
        { duration: 1000 },
      );
    }
  }, [location, mapReady, isNavigating, heading]);

  useEffect(() => {
    if (isNavigating) {
      Animated.spring(cardAnimY, {
        toValue: CARD_COLLAPSED,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.spring(cardAnimY, {
        toValue: 400,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();
    }
  }, [isNavigating]);

  useEffect(() => {
    if (location && isNavigating && speed > 5) {
      const now = Date.now();
      if (now - lastSpeedLimitUpdate.current > 30000) {
        updateSpeedLimit();
        lastSpeedLimitUpdate.current = now;
      }
    }
  }, [location, isNavigating, route, speed]);

  useEffect(() => {
    if (location && isNavigating) {
      const now = Date.now();
      if (now - lastRoadNameUpdate.current > 10000) {
        updateRoadName();
        lastRoadNameUpdate.current = now;
      }
    }
  }, [location, isNavigating, speed]);

  useEffect(() => {
    if (location && isNavigating && currentRoad === t("map.unknown_road")) {
      updateRoadName();
    }
  }, [location, isNavigating, currentRoad]);

  useEffect(() => {
    if (location && isNavigating) {
      updateNearbyCameras();
    }
  }, [location, isNavigating, speed, heading]);

  useEffect(() => {
    if (cameraAlert && isNavigating) {
      console.log("📷 Playing camera alert sound...");
      alertService.playAlert("camera").catch(console.error);
    }
  }, [cameraAlert, isNavigating]);

  useEffect(() => {
    if (route && location && isNavigating) {
      const remaining = directionsService.getRemainingInfo(location);
      setRemainingInfo(remaining);

      const routeSpeedLimit =
        directionsService.getSpeedLimitAtLocation(location);
      if (routeSpeedLimit) {
        setSpeedLimit(routeSpeedLimit);
      }
    }
  }, [location, route, isNavigating]);

  useEffect(() => {
    if (shouldAlert(speedStatus) && isNavigating) {
      const now = Date.now();
      if (now - lastAlertTime.current > 5000) {
        const alertType =
          speedStatus === SPEED_STATUS.DANGER ? "danger" : "warning";
        alertService.playAlert(alertType).catch(console.error);
        console.log(
          `ALERT: ${alertType.toUpperCase()} - Speed: ${speed} km/h, Limit: ${speedLimit} km/h`,
        );
        lastAlertTime.current = now;
      }
    }
  }, [speedStatus, isNavigating, speed, speedLimit]);

  const updateSpeedLimit = async () => {
    try {
      const cachedSpeed = optimizedSpeedLimitCache.getSpeedLimit(
        location.latitude,
        location.longitude,
      );

      if (cachedSpeed !== null) {
        setSpeedLimit(cachedSpeed);
        console.log(
          `Using cached speed limit: ${cachedSpeed} km/h for road: ${currentRoad}`,
        );
        return;
      }

      const limit = await roadsAPIService.getSpeedLimit(
        location.latitude,
        location.longitude,
      );

      if (limit && limit !== speedLimit) {
        setSpeedLimit(limit);
        optimizedSpeedLimitCache.setSpeedLimit(
          location.latitude,
          location.longitude,
          limit,
          currentRoad,
          0.9,
        );
        console.log(
          `✅ Updated speed limit: ${limit} km/h for road: ${currentRoad}`,
        );
      }
    } catch (error) {
      console.error("Update speed limit error:", error);
    }
  };

  const updateRoadName = async () => {
    try {
      if (currentRoad === t("map.unknown_road")) {
        setCurrentRoad("جاري تحديد الموقع...");
      }

      const result = await geocodingService.getRoadInfo(
        location.latitude,
        location.longitude,
        i18n.language,
      );

      if (result && result.roadName) {
        if (result.roadName !== "Unnamed Road" && result.roadName.length > 2) {
          setCurrentRoad(result.roadName);
        } else {
          setCurrentRoad("طريق غير محدد");
        }

        if (__DEV__) {
          console.log("Road Info:", {
            name: result.roadName,
            type: result.roadType,
            city: result.city,
            source: result.source,
          });
        }
      } else {
        setCurrentRoad("طريق غير محدد");
      }
    } catch (error) {
      console.error("Update road name error:", error);
      setCurrentRoad("خطأ في تحديد الموقع");
    }
  };

  const updateNearbyCameras = async () => {
    try {
      if (!location) return;

      const cameras = await cameraService.getCamerasNearLocation(
        location.latitude,
        location.longitude,
        10,
      );
      setNearbyCameras(cameras);

      const alert = await cameraService.checkApproachingCamera(
        location.latitude,
        location.longitude,
        speed,
        heading,
      );

      if (alert) {
        setCameraAlert(alert);
        console.log(
          `📷 Camera Alert: ${alert.distance}m ahead - ${alert.camera.roadName}`,
        );
      } else {
        setCameraAlert(null);
      }
    } catch (error) {
      console.error("Update nearby cameras error:", error);
    }
  };

  const handleDestinationSelect = async (dest) => {
    try {
      setDestination(dest);

      const routeResult = await directionsService.getRoute(location, dest, {
        alternatives: true,
      });

      if (routeResult.success) {
        setRoute(routeResult);
        setAvailableRoutes(routeResult.alternatives || []);

        if (routeResult.alternatives && routeResult.alternatives.length > 1) {
          setShowRouteOptions(true);
        }

        if (routeResult.route && routeResult.route.polyline) {
          setLoadingSpeedZones(true);

          try {
            const zones = await RouteSpeedZonesService.getSpeedZones(
              routeResult.route.polyline,
            );

            const significantZones = zones.filter((zone, index, array) => {
              if (index === 0) return true;
              const prevZone = array[index - 1];
              const speedDiff = Math.abs(zone.speedLimit - prevZone.speedLimit);
              return speedDiff >= 15;
            });

            setSpeedZones(significantZones);
          } catch (error) {
            console.error("❌ Failed to get speed zones:", error);
            setSpeedZones([]);
          } finally {
            setLoadingSpeedZones(false);
          }
        }

        if (mapRef.current && routeResult.route && routeResult.route.polyline) {
          const routeCoords = decodePolyline(routeResult.route.polyline);
          if (routeCoords.length > 0) {
            mapRef.current.fitToCoordinates(
              [
                { latitude: location.latitude, longitude: location.longitude },
                ...routeCoords,
                { latitude: dest.latitude, longitude: dest.longitude },
              ],
              {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              },
            );
          }
        }

        Alert.alert(
          t("map.destination"),
          `${dest.name}\n\n${t("map.remaining_distance")}: ${routeResult.route.distanceText}\n${t("map.estimated_time")}: ${routeResult.route.durationText}`,
          [{ text: t("common.ok") }],
        );
      } else {
        Alert.alert(t("common.error"), routeResult.error);
      }
    } catch (error) {
      console.error("Handle destination error:", error);
      Alert.alert(t("common.error"), error.message);
    }
  };

  const handleRouteSelect = async (routeId) => {
    const result = directionsService.selectRoute(routeId);

    if (result.success) {
      setRoute(result);
      setShowRouteOptions(false);

      if (result.route && result.route.polyline) {
        setLoadingSpeedZones(true);

        try {
          const zones = await RouteSpeedZonesService.getSpeedZones(
            result.route.polyline,
          );

          const significantZones = zones.filter((zone, index, array) => {
            if (index === 0) return true;
            const prevZone = array[index - 1];
            const speedDiff = Math.abs(zone.speedLimit - prevZone.speedLimit);
            return speedDiff >= 15;
          });

          setSpeedZones(significantZones);
        } catch (error) {
          console.error("Failed to get speed zones:", error);
          setSpeedZones([]);
        } finally {
          setLoadingSpeedZones(false);
        }
      }
    }
  };

  const handleClearDestination = () => {
    Alert.alert(t("map.destination"), "Clear destination?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.ok"),
        onPress: () => {
          setDestination(null);
          setRoute(null);
          setRemainingInfo(null);
          setSpeedZones([]);
          setAvailableRoutes([]);
          directionsService.clearRoute();
        },
      },
    ]);
  };

  const handleNavigationToggle = () => {
    if (isNavigating) {
      Alert.alert(t("map.stop_navigation"), t("map.stop_navigation") + "?", [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
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
      navigation.navigate("Statistics");
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371e3;
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
          <Text style={styles.alertText}>
            {isDanger ? t("alerts.danger_title") : t("alerts.warning_title")}
          </Text>
          <Text style={styles.alertSubtext}>
            {isDanger
              ? t("alerts.danger_message")
              : t("alerts.warning_message")}
          </Text>
        </View>
      </View>
    );
  };

  const renderCameraAlert = () => {
    if (!cameraAlert || !isNavigating) {
      return null;
    }

    return (
      <View style={[styles.alertBanner, styles.cameraAlertBanner]}>
        <Text style={styles.alertIcon}>📷</Text>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertText}>
            {t("alerts.camera_ahead")} - {cameraAlert.distance}م
          </Text>
          <Text style={styles.alertSubtext}>
            {cameraAlert.camera.roadName} • {cameraAlert.camera.speedLimit} كم/س
          </Text>
        </View>
      </View>
    );
  };

  const renderInfoCard = () => {
    if (!isNavigating) {
      return null;
    }

    const isCollapsed = cardAnimY._value > 100;

    const getStatusBadgeStyle = () => {
      switch (speedStatus) {
        case SPEED_STATUS.SAFE:
          return [styles.statusBadge, styles.statusBadgeSafe];
        case SPEED_STATUS.WARNING:
          return [styles.statusBadge, styles.statusBadgeWarning];
        case SPEED_STATUS.DANGER:
          return [styles.statusBadge, styles.statusBadgeDanger];
        default:
          return styles.statusBadge;
      }
    };

    const getStatusTextStyle = () => {
      switch (speedStatus) {
        case SPEED_STATUS.SAFE:
          return [styles.statusText, styles.statusTextSafe];
        case SPEED_STATUS.WARNING:
          return [styles.statusText, styles.statusTextWarning];
        case SPEED_STATUS.DANGER:
          return [styles.statusText, styles.statusTextDanger];
        default:
          return styles.statusText;
      }
    };

    const getStatusText = () => {
      switch (speedStatus) {
        case SPEED_STATUS.SAFE:
          return `${t("map.safe")} ✓`;
        case SPEED_STATUS.WARNING:
          return `${t("map.warning")} ⚠️`;
        case SPEED_STATUS.DANGER:
          return `${t("map.danger")} 🚨`;
        default:
          return t("map.unknown");
      }
    };

    return (
      <Animated.View
        style={[
          styles.bottomCard,
          {
            transform: [{ translateY: cardAnimY }],
            backgroundColor:
              theme.cardBackground || (isDark ? "#2D2D2D" : "#FFFFFF"),
            borderWidth: isDark ? 0 : 1,
            borderColor:
              theme.cardBorder || (isDark ? "transparent" : "#F0F0F0"),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />

        <View style={styles.cardHeader}>
          <View style={styles.roadNameSection}>
            <Text
              style={[
                styles.roadNameLabel,
                { color: isDark ? "#AAAAAA" : "#666666" },
              ]}
            >
              {t("map.current_road")}
            </Text>
            <Text
              style={[
                styles.roadNameText,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
              numberOfLines={1}
            >
              {currentRoad || t("map.unknown_road")}
            </Text>
          </View>

          <View style={getStatusBadgeStyle()}>
            <Text style={getStatusTextStyle()}>{getStatusText()}</Text>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: cardAnimY.interpolate({
              inputRange: [0, CARD_COLLAPSED],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          }}
        >
          <View style={styles.speedInfoRow}>
            <View
              style={[
                styles.speedInfoCard,
                { backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5" },
              ]}
            >
              <Text
                style={[
                  styles.speedInfoLabel,
                  { color: isDark ? "#AAAAAA" : "#666666" },
                ]}
              >
                {t("map.speed")}
              </Text>
              <Text
                style={[
                  styles.speedInfoValue,
                  { color: isDark ? "#FFFFFF" : "#333333" },
                ]}
              >
                {Math.round(speed || 0)}
              </Text>
              <Text
                style={[
                  styles.speedInfoUnit,
                  { color: isDark ? "#AAAAAA" : "#666666" },
                ]}
              >
                {t("map.kmh")}
              </Text>
            </View>

            <View
              style={[
                styles.speedInfoCard,
                { backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5" },
              ]}
            >
              <Text
                style={[
                  styles.speedInfoLabel,
                  { color: isDark ? "#AAAAAA" : "#666666" },
                ]}
              >
                {t("map.speed_limit")}
              </Text>
              <Text
                style={[
                  styles.speedInfoValue,
                  {
                    color:
                      speedStatus === SPEED_STATUS.DANGER
                        ? COLORS.statusDanger
                        : speedStatus === SPEED_STATUS.WARNING
                          ? COLORS.statusWarning
                          : isDark
                            ? "#FFFFFF"
                            : COLORS.primary,
                  },
                ]}
              >
                {speedLimit}
              </Text>
              <Text
                style={[
                  styles.speedInfoUnit,
                  { color: isDark ? "#AAAAAA" : "#666666" },
                ]}
              >
                {t("map.kmh")}
              </Text>
            </View>
          </View>

          {destination && remainingInfo && (
            <View
              style={[
                styles.navInfoSection,
                { backgroundColor: isDark ? "#2A2A2A" : "#F8F9FA" },
              ]}
            >
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: isDark ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  📍 {t("map.destination")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#FFFFFF" : "#333333" },
                  ]}
                  numberOfLines={1}
                >
                  {destination.name}
                </Text>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? "#404040" : "#E0E0E0" },
                ]}
              />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: isDark ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  📏 {t("map.remaining_distance")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  {remainingInfo.distanceText}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: isDark ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  ⏱️ {t("map.estimated_time")}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  {remainingInfo.durationText}
                </Text>
              </View>

              {remainingInfo.nextTurn && (
                <>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: isDark ? "#404040" : "#E0E0E0" },
                    ]}
                  />
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: isDark ? "#AAAAAA" : "#666666" },
                      ]}
                    >
                      🧭 {t("map.next_turn")}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { color: isDark ? "#FFFFFF" : "#333333" },
                      ]}
                    >
                      {remainingInfo.nextTurn}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {!destination && (
            <View
              style={[
                styles.navInfoSection,
                { backgroundColor: isDark ? "#2A2A2A" : "#F8F9FA" },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    textAlign: "center",
                    opacity: 0.6,
                    color: isDark ? "#AAAAAA" : "#666666",
                  },
                ]}
              >
                {t("map.no_destination")}
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  if (locationError) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: theme.background }]}
      >
        <StatusBar style="dark" />
        <Text style={styles.errorIcon}>❌</Text>
        <Text
          style={[styles.errorText, { color: isDark ? "#FFFFFF" : "#000000" }]}
        >
          {t("common.error")}
        </Text>
        <Text
          style={[
            styles.errorSubtext,
            { color: isDark ? "#CCCCCC" : "#666666" },
          ]}
        >
          GPS Error
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={startTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!location) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
          {t("map.loading_map")}
        </Text>
      </View>
    );
  }

  return (
    <View
      key={`map-${currentLanguage}`}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={isDark ? darkMapStyle : []}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: MAP_CONFIG.LATITUDE_DELTA,
          longitudeDelta: MAP_CONFIG.LONGITUDE_DELTA,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        showsTraffic={false}
        onMapReady={() => setMapReady(true)}
        followsUserLocation={isNavigating}
        rotateEnabled={true}
      >
        <UserMarker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          heading={heading}
          speed={speed}
          isNavigating={isNavigating}
        />

        {destination && (
          <Marker
            coordinate={destination}
            title={destination.name}
            description={destination.address}
            pinColor="red"
          />
        )}

        {route && route.route && route.route.polyline && (
          <Polyline
            coordinates={decodePolyline(route.route.polyline)}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            zIndex={1}
          />
        )}

        {speedZones.map((zone, index) => {
          const distanceFromUser = location
            ? calculateDistance(location, zone.coordinate)
            : null;

          return (
            <SpeedZoneMarker
              key={`speed-zone-${index}`}
              coordinate={zone.coordinate}
              speedLimit={zone.speedLimit}
              isUpcoming={distanceFromUser && distanceFromUser < 500}
              distanceFromUser={distanceFromUser}
            />
          );
        })}

        {nearbyCameras.map((camera) => (
          <CameraMarker
            key={`camera-${camera.id}`}
            camera={camera}
            onPress={(selectedCamera) => {
              console.log("Camera selected:", selectedCamera.roadName);
            }}
          />
        ))}
      </MapView>

      {loadingSpeedZones && (
        <View
          style={[
            styles.loadingZonesContainer,
            {
              backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "#404040" : "#E0E0E0",
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.primary} />
          <Text
            style={[
              styles.loadingZonesText,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Loading speed limits...
          </Text>
        </View>
      )}

      {renderAlertBanner()}
      {renderCameraAlert()}

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

      {!destination && !isNavigating && (
        <TouchableOpacity
          style={[
            styles.destinationButton,
            {
              backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "#404040" : "#E0E0E0",
            },
          ]}
          onPress={() => setShowDestinationPicker(true)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.destinationButtonText,
              { color: isDark ? "#FFFFFF" : "#333333" },
            ]}
          >
            📍 {t("map.set_destination")}
          </Text>
        </TouchableOpacity>
      )}

      {destination && (
        <TouchableOpacity
          style={[
            styles.clearDestinationButton,
            {
              backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "#404040" : "#E0E0E0",
            },
          ]}
          onPress={handleClearDestination}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.clearDestinationButtonText,
              { color: isDark ? "#FFFFFF" : "#333333" },
            ]}
          >
            ✕
          </Text>
        </TouchableOpacity>
      )}

      {renderInfoCard()}

      <TouchableOpacity
        style={[
          styles.navigationButton,
          isNavigating && styles.navigationButtonActive,
        ]}
        onPress={handleNavigationToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.navigationButtonText}>
          {isNavigating
            ? "🛑 " + t("map.stop_navigation")
            : "🧭 " + t("map.start_navigation")}
        </Text>
      </TouchableOpacity>

      <BottomNav activeTab="map" onTabPress={handleTabPress} />

      <DestinationPicker
        visible={showDestinationPicker}
        onClose={() => setShowDestinationPicker(false)}
        onSelect={handleDestinationSelect}
        userLocation={location}
      />

      <RouteOptionsModal
        visible={showRouteOptions}
        routes={availableRoutes}
        onSelect={handleRouteSelect}
        onClose={() => setShowRouteOptions(false)}
      />
    </View>
  );
};

export default MapScreen;
