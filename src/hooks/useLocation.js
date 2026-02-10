import { useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { MAP_CONFIG } from "../config/constants";

/**
 * Optimized Custom Hook for Location Tracking
 * @returns {object}
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchSubscription = useRef(null);
  const lastUpdateTime = useRef(0);
  const lastSignificantLocation = useRef(null);

  // Optimize location updates with filtering
  const handleLocationUpdate = useCallback((newLocation) => {
    const now = Date.now();
    
    // Filter out updates that are too frequent (less than 2 seconds)
    if (now - lastUpdateTime.current < 2000) {
      return;
    }

    // Filter out updates with poor accuracy (more than 20 meters)
    if (newLocation.coords.accuracy > 20) {
      console.warn('Poor GPS accuracy, skipping update:', newLocation.coords.accuracy);
      return;
    }

    const newLocationData = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
    };

    // Check if location changed significantly (more than 3 meters)
    if (lastSignificantLocation.current) {
      const distance = calculateDistance(
        lastSignificantLocation.current,
        newLocationData
      );
      
      // Skip minor position changes when stationary
      if (distance < 3 && newLocation.coords.speed && newLocation.coords.speed < 1) {
        return;
      }
    }

    setLocation(newLocationData);
    lastSignificantLocation.current = newLocationData;
    lastUpdateTime.current = now;

    // Update speed with smoothing
    const rawSpeedInKmh = newLocation.coords.speed ? newLocation.coords.speed * 3.6 : 0;
    const smoothedSpeed = rawSpeedInKmh < 3 ? 0 : rawSpeedInKmh; // Filter noise below 3 km/h
    setSpeed(Math.max(0, Math.round(smoothedSpeed)));

    // Update heading only if moving
    if (newLocation.coords.heading !== null && smoothedSpeed > 5) {
      setHeading(newLocation.coords.heading);
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1, point2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }, []);

  const startTracking = async () => {
    try {
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission not granted");
        return;
      }

      // Get initial location with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 1000, // Cache for 1 second
      });

      const initialLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(initialLocation);
      lastSignificantLocation.current = initialLocation;

      // Start optimized location tracking
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000, // Update every 3 seconds instead of 1
          distanceInterval: 8, // Update every 8 meters instead of 5
        },
        handleLocationUpdate
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
