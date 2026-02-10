import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Marker, Callout } from "react-native-maps";
import colors from "../../config/colors";
import styles from "./styles";

const SpeedZoneMarker = ({
  coordinate,
  speedLimit,
  isUpcoming = false,
  distanceFromUser = null,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isUpcoming) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isUpcoming]);

  const getColor = (speed) => {
    if (speed <= 50) return colors.speedZones.veryLow;
    if (speed <= 70) return colors.speedZones.low;
    if (speed <= 90) return colors.speedZones.medium;
    if (speed <= 110) return colors.speedZones.normal;
    if (speed <= 120) return colors.speedZones.high;
    return colors.speedZones.veryHigh;
  };

  const backgroundColor = getColor(speedLimit);

  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <Animated.View
        style={[styles.markerContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <View style={[styles.circle, { backgroundColor }]}>
          <Text style={styles.speedText}>{speedLimit}</Text>
        </View>
      </Animated.View>

      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>Speed Limit</Text>
          <Text style={[styles.calloutSpeed, { color: backgroundColor }]}>
            {speedLimit}
          </Text>
          <Text style={styles.calloutUnit}>km/h</Text>

          {distanceFromUser && (
            <Text style={styles.distanceText}>
              {distanceFromUser < 1000
                ? `${Math.round(distanceFromUser)} m`
                : `${(distanceFromUser / 1000).toFixed(1)} km`}
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

export default SpeedZoneMarker;
