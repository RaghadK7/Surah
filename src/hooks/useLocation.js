// src/hooks/useLocation.js

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { MAP_CONFIG } from '../config/constants';

/**
 * Custom Hook لتتبع الموقع والسرعة
 * @returns {object} - بيانات الموقع والسرعة
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const watchSubscription = useRef(null);

  // بدء تتبع الموقع
  const startTracking = async () => {
    try {
      setError(null);
      
      // التحقق من الأذونات
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission not granted');
        return;
      }

      // الحصول على الموقع الحالي أولاً
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // بدء المراقبة المستمرة
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: MAP_CONFIG.UPDATE_INTERVAL,
          distanceInterval: 5, // تحديث كل 5 متر
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });

          // السرعة بالمتر/ثانية -> تحويل لـ كم/ساعة
          const speedInKmh = newLocation.coords.speed 
            ? newLocation.coords.speed * 3.6 
            : 0;
          
          setSpeed(Math.max(0, speedInKmh));

          // الاتجاه
          if (newLocation.coords.heading !== null) {
            setHeading(newLocation.coords.heading);
          }
        }
      );

      setIsTracking(true);
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError(err.message);
    }
  };

  // إيقاف تتبع الموقع
  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  };

  // تنظيف عند إزالة الـ Component
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