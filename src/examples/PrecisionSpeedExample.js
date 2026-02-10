/**
 * Precision Speed Integration Example
 *
 * Demonstrates the exact flow from your chart:
 * GPS → Route Segments → Road Matching → Speed Priority → Current Segment Only
 *
 * Following the principle: "No radius-based decisions, road segment is source of truth"
 */

import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";

// Core precision engine
import PrecisionRouteSpeedEngine from "../services/PrecisionRouteSpeedEngine";
import DirectionsService from "../services/DirectionsService";

// Hooks for GPS data
import useLocation from "../hooks/useLocation";

const PrecisionSpeedExample = ({ navigation }) => {
  // Current state
  const [speedLimit, setSpeedLimit] = useState(null);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [speedSource, setSpeedSource] = useState(null);
  const [roadInfo, setRoadInfo] = useState(null);
  const [isRouteActive, setIsRouteActive] = useState(false);

  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  const { location, speed, heading, accuracy } = useLocation();

  /**
   * STEP 1-3: Initialize route processing
   */
  useEffect(() => {
    initializePrecisionSystem();
  }, []);

  /**
   * STEP 7: Real-time GPS updates
   */
  useEffect(() => {
    if (location && isRouteActive) {
      handleGPSUpdate();
    }
  }, [location, isRouteActive]);

  /**
   * Initialize precision speed system with route data
   */
  const initializePrecisionSystem = async () => {
    try {
      console.log("🚀 Initializing Precision Speed System...");

      // Get active route from DirectionsService
      const routeData = DirectionsService.getRouteForSpeedProcessing();

      if (routeData) {
        console.log("📍 Found active route, processing...");
        await processActiveRoute(routeData);
      } else {
        console.log("📍 No active route available");
        showNoRouteMessage();
      }
    } catch (error) {
      console.error("❌ Precision system initialization failed:", error);
      Alert.alert("Error", "Failed to initialize precision speed system");
    }
  };

  /**
   * STEP 2-3: Process route and create segments
   */
  const processActiveRoute = async (routeData) => {
    try {
      const result =
        await PrecisionRouteSpeedEngine.processActiveRoute(routeData);

      if (result.success) {
        setIsRouteActive(true);
        console.log(
          `✅ Route processed: ${result.totalSegments} segments in ${result.processingTime}ms`,
        );

        Alert.alert(
          "Precision Speed Active",
          `Route processed into ${result.totalSegments} segments.\n\nSpeed limits will be determined by actual road segments, not proximity zones.`,
          [{ text: "Got it", style: "default" }],
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Route processing failed:", error);
      Alert.alert("Route Processing Failed", error.message);
    }
  };

  /**
   * STEP 4-6: Handle GPS updates with precision logic
   */
  const handleGPSUpdate = async () => {
    if (!location) return;

    try {
      // Get destination if available (for destination logic)
      const destination = getDestination();

      // Main precision calculation
      const result = await PrecisionRouteSpeedEngine.getCurrentSpeedLimit(
        location,
        destination,
      );

      if (result.success) {
        // Update UI state
        setSpeedLimit(result.speedLimit);
        setCurrentSegment(result.currentSegment);
        setSpeedSource(result.speedSource);
        setRoadInfo({
          type: result.roadType || "unknown",
          name: result.roadName || null,
          distance: result.destinationDistance || null,
        });

        // Update performance metrics
        setPerformanceMetrics(
          PrecisionRouteSpeedEngine.getPerformanceMetrics(),
        );

        console.log(
          `🎯 Segment ${result.currentSegment}: ${result.speedLimit} km/h (${result.speedSource})`,
        );
      } else {
        console.warn(`⚠️ Speed calculation failed: ${result.error}`);
        // Keep last known speed limit (don't reset to 0)
      }
    } catch (error) {
      console.error("❌ GPS update processing failed:", error);
    }
  };

  /**
   * Handle new route selection
   */
  const handleNewRoute = async (newRouteData) => {
    console.log("🛣️ New route selected, updating precision system...");

    try {
      await processActiveRoute(newRouteData);
    } catch (error) {
      console.error("❌ Route update failed:", error);
    }
  };

  /**
   * Get destination for destination logic (smart zone detection)
   */
  const getDestination = () => {
    // This would come from your navigation state
    // Example destinations with type classification:
    const exampleDestinations = {
      school: {
        latitude: 24.7136,
        longitude: 46.6753,
        name: "King Saud School",
        types: ["school", "education"],
        address: "مدرسة الملك سعود",
      },
      hospital: {
        latitude: 24.72,
        longitude: 46.68,
        name: "King Fahd Hospital",
        types: ["hospital", "health"],
        address: "مستشفى الملك فهد",
      },
      mall: {
        latitude: 24.71,
        longitude: 46.67,
        name: "Riyadh Gallery Mall",
        types: ["shopping_mall"],
        address: "مول الرياض جاليري",
      },
      home: {
        latitude: 24.715,
        longitude: 46.675,
        name: "Home",
        types: ["premise"],
        address: "المنزل",
      },
    };

    // For demo, return school destination
    // In production, get from navigation state
    return exampleDestinations.school;
  };

  /**
   * Show message when no route is available
   */
  const showNoRouteMessage = () => {
    Alert.alert(
      "No Active Route",
      "Please select a destination to enable precision speed limits.\n\nWithout a route, standard proximity-based detection will be used.",
      [{ text: "OK", style: "default" }],
    );
  };

  /**
   * Get speed source description
   */
  const getSpeedSourceDescription = (source) => {
    const descriptions = {
      explicit_maxspeed: "🎯 Road Speed Limit",
      road_type_mapping: "🛣️ Road Type Standard",
      destination_approach: "🏁 Destination Approach",
      destination_school: "🏫 School Zone",
      destination_university: "🎓 University Zone",
      destination_hospital: "🏥 Hospital Zone",
      destination_mall: "🏬 Shopping Zone",
      destination_residential: "🏠 Residential Zone",
      destination_mosque: "🕌 Mosque Zone",
      destination_government: "🏛️ Government Zone",
      safety_fallback: "🛡️ Safety Default",
      error_fallback: "⚠️ System Fallback",
    };

    return descriptions[source] || source;
  };

  /**
   * Get confidence indicator
   */
  const getConfidenceColor = (source) => {
    const colors = {
      explicit_maxspeed: "#4CAF50", // Green
      road_type_mapping: "#2196F3", // Blue
      destination_approach: "#FF9800", // Orange
      destination_school: "#FF5722", // Red
      destination_hospital: "#9C27B0", // Purple
      destination_mall: "#FF9800", // Orange
      destination_university: "#FF5722", // Red
      destination_residential: "#607D8B", // Blue Gray
      destination_mosque: "#4CAF50", // Green
      safety_fallback: "#9E9E9E", // Gray
      error_fallback: "#F44336", // Red
    };

    return colors[source] || "#9E9E9E";
  };

  /**
   * Get destination zone message
   */
  const getDestinationZoneMessage = (source) => {
    const messages = {
      destination_school:
        "🏫 Approaching school - Drive slowly and watch for children",
      destination_university:
        "🎓 University area - Heavy pedestrian traffic expected",
      destination_hospital:
        "🏥 Hospital zone - Emergency vehicles may be present",
      destination_mall: "🏬 Shopping center - High pedestrian activity",
      destination_residential: "🏠 Residential area - Neighborhood zone",
      destination_mosque:
        "🕌 Mosque area - Prayer times may cause heavy traffic",
      destination_government: "🏛️ Government facility - Official building area",
    };

    return messages[source] || "Approaching destination - reduced speed zone";
  };

  return (
    <View style={styles.container}>
      {/* System Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Precision Speed System</Text>
        <View
          style={[
            styles.statusBadgeContainer,
            { backgroundColor: isRouteActive ? "#4CAF50" : "#FF9800" },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {isRouteActive ? "🎯 Route-Based Active" : "📍 Standard Mode"}
          </Text>
        </View>
      </View>

      {/* Current Speed Limit */}
      {speedLimit !== null && speedLimit !== undefined && (
        <View style={styles.speedContainer}>
          <Text style={styles.speedLimit}>{String(speedLimit || 0)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      )}

      {/* Speed Source */}
      {speedSource !== null && speedSource !== undefined && (
        <View
          style={[
            styles.sourceContainer,
            { backgroundColor: getConfidenceColor(speedSource) },
          ]}
        >
          <Text style={styles.sourceText}>
            {speedSource
              ? getSpeedSourceDescription(speedSource)
              : "Unknown Source"}
          </Text>
        </View>
      )}

      {/* Current Segment Info */}
      {currentSegment !== null && roadInfo && (
        <View style={styles.segmentContainer}>
          <Text style={styles.segmentTitle}>Current Road Segment</Text>
          <Text style={styles.segmentText}>
            Segment #{currentSegment !== null ? currentSegment : "N/A"}
          </Text>
          <Text style={styles.segmentText}>
            Type: {roadInfo && roadInfo.type ? roadInfo.type : "unknown"}
          </Text>
          {roadInfo && roadInfo.name && (
            <Text style={styles.segmentText}>Road: {String(roadInfo.name || 'Unknown')}</Text>
          )}
          {roadInfo && roadInfo.distance && !isNaN(roadInfo.distance) && (
            <Text style={styles.segmentText}>
              To Destination: {String(Math.round(roadInfo.distance))}m
            </Text>
          )}
        </View>
      )}

      {/* Destination Zone Info */}
      {speedSource && speedSource.startsWith("destination_") && (
        <View style={styles.destinationContainer}>
          <Text style={styles.destinationTitle}>
            🏁 Destination Zone Active
          </Text>
          <Text style={styles.destinationText}>
            Type:{" "}
            {speedSource
              ? speedSource.replace("destination_", "").toUpperCase()
              : "UNKNOWN"}
          </Text>
          <Text style={styles.destinationText}>
            Zone Speed Applied: {String(speedLimit || 0)} km/h
          </Text>
          {roadInfo && roadInfo.distance && !isNaN(roadInfo.distance) && (
            <Text style={styles.destinationText}>
              Distance to Destination: {String(Math.round(roadInfo.distance))}m
            </Text>
          )}
          <Text style={styles.destinationNote}>
            {speedSource
              ? getDestinationZoneMessage(speedSource)
              : "Approaching destination"}
          </Text>
        </View>
      )}

      {/* Performance Metrics */}
      {__DEV__ && performanceMetrics && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Performance</Text>
          <Text style={styles.debugText}>
            Updates: {String(performanceMetrics.totalUpdates || 0)}
          </Text>
          <Text style={styles.debugText}>
            Cache Hit Rate: {String(performanceMetrics.cacheHitRate || "0%")}
          </Text>
          <Text style={styles.debugText}>
            Avg Time: {String(performanceMetrics.averageProcessingTime || 0)}ms
          </Text>
          <Text style={styles.debugText}>
            API Calls: {String(performanceMetrics.apiCalls || 0)}
          </Text>
        </View>
      )}

      {/* Current GPS Info */}
      {location && (
        <View style={styles.gpsContainer}>
          <Text style={styles.gpsText}>
            Speed: {String(Math.round(speed || 0))} km/h
          </Text>
          <Text style={styles.gpsText}>
            Accuracy: {String(Math.round(accuracy || 0))}m
          </Text>
          {heading && !isNaN(heading) && heading > 0 && (
            <Text style={styles.gpsText}>
              Heading: {String(Math.round(heading))}°
            </Text>
          )}
        </View>
      )}

      {/* Explanation */}
      {!isRouteActive && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>How Precision Speed Works</Text>
          <Text style={styles.explanationText}>
            ✅ Speed limits determined by actual route segments
          </Text>
          <Text style={styles.explanationText}>
            ✅ No proximity-based zone pollution
          </Text>
          <Text style={styles.explanationText}>
            ✅ Highway speeds protected from nearby schools
          </Text>
          <Text style={styles.explanationText}>
            ✅ Direction-aware GPS matching
          </Text>
          <Text style={styles.explanationText}>
            🎯 Smart destination zones: School (30), Hospital (40), Mall (50)
          </Text>
          <Text style={styles.explanationText}>
            📍 Zone speeds activate within 100m of destination
          </Text>
          <Text style={styles.explanationText}>
            ⚠️ Requires active navigation route
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  speedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  speedLimit: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2196F3",
  },
  speedUnit: {
    fontSize: 18,
    color: "#757575",
    marginLeft: 8,
  },
  sourceContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sourceText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  segmentContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  segmentText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
  },
  destinationContainer: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    elevation: 2,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 14,
    color: "#388E3C",
    marginBottom: 4,
    fontWeight: "500",
  },
  destinationNote: {
    fontSize: 12,
    color: "#558B2F",
    marginTop: 8,
    fontStyle: "italic",
  },
  debugContainer: {
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  debugTitle: {
    color: "#00FF00",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  debugText: {
    color: "#FFFFFF",
    fontFamily: "monospace",
    fontSize: 10,
    marginBottom: 2,
  },
  gpsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  gpsText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  explanationContainer: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#E65100",
  },
  explanationText: {
    fontSize: 12,
    color: "#BF360C",
    marginBottom: 4,
  },
});

export default PrecisionSpeedExample;

/**
 * Integration Summary:
 *
 * ✅ STEP 1: Driver Location Update (GPS real-time)
 * ✅ STEP 2: Get Active Route (Google Directions API)
 * ✅ STEP 3: Convert Points → Road Segments
 * ✅ STEP 4: Match Segment to Real Road
 * ✅ STEP 5: Determine Speed Limit (Priority A→B→C→D)
 * ✅ STEP 6: Final Speed for Current Segment
 * ✅ STEP 7: Marker Rendering (current segment only)
 * ✅ STEP 8: Repeat (Real-time)
 *
 * Key Features:
 * - No radius-based decisions
 * - No "nearest school" pollution
 * - Road segment is source of truth
 * - Perfect for Saudi navigation accuracy
 */
