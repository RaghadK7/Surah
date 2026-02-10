import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { COLORS } from "../../config/colors";

const CameraMarker = ({ camera, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: camera.location.latitude,
        longitude: camera.location.longitude,
      }}
      onPress={() => onPress && onPress(camera)}
    >
      {/* Custom Camera Icon */}
      <View style={styles.markerContainer}>
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraEmoji}>📷</Text>
        </View>
        <View style={styles.speedLimitBadge}>
          <Text style={styles.speedLimitText}>{camera.speedLimit}</Text>
        </View>
      </View>

      {/* Info Callout */}
      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>
            📷 {camera.roadName || camera.roadNameEn}
          </Text>
          <Text style={styles.calloutInfo}>
            {camera.city} • {camera.speedLimit} km/h
          </Text>
          <Text style={styles.calloutType}>
            {camera.type === "fixed" ? "ثابت" : "متحرك"}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },
  cameraIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cameraEmoji: {
    fontSize: 20,
  },
  speedLimitBadge: {
    marginTop: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  speedLimitText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.danger,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  calloutInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  calloutType: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: "600",
  },
});

export default CameraMarker;
