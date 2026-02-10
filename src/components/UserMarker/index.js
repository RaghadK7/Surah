import React from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

const UserMarker = ({ coordinate, heading, speed, isNavigating = false }) => {
  const getMarkerColor = () => {
    if (speed > 100) return "#FF3B30";
    if (speed > 60) return "#FF9500";
    return "#34C759";
  };

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      rotation={isNavigating ? heading || 0 : 0}
    >
      <View style={styles.container}>
        {isNavigating ? (
          // عرض السهم أثناء الملاحة
          <>
            <View
              style={[styles.arrow, { borderBottomColor: getMarkerColor() }]}
            />
            <View
              style={[styles.circle, { backgroundColor: getMarkerColor() }]}
            />
          </>
        ) : (
          // عرض الدائرة العادية عند عدم وجود ملاحة
          <View style={styles.locationDot}>
            <View
              style={[styles.innerDot, { backgroundColor: getMarkerColor() }]}
            />
          </View>
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#34C759",
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#34C759",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: -4,
  },
  locationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2a9745",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1976D2",
  },
});

export default UserMarker;
