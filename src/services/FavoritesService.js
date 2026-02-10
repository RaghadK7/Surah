import { regularStorage } from "./StorageService";

/**
 * Favorites Service
 * Manages user favorite places
 */
class FavoritesService {
  constructor() {
    this.STORAGE_KEY = "user_favorites";
    this.favorites = [];
  }

  /**
   * Load favorites from storage
   * @returns {Promise<array>}
   */
  async loadFavorites() {
    try {
      const stored = await regularStorage.get(this.STORAGE_KEY);
      this.favorites = stored || [];
      return this.favorites;
    } catch (error) {
      console.error("Load favorites error:", error);
      return [];
    }
  }

  /**
   * Get all favorites
   * @returns {Promise<array>}
   */
  async getFavorites() {
    if (this.favorites.length === 0) {
      await this.loadFavorites();
    }
    return this.favorites;
  }

  /**
   * Add favorite place
   * @param {object} place
   * @returns {Promise<boolean>}
   */
  async addFavorite(place) {
    try {
      if (!place || !place.latitude || !place.longitude) {
        throw new Error("Invalid place data");
      }

      // Check if already exists
      const exists = this.favorites.some((fav) => fav.id === place.id);

      if (exists) {
        console.warn("Place already in favorites");
        return false;
      }

      const favorite = {
        id: place.id || Date.now().toString(),
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        type: place.type || "custom", // home, work, custom
        icon: place.icon || "star",
        createdAt: new Date().toISOString(),
      };

      this.favorites.push(favorite);
      await regularStorage.save(this.STORAGE_KEY, this.favorites);

      console.log("✅ Favorite added:", favorite.name);
      return true;
    } catch (error) {
      console.error("Add favorite error:", error);
      return false;
    }
  }

  /**
   * Remove favorite by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async removeFavorite(id) {
    try {
      this.favorites = this.favorites.filter((fav) => fav.id !== id);
      await regularStorage.save(this.STORAGE_KEY, this.favorites);

      console.log("✅ Favorite removed");
      return true;
    } catch (error) {
      console.error("Remove favorite error:", error);
      return false;
    }
  }

  /**
   * Update favorite
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<boolean>}
   */
  async updateFavorite(id, updates) {
    try {
      const index = this.favorites.findIndex((fav) => fav.id === id);

      if (index === -1) {
        throw new Error("Favorite not found");
      }

      this.favorites[index] = {
        ...this.favorites[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await regularStorage.save(this.STORAGE_KEY, this.favorites);

      console.log("✅ Favorite updated");
      return true;
    } catch (error) {
      console.error("Update favorite error:", error);
      return false;
    }
  }

  /**
   * Get favorite by type
   * @param {string} type - 'home', 'work', or 'custom'
   * @returns {Promise<array>}
   */
  async getFavoritesByType(type) {
    await this.loadFavorites();
    return this.favorites.filter((fav) => fav.type === type);
  }

  /**
   * Check if place is favorite
   * @param {string} placeId
   * @returns {boolean}
   */
  isFavorite(placeId) {
    return this.favorites.some((fav) => fav.id === placeId);
  }

  /**
   * Clear all favorites
   * @returns {Promise<boolean>}
   */
  async clearAll() {
    try {
      this.favorites = [];
      await regularStorage.delete(this.STORAGE_KEY);

      console.log("✅ All favorites cleared");
      return true;
    } catch (error) {
      console.error("Clear favorites error:", error);
      return false;
    }
  }
}

// Export singleton instance
const favoritesService = new FavoritesService();
export default favoritesService;
