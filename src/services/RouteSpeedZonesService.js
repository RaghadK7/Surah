import { decodePolyline, calculateDistance } from "../utils/polylineDecoder";
import RoadsAPIService from "./RoadsAPIService";

class RouteSpeedZonesService {
  constructor() {
    this.cache = new Map();
  }

  async getSpeedZones(encodedPolyline) {
    try {
      console.log("Getting speed zones for route...");

      const routeCoordinates = decodePolyline(encodedPolyline);

      if (routeCoordinates.length === 0) {
        console.warn("No coordinates decoded");
        return [];
      }

      console.log(`Route has ${routeCoordinates.length} points`);

      const sampledPoints = this.smartSampleRoute(routeCoordinates);
      console.log(`Sampled ${sampledPoints.length} points`);

      const speedData = await this.getSpeedLimitsForPoints(sampledPoints);
      const speedZones = this.detectSpeedChanges(speedData);

      console.log(`Found ${speedZones.length} speed zone changes`);
      return speedZones;
    } catch (error) {
      console.error("Error getting speed zones:", error);
      return [];
    }
  }

  smartSampleRoute(coordinates) {
    const sampled = [coordinates[0]];
    let accumulatedDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const distance = calculateDistance(coordinates[i - 1], coordinates[i]);
      accumulatedDistance += distance;

      const currentSpeed = this.estimateSpeed(
        coordinates[i - 1],
        coordinates[i],
      );
      const threshold = currentSpeed > 100 ? 3000 : 1000;

      if (accumulatedDistance >= threshold) {
        sampled.push(coordinates[i]);
        accumulatedDistance = 0;
      }
    }

    if (sampled[sampled.length - 1] !== coordinates[coordinates.length - 1]) {
      sampled.push(coordinates[coordinates.length - 1]);
    }

    return sampled;
  }

  estimateSpeed(point1, point2) {
    const distance = calculateDistance(point1, point2);
    return distance > 500 ? 120 : 60;
  }

  async getSpeedLimitsForPoints(points) {
    try {
      console.log(`Fetching speed limits for ${points.length} points...`);

      const batchSize = 100;
      const allResults = [];

      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        const results = await RoadsAPIService.getSpeedLimitsForPath(batch);

        if (Array.isArray(results)) {
          allResults.push(...results);
        }

        if (i + batchSize < points.length) {
          await this.delay(500);
        }
      }

      if (!Array.isArray(allResults) || allResults.length === 0) {
        return points.map((point) => ({
          coordinate: point,
          speedLimit: 80,
          source: "fallback",
        }));
      }

      return allResults.map((result, index) => ({
        coordinate: result.coordinate || points[index],
        speedLimit: result.speedLimit || 80,
        source: result.source || "fallback",
      }));
    } catch (error) {
      console.error("Error fetching speed limits:", error);

      return points.map((point) => ({
        coordinate: point,
        speedLimit: 80,
        source: "fallback",
      }));
    }
  }

  detectSpeedChanges(speedData) {
    if (speedData.length === 0) return [];

    const changes = [];
    let currentSpeed = speedData[0].speedLimit;

    changes.push({
      ...speedData[0],
      isFirst: true,
      previousSpeed: null,
    });

    for (let i = 1; i < speedData.length; i++) {
      const point = speedData[i];

      if (point.speedLimit !== currentSpeed) {
        changes.push({
          ...point,
          previousSpeed: currentSpeed,
          isFirst: false,
        });

        currentSpeed = point.speedLimit;
      }
    }

    return changes;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clearCache() {
    this.cache.clear();
    console.log("Speed zones cache cleared");
  }
}

export default new RouteSpeedZonesService();
