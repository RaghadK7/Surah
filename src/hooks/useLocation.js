import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { MAP_CONFIG } from "../config/constants";

/**
 * Custom Hook
 * @returns {object}
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchSubscription = useRef(null);

  const startTracking = async () => {
    try {
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission not granted");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: MAP_CONFIG.UPDATE_INTERVAL,
          distanceInterval: 5,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });

          const speedInKmh = newLocation.coords.speed
            ? newLocation.coords.speed * 3.6
            : 0;

          setSpeed(Math.max(0, speedInKmh));

          if (newLocation.coords.heading !== null) {
            setHeading(newLocation.coords.heading);
          }
        }
      );

      setIsTracking(true);
    } catch (err) {
      console.error("Error starting location tracking:", err);
      setError(err.message);
    }
  };

  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    speed,
    heading,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
};

export default useLocation;
