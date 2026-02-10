import { regularStorage } from "./StorageService";
import { validateSpeed, validateCoordinates } from "../utils/validators";

/**
 * Stats Service
 * Tracks and manages user driving statistics
 */
class StatsService {
  constructor() {
    this.STORAGE_KEY = "user_stats";
    this.TRIPS_KEY = "user_trips";
    this.stats = null;
    this.currentTrip = null;
  }

  /**
   * Initialize stats structure
   * @returns {object}
   */
  getDefaultStats() {
    return {
      totalDistance: 0, // kilometers
      totalDuration: 0, // seconds
      totalTrips: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      speedAlerts: 0,
      cameraAlerts: 0,
      mostUsedRoads: {}, // { roadName: count }
      drivingScore: 100, // 0-100
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Load stats from storage
   * @returns {Promise<object>}
   */
  async loadStats() {
    try {
      const stored = await regularStorage.get(this.STORAGE_KEY);
      this.stats = stored || this.getDefaultStats();
      return this.stats;
    } catch (error) {
      console.error("Load stats error:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Save stats to storage
   * @returns {Promise<boolean>}
   */
  async saveStats() {
    try {
      if (!this.stats) {
        this.stats = this.getDefaultStats();
      }

      this.stats.lastUpdated = new Date().toISOString();
      await regularStorage.save(this.STORAGE_KEY, this.stats);
      return true;
    } catch (error) {
      console.error("Save stats error:", error);
      return false;
    }
  }

  /**
   * Get current stats
   * @returns {Promise<object>}
   */
  async getStats() {
    if (!this.stats) {
      await this.loadStats();
    }
    return this.stats;
  }

  /**
   * Start a new trip
   * @param {object} startLocation - {latitude, longitude}
   * @returns {object}
   */
  startTrip(startLocation) {
    if (!validateCoordinates(startLocation.latitude, startLocation.longitude)) {
      throw new Error("Invalid start location");
    }

    this.currentTrip = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      startLocation: startLocation,
      endLocation: null,
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      speedData: [], // Array of {time, speed, location}
      alerts: [],
      roads: [],
    };

    console.log("🚗 Trip started:", this.currentTrip.id);
    return this.currentTrip;
  }

  /**
   * Update current trip with new data
   * @param {object} data - {location, speed, road, alert}
   */
  updateTrip(data) {
    if (!this.currentTrip) {
      console.warn("No active trip");
      return;
    }

    const now = new Date().toISOString();

    // Add speed data point
    if (data.speed !== undefined && validateSpeed(data.speed)) {
      this.currentTrip.speedData.push({
        time: now,
        speed: data.speed,
        location: data.location,
      });

      // Update max speed
      if (data.speed > this.currentTrip.maxSpeed) {
        this.currentTrip.maxSpeed = data.speed;
      }

      // Calculate average speed
      const speeds = this.currentTrip.speedData.map((d) => d.speed);
      const sum = speeds.reduce((acc, val) => acc + val, 0);
      this.currentTrip.averageSpeed = sum / speeds.length;
    }

    // Add road
    if (data.road) {
      if (!this.currentTrip.roads.includes(data.road)) {
        this.currentTrip.roads.push(data.road);
      }
    }

    // Add alert
    if (data.alert) {
      this.currentTrip.alerts.push({
        time: now,
        type: data.alert.type,
        message: data.alert.message,
        location: data.location,
      });
    }

    // Calculate distance
    if (data.location && this.currentTrip.speedData.length > 1) {
      const lastPoint =
        this.currentTrip.speedData[this.currentTrip.speedData.length - 2];
      const distance = this.calculateDistance(
        lastPoint.location,
        data.location
      );
      this.currentTrip.distance += distance;
    }

    // Calculate duration
    const startTime = new Date(this.currentTrip.startTime);
    const currentTime = new Date();
    this.currentTrip.duration = Math.floor((currentTime - startTime) / 1000);
  }

  /**
   * End current trip
   * @param {object} endLocation - {latitude, longitude}
   * @returns {Promise<object>}
   */
  async endTrip(endLocation) {
    if (!this.currentTrip) {
      console.warn("No active trip to end");
      return null;
    }

    if (!validateCoordinates(endLocation.latitude, endLocation.longitude)) {
      throw new Error("Invalid end location");
    }

    this.currentTrip.endLocation = endLocation;
    this.currentTrip.endTime = new Date().toISOString();

    // Update global stats
    await this.updateGlobalStats(this.currentTrip);

    // Save trip to history
    await this.saveTrip(this.currentTrip);

    const completedTrip = { ...this.currentTrip };
    this.currentTrip = null;

    console.log("🏁 Trip ended:", completedTrip.id);
    return completedTrip;
  }

  /**
   * Update global statistics with completed trip
   * @param {object} trip
   */
  async updateGlobalStats(trip) {
    if (!this.stats) {
      await this.loadStats();
    }

    // Update totals
    this.stats.totalDistance += trip.distance;
    this.stats.totalDuration += trip.duration;
    this.stats.totalTrips += 1;

    // Update max speed
    if (trip.maxSpeed > this.stats.maxSpeed) {
      this.stats.maxSpeed = trip.maxSpeed;
    }

    // Update average speed (weighted average)
    const totalSpeed =
      this.stats.averageSpeed * (this.stats.totalTrips - 1) + trip.averageSpeed;
    this.stats.averageSpeed = totalSpeed / this.stats.totalTrips;

    // Update alerts
    this.stats.speedAlerts += trip.alerts.filter(
      (a) => a.type === "speed"
    ).length;
    this.stats.cameraAlerts += trip.alerts.filter(
      (a) => a.type === "camera"
    ).length;

    // Update most used roads
    trip.roads.forEach((road) => {
      this.stats.mostUsedRoads[road] =
        (this.stats.mostUsedRoads[road] || 0) + 1;
    });

    // Calculate driving score
    this.stats.drivingScore = this.calculateDrivingScore();

    // Save updated stats
    await this.saveStats();
  }

  /**
   * Calculate driving score (0-100)
   * @returns {number}
   */
  calculateDrivingScore() {
    let score = 100;

    if (this.stats.totalTrips === 0) {
      return 100;
    }

    // Deduct points for alerts
    const alertsPerTrip =
      (this.stats.speedAlerts + this.stats.cameraAlerts) /
      this.stats.totalTrips;
    score -= alertsPerTrip * 5; // -5 points per alert per trip

    // Bonus for low alert rate
    if (alertsPerTrip < 1) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Save trip to history
   * @param {object} trip
   * @returns {Promise<boolean>}
   */
  async saveTrip(trip) {
    try {
      const trips = (await regularStorage.get(this.TRIPS_KEY)) || [];

      // Keep only last 50 trips
      trips.unshift(trip);
      const trimmedTrips = trips.slice(0, 50);

      await regularStorage.save(this.TRIPS_KEY, trimmedTrips);
      return true;
    } catch (error) {
      console.error("Save trip error:", error);
      return false;
    }
  }

  /**
   * Get trip history
   * @param {number} limit - Number of trips to return
   * @returns {Promise<array>}
   */
  async getTripHistory(limit = 10) {
    try {
      const trips = (await regularStorage.get(this.TRIPS_KEY)) || [];
      return trips.slice(0, limit);
    } catch (error) {
      console.error("Get trip history error:", error);
      return [];
    }
  }

  /**
   * Reset statistics
   * @returns {Promise<boolean>}
   */
  async resetStats() {
    try {
      this.stats = this.getDefaultStats();
      await this.saveStats();
      await regularStorage.delete(this.TRIPS_KEY);

      console.log("✅ Stats reset");
      return true;
    } catch (error) {
      console.error("Reset stats error:", error);
      return false;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
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
    return R * c;
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
const statsService = new StatsService();
export default statsService;
