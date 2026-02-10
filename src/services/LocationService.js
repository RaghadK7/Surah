import * as Location from "expo-location";
import { validateCoordinates } from "../utils/validators";

/**
 * Location Service
 * Handles GPS location tracking and permissions
 */
class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.callbacks = [];
  }

  /**
   * Request location permissions
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        console.warn("Foreground location permission denied");
        return false;
      }

      // Request background permissions for continuous tracking
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        console.warn("Background location permission denied");
      }

      return foregroundStatus === "granted";
    } catch (error) {
      console.error("Request permissions error:", error);
      return false;
    }
  }

  /**
   * Check if permissions are granted
   * @returns {Promise<boolean>}
   */
  async hasPermissions() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Check permissions error:", error);
      return false;
    }
  }

  /**
   * Get current location once
   * @returns {Promise<object|null>}
   */
  async getCurrentLocation() {
    try {
      const hasPermission = await this.hasPermissions();

      if (!hasPermission) {
        throw new Error("Location permission not granted");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // ✅ أعلى دقة للملاحة
        maximumAge: 1000, // ✅ بيانات حديثة (ثانية واحدة)
        timeout: 15000, // ✅ انتظار 15 ثانية
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed ? location.coords.speed * 3.6 : 0, // Convert m/s to km/h
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error("Get current location error:", error);
      return null;
    }
  }

  /**
   * Start watching location changes
   * @param {function} callback - Called on each location update
   * @param {object} options - Location watching options
   * @returns {Promise<boolean>}
   */
  async startWatching(callback, options = {}) {
    try {
      if (this.isTracking) {
        console.warn("Already tracking location");
        return false;
      }

      const hasPermission = await this.hasPermissions();

      if (!hasPermission) {
        throw new Error("Location permission not granted");
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.BestForNavigation, // ✅ أعلى دقة
        timeInterval: 500, // ✅ تحديث كل نصف ثانية
        distanceInterval: 2, // ✅ أو كل مترين
        mayShowUserSettingsDialog: true, // ✅ اطلب من المستخدم تفعيل GPS
      };

      const watchOptions = { ...defaultOptions, ...options };

      this.watchId = await Location.watchPositionAsync(
        watchOptions,
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed ? location.coords.speed * 3.6 : 0,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };

          // Validate coordinates
          if (
            validateCoordinates(locationData.latitude, locationData.longitude)
          ) {
            callback(locationData);

            // Call all registered callbacks
            this.callbacks.forEach((cb) => cb(locationData));
          }
        }
      );

      this.isTracking = true;
      console.log("✅ Location tracking started");
      return true;
    } catch (error) {
      console.error("Start watching error:", error);
      return false;
    }
  }

  /**
   * Stop watching location
   */
  async stopWatching() {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      this.isTracking = false;
      console.log("✅ Location tracking stopped");
    } catch (error) {
      console.error("Stop watching error:", error);
    }
  }

  /**
   * Register callback for location updates
   * @param {function} callback
   */
  addCallback(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
  }

  /**
   * Remove callback
   * @param {function} callback
   */
  removeCallback(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Calculate distance between two points
   * @param {object} point1 - {latitude, longitude}
   * @param {object} point2 - {latitude, longitude}
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number}
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
const locationService = new LocationService();
export default locationService;
