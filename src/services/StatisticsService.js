import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  CURRENT_TRIP: "@speedguard/current_trip",
  OVERALL_STATS: "@speedguard/overall_stats",
  SPEED_HISTORY: "@speedguard/speed_history",
  TRIP_HISTORY: "@speedguard/trip_history",
};

class StatisticsService {
  async getCurrentTrip() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRIP);
      return data
        ? JSON.parse(data)
        : {
            distance: 0,
            duration: 0,
            avgSpeed: 0,
            maxSpeed: 0,
            startTime: null,
            speedingCount: 0,
            isActive: false,
          };
    } catch (error) {
      console.error("Error getting current trip:", error);
      return null;
    }
  }

  async updateCurrentTrip(tripData) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_TRIP,
        JSON.stringify(tripData),
      );
      return true;
    } catch (error) {
      console.error("Error updating current trip:", error);
      return false;
    }
  }

  async getOverallStats() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OVERALL_STATS);
      return data
        ? JSON.parse(data)
        : {
            totalDistance: 0,
            totalTrips: 0,
            totalDuration: 0,
            maxSpeedEver: 0,
            speedingCount: 0,
            avgSpeedOverall: 0,
          };
    } catch (error) {
      console.error("Error getting overall stats:", error);
      return null;
    }
  }

  async updateOverallStats(stats) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OVERALL_STATS,
        JSON.stringify(stats),
      );
      return true;
    } catch (error) {
      console.error("Error updating overall stats:", error);
      return false;
    }
  }

  async addSpeedRecord(speed, timestamp) {
    try {
      const history = await this.getSpeedHistory();
      const record = { speed, timestamp: timestamp || Date.now() };

      history.push(record);

      if (history.length > 1000) {
        history.shift();
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SPEED_HISTORY,
        JSON.stringify(history),
      );

      return true;
    } catch (error) {
      console.error("Error adding speed record:", error);
      return false;
    }
  }

  async getSpeedHistory(limit = 100) {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SPEED_HISTORY);
      const history = data ? JSON.parse(data) : [];
      return limit ? history.slice(-limit) : history;
    } catch (error) {
      console.error("Error getting speed history:", error);
      return [];
    }
  }

  async saveTrip(tripData) {
    try {
      const trips = await this.getTripHistory();
      const trip = {
        ...tripData,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      trips.unshift(trip);

      await AsyncStorage.setItem(
        STORAGE_KEYS.TRIP_HISTORY,
        JSON.stringify(trips),
      );

      const overallStats = await this.getOverallStats();
      const totalDistance = overallStats.totalDistance + tripData.distance;
      const totalTrips = overallStats.totalTrips + 1;
      const totalDuration = overallStats.totalDuration + tripData.duration;

      await this.updateOverallStats({
        totalDistance,
        totalTrips,
        totalDuration,
        maxSpeedEver: Math.max(overallStats.maxSpeedEver, tripData.maxSpeed),
        speedingCount: overallStats.speedingCount + tripData.speedingCount,
        avgSpeedOverall: totalDistance / (totalDuration / 3600),
      });

      return trip;
    } catch (error) {
      console.error("Error saving trip:", error);
      return null;
    }
  }

  async getTripHistory() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRIP_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting trip history:", error);
      return [];
    }
  }

  async deleteTrip(tripId) {
    try {
      const trips = await this.getTripHistory();
      const filteredTrips = trips.filter((trip) => trip.id !== tripId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRIP_HISTORY,
        JSON.stringify(filteredTrips),
      );
      return true;
    } catch (error) {
      console.error("Error deleting trip:", error);
      return false;
    }
  }

  async resetCurrentTrip() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TRIP);
      await AsyncStorage.removeItem(STORAGE_KEYS.SPEED_HISTORY);
      return true;
    } catch (error) {
      console.error("Error resetting current trip:", error);
      return false;
    }
  }

  async getDailyStats(days = 7) {
    try {
      const trips = await this.getTripHistory();
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      const dailyData = Array.from({ length: days }, (_, i) => {
        const date = new Date(now - (days - 1 - i) * dayMs);
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          date: date.toISOString().split("T")[0],
          distance: 0,
          trips: 0,
        };
      });

      trips.forEach((trip) => {
        const tripDate = new Date(trip.timestamp).toISOString().split("T")[0];
        const dayData = dailyData.find((d) => d.date === tripDate);
        if (dayData) {
          dayData.distance += trip.distance;
          dayData.trips += 1;
        }
      });

      return dailyData;
    } catch (error) {
      console.error("Error getting daily stats:", error);
      return [];
    }
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  formatSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  }

  formatDistance(distance) {
    if (distance >= 1) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance * 1000)} m`;
    }
  }
}

export default new StatisticsService();
