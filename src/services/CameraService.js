import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import ENV from "../config/env";
import { SAUDI_SPEED_CAMERAS } from "../data/saudiCameras";
import { settingsManager } from "./StorageService";

/**
 * Enhanced Camera Service - Speed camera management with Google Maps integration
 * Handles fetching and managing speed camera locations
 */
class CameraService {
  constructor() {
    this.cameras = [];
    this.lastFetch = 0;
    this.cacheDuration = 3600000; // 1 hour
    this.alertedCameras = new Set(); // Track which cameras already alerted
    this.alertDistance = 1000; // Alert when 1km away
    this.resetDistance = 2000; // Reset alert when 2km past camera
  }

  /**
   * Fetch all cameras from multiple sources
   */
  async fetchCameras(forceRefresh = false) {
    try {
      const now = Date.now();

      // Use cache if available and not expired
      if (
        !forceRefresh &&
        this.cameras.length > 0 &&
        now - this.lastFetch < this.cacheDuration
      ) {
        return this.cameras;
      }

      // Fetch from multiple sources (local data + Firestore معطل مؤقتاً)
      const [localCameras, googleCameras] = await Promise.allSettled([
        this.fetchFromLocalData(),
        this.fetchFromGooglePlaces(),
      ]);

      let allCameras = [];

      // Process local cameras
      if (localCameras.status === "fulfilled") {
        allCameras = [...allCameras, ...localCameras.value];
      }

      // Process Google cameras only
      if (googleCameras.status === "fulfilled") {
        allCameras = [...allCameras, ...googleCameras.value];
      }

      // Remove duplicates based on location proximity
      this.cameras = this.removeDuplicateCameras(allCameras);

      this.lastFetch = now;
      console.log(`✅ Fetched ${this.cameras.length} cameras from all sources`);

      return this.cameras;
    } catch (error) {
      console.error("Fetch cameras error:", error);
      return this.cameras; // Return cached cameras on error
    }
  }

  /**
   * Fetch cameras from local data (static database)
   */
  async fetchFromLocalData() {
    try {
      console.log("📊 Loading cameras from local Saudi database...");
      
      // Return active cameras only
      const activeCameras = SAUDI_SPEED_CAMERAS.filter(camera => camera.active).map(camera => ({
        ...camera,
        source: "local_saudi_data",
      }));
      
      console.log(`✅ Loaded ${activeCameras.length} cameras from local database`);
      return activeCameras;
    } catch (error) {
      console.error("Local data cameras error:", error);
      return [];
    }
  }

  /**
   * Fetch cameras from Firestore (معطل مؤقتاً)
   */
  async fetchFromFirestore() {
    try {
      console.log("⚠️ Firestore cameras disabled temporarily");
      return [];
      
      /* معطل مؤقتاً لتجنب مشكلة الصلاحيات
      const camerasRef = collection(db, "speed_cameras");
      const q = query(camerasRef, where("active", "==", true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        source: "firestore",
        ...doc.data(),
      }));
      */
    } catch (error) {
      console.error("Firestore cameras error:", error);
      return [];
    }
  }

  /**
   * Fetch cameras from Google Places API (speed cameras, traffic enforcement)
   */
  async fetchFromGooglePlaces() {
    try {
      if (!ENV.GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key not available");
        return [];
      }

      // Note: This would require implementing Google Places API calls
      // for now, return empty array
      // In a real implementation, you would search for places like:
      // - "speed camera"
      // - "traffic enforcement"
      // - "police checkpoint"

      return [];
    } catch (error) {
      console.error("Google Places cameras error:", error);
      return [];
    }
  }

  /**
   * Remove duplicate cameras based on proximity
   */
  removeDuplicateCameras(cameras) {
    const uniqueCameras = [];
    const proximityThreshold = 0.1; // 100 meters

    for (const camera of cameras) {
      // Skip cameras without proper location data
      if (!camera || !camera.location || !camera.location.latitude || !camera.location.longitude) {
        continue;
      }
      
      const isDuplicate = uniqueCameras.some(
        (existing) => {
          // Ensure existing camera also has proper location data
          if (!existing || !existing.location || !existing.location.latitude || !existing.location.longitude) {
            return false;
          }
          
          return this.calculateDistance(
            camera.location.latitude,
            camera.location.longitude,
            existing.location.latitude,
            existing.location.longitude,
          ) < proximityThreshold;
        }
      );

      if (!isDuplicate) {
        uniqueCameras.push(camera);
      }
    }

    return uniqueCameras;
  }

  /**
   * Get cameras near location
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} radiusKm - Search radius in kilometers
   */
  async getCamerasNearLocation(latitude, longitude, radiusKm = 5) {
    try {
      await this.fetchCameras();

      const nearbyCameras = this.cameras.filter((camera) => {
        // Ensure camera has proper location data
        if (!camera || !camera.location || !camera.location.latitude || !camera.location.longitude) {
          return false;
        }
        
        const distance = this.calculateDistance(
          latitude,
          longitude,
          camera.location.latitude,
          camera.location.longitude,
        );
        return distance <= radiusKm;
      });

      return nearbyCameras;
    } catch (error) {
      console.error("Get nearby cameras error:", error);
      return [];
    }
  }

  /**
   * Enhanced camera approach detection
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} speed - Current speed in km/h
   * @param {number} heading - Direction in degrees (0-360)
   * @returns {object|null} Camera alert info if approaching, null otherwise
   */
  async checkApproachingCamera(latitude, longitude, speed, heading = null) {
    try {
      // ✅ فحص إعدادات تنبيه الكاميرات
      const settings = await settingsManager.get();
      if (settings.cameraAlerts === false) {
        return null; // التنبيهات معطلة
      }

      await this.fetchCameras();

      for (const camera of this.cameras) {
        // Ensure camera has proper location data
        if (!camera || !camera.location || !camera.location.latitude || !camera.location.longitude) {
          continue;
        }
        
        const distance = this.calculateDistance(
          latitude,
          longitude,
          camera.location.latitude,
          camera.location.longitude,
        );

        // Clean up old alerts
        if (distance > this.resetDistance) {
          this.alertedCameras.delete(camera.id);
          continue;
        }

        // Check if approaching
        if (
          distance <= this.alertDistance &&
          !this.alertedCameras.has(camera.id)
        ) {
          // Calculate time to reach camera
          const timeToCamera = distance / (speed / 3.6); // Convert km/h to m/s

          // Determine alert priority based on distance and speed
          let priority = "low";
          if (distance < 500) {
            priority = "high";
          } else if (distance < 800) {
            priority = "medium";
          }

          // Direction awareness (if heading is available)
          let isOnApproachPath = true;
          if (heading !== null) {
            const bearingToCamera = this.calculateBearing(
              latitude,
              longitude,
              camera.location.latitude,
              camera.location.longitude,
            );
            const angleDiff = Math.abs(heading - bearingToCamera);
            isOnApproachPath = angleDiff <= 45 || angleDiff >= 315; // Within 45 degrees
          }

          if (isOnApproachPath) {
            this.alertedCameras.add(camera.id);

            return {
              camera,
              distance: Math.round(distance),
              timeToCamera: Math.round(timeToCamera),
              priority,
              type: camera.type || "speed",
              speedLimit: camera.speedLimit || null,
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Check approaching camera error:", error);
      return null;
    }
  }

  /**
   * Mark camera as alerted
   * @param {string} cameraId
   */
  markCameraAlerted(cameraId) {
    this.alertedCameras.add(cameraId);
  }

  /**
   * Get camera by ID
   * @param {string} cameraId - Camera ID to fetch
   * @returns {Object|null} Camera data or null if not found
   */
  async getCameraById(cameraId) {
    try {
      const cameraRef = doc(db, "speed_cameras", cameraId);
      const snapshot = await getDoc(cameraRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }

      return null;
    } catch (error) {
      console.error("Get camera by ID error:", error);
      return null;
    }
  }

  /**
   * Add new camera (admin function)
   */
  async addCamera(cameraData) {
    try {
      const camerasRef = collection(db, "speed_cameras");
      const docRef = await addDoc(camerasRef, {
        ...cameraData,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Camera added:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Add camera error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update camera (admin function)
   */
  async updateCamera(cameraId, updates) {
    try {
      const cameraRef = doc(db, "speed_cameras", cameraId);
      await updateDoc(cameraRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Camera updated:", cameraId);
      return { success: true };
    } catch (error) {
      console.error("Update camera error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cameras = [];
    this.lastFetch = 0;
    this.alertedCameras.clear();
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.degreesToRadians(lon2 - lon1);
    const lat1Rad = this.degreesToRadians(lat1);
    const lat2Rad = this.degreesToRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return (this.radiansToDegrees(bearing) + 360) % 360;
  }

  /**
   * Convert degrees to radians
   */
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Reset alert tracking
   */
  resetAlerts() {
    this.alertedCameras.clear();
    console.log("🔄 Camera alerts reset");
  }

  /**
   * Get camera statistics
   */
  getStatistics() {
    return {
      totalCameras: this.cameras.length,
      alertedCameras: this.alertedCameras.size,
      lastFetch: new Date(this.lastFetch).toISOString(),
      cacheAge: Date.now() - this.lastFetch,
    };
  }
}

export default new CameraService();
