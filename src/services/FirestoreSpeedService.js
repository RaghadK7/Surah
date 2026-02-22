import { db } from "../config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { speedLimitCache } from "../utils/cacheManager";
import { DEFAULT_SPEED_LIMITS } from "../config/constants";

class FirestoreSpeedService {
  constructor() {
    this.collectionName = "speed_limits";
  }

  // Generate location key
  generateKey(latitude, longitude, precision = 3) {
    const lat = latitude.toFixed(precision);
    const lng = longitude.toFixed(precision);
    return `${lat}_${lng}`;
  }

  // Get speed limit
  async getSpeedLimit(latitude, longitude) {
    try {
      // Check local cache first
      const cacheKey = speedLimitCache.generateKey(latitude, longitude);
      const cached = speedLimitCache.get(cacheKey);

      if (cached !== null) {
        return cached;
      }

      // Check Firestore
      const key = this.generateKey(latitude, longitude);
      const docRef = doc(db, this.collectionName, key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Cache for 1 hour
        speedLimitCache.set(cacheKey, data.speedLimit);

        return data;
      }

      // Not found - return default
      const fallback = {
        speedLimit: DEFAULT_SPEED_LIMITS.main_road,
        roadName: "طريق غير معروف",
        roadType: "unknown",
        source: "default",
      };

      return fallback;
    } catch (error) {
      console.error("Firestore get error:", error);
      return {
        speedLimit: DEFAULT_SPEED_LIMITS.main_road,
        roadName: "خطأ في التحميل",
        roadType: "unknown",
        source: "error",
      };
    }
  }

  // Save speed limit to Firestore
  async saveSpeedLimit(latitude, longitude, data) {
    try {
      const key = this.generateKey(latitude, longitude);
      const docRef = doc(db, this.collectionName, key);

      const dataToSave = {
        speedLimit: data.speedLimit,
        roadName: data.roadName || "Unknown",
        roadType: data.roadType || "unknown",
        city: data.city || "جدة",
        latitude,
        longitude,
        source: data.source || "manual",
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(docRef, dataToSave, { merge: true });

      // Update cache
      const cacheKey = speedLimitCache.generateKey(latitude, longitude);
      speedLimitCache.set(cacheKey, data.speedLimit);

      return { success: true };
    } catch (error) {
      console.error("Firestore save error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get nearby speed limits (for batch)
  async getNearbySpeedLimits(latitude, longitude, radiusKm = 1) {
    try {
      // Calculate bounding box
      const latDelta = radiusKm / 111; // 1 degree lat ≈ 111 km
      const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

      const minLat = (latitude - latDelta).toFixed(3);
      const maxLat = (latitude + latDelta).toFixed(3);

      // Query Firestore
      const q = query(
        collection(db, this.collectionName),
        where("latitude", ">=", parseFloat(minLat)),
        where("latitude", "<=", parseFloat(maxLat)),
      );

      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return results;
    } catch (error) {
      console.error("Firestore nearby query error:", error);
      return [];
    }
  }

  // Batch import from external API
  async batchImport(locations) {
    try {
      const promises = locations.map((loc) =>
        this.saveSpeedLimit(loc.latitude, loc.longitude, {
          speedLimit: loc.speedLimit,
          roadName: loc.roadName,
          roadType: loc.roadType,
          city: loc.city,
          source: loc.source,
        }),
      );

      await Promise.all(promises);
      return { success: true, count: locations.length };
    } catch (error) {
      console.error("Batch import error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get stats
  async getStats() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return {
        totalRecords: snapshot.size,
        cacheStats: speedLimitCache.getStats(),
      };
    } catch (error) {
      console.error("Stats error:", error);
      return { totalRecords: 0 };
    }
  }
}

const firestoreSpeedService = new FirestoreSpeedService();

export default firestoreSpeedService;
