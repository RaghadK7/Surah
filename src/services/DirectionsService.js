import ENV from "../config/env";

class DirectionsService {
  constructor() {
    this.currentRoute = null;
    this.alternativeRoutes = [];
  }

  async getRoute(origin, destination, options = {}) {
    try {
      const {
        alternatives = true,
        avoidTolls = false,
        avoidHighways = false,
        avoidFerries = false,
      } = options;

      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;

      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${ENV.GOOGLE_MAPS_API_KEY}&mode=driving`;

      if (alternatives) url += "&alternatives=true";
      if (avoidTolls) url += "&avoid=tolls";
      if (avoidHighways) url += "&avoid=highways";
      if (avoidFerries) url += "&avoid=ferries";

      console.log("Fetching routes...");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Directions API status:", result.status);
      console.log(`Found ${result.routes?.length || 0} routes`);

      if (result.status === "OK" && result.routes.length > 0) {
        this.alternativeRoutes = result.routes.map((route, index) => {
          const leg = route.legs[0];
          return {
            id: index,
            polyline: route.overview_polyline.points,
            steps: leg.steps,
            distance: leg.distance.value,
            distanceText: leg.distance.text,
            duration: leg.duration.value,
            durationText: leg.duration.text,
            summary: route.summary || `Route ${index + 1}`,
            isFastest: index === 0,
            warnings: route.warnings || [],
          };
        });

        const bestRoute = this.alternativeRoutes[0];

        this.currentRoute = {
          polyline: bestRoute.polyline,
          steps: bestRoute.steps,
          distance: bestRoute.distance,
          duration: bestRoute.duration,
        };

        console.log(
          `Selected route: ${bestRoute.summary} (${bestRoute.distanceText}, ${bestRoute.durationText})`,
        );

        return {
          success: true,
          route: {
            distance: bestRoute.distance,
            distanceText: bestRoute.distanceText,
            duration: bestRoute.duration,
            durationText: bestRoute.durationText,
            polyline: bestRoute.polyline,
            summary: bestRoute.summary,
          },
          steps: bestRoute.steps,
          alternatives: this.alternativeRoutes,
        };
      } else {
        console.error(
          "Directions API error:",
          result.status,
          result.error_message,
        );
        return {
          success: false,
          error: result.error_message || result.status || "No route found",
        };
      }
    } catch (error) {
      console.error("DirectionsService error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getAlternativeRoutes() {
    return this.alternativeRoutes;
  }

  selectRoute(routeId) {
    const selected = this.alternativeRoutes.find((r) => r.id === routeId);
    if (selected) {
      this.currentRoute = {
        polyline: selected.polyline,
        steps: selected.steps,
        distance: selected.distance,
        duration: selected.duration,
      };
      return {
        success: true,
        route: {
          distance: selected.distance,
          distanceText: selected.distanceText,
          duration: selected.duration,
          durationText: selected.durationText,
          polyline: selected.polyline,
          summary: selected.summary,
        },
        steps: selected.steps,
      };
    }
    return { success: false };
  }

  getRemainingInfo(currentLocation) {
    if (!this.currentRoute) return null;

    return {
      distanceText: `${(this.currentRoute.distance / 1000).toFixed(1)} km`,
      durationText: `${Math.round(this.currentRoute.duration / 60)} min`,
    };
  }

  getSpeedLimitAtLocation(location) {
    return null;
  }

  /**
   * Get route data optimized for RouteAwareSpeedService
   * @returns {Object|null} - Route data for speed processing
   */
  getRouteForSpeedProcessing() {
    if (!this.currentRoute) {
      return null;
    }

    return {
      polyline: this.currentRoute.polyline,
      steps: this.currentRoute.steps,
      distance: this.currentRoute.distance,
      duration: this.currentRoute.duration,
      summary: this.alternativeRoutes[0]?.summary || 'Current Route'
    };
  }

  /**
   * Check if there are alternative routes available
   * @returns {boolean} - Has alternative routes
   */
  hasAlternativeRoutes() {
    return this.alternativeRoutes && this.alternativeRoutes.length > 1;
  }

  clearRoute() {
    this.currentRoute = null;
    this.alternativeRoutes = [];
  }
}

export default new DirectionsService();
