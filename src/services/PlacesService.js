import ENV from "../config/env";

class PlacesService {
  constructor() {
    this.sessionToken = null;
  }

  generateSessionToken() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async searchPlaces(query, location = null) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      this.sessionToken = this.generateSessionToken();

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${ENV.GOOGLE_MAPS_API_KEY}&sessiontoken=${this.sessionToken}&language=ar`;

      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=50000`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.predictions) {
        return data.predictions.map((prediction) => ({
          placeId: prediction.place_id,
          name: prediction.structured_formatting.main_text,
          address: prediction.description,
          description: prediction.structured_formatting.secondary_text,
        }));
      }

      return [];
    } catch (error) {
      console.error("Search places error:", error);
      return [];
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${ENV.GOOGLE_MAPS_API_KEY}&sessiontoken=${this.sessionToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const result = data.result;
        return {
          placeId,
          name: result.name,
          address: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error("Get place details error:", error);
      return null;
    }
  }

  async searchNearby(location, radius = 5000, type = null) {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&key=${ENV.GOOGLE_MAPS_API_KEY}`;

      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results) {
        return data.results.map((place) => ({
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types: place.types,
          rating: place.rating,
        }));
      }

      return [];
    } catch (error) {
      console.error("Search nearby error:", error);
      return [];
    }
  }
}

export default new PlacesService();
