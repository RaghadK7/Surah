/**
 * Speed Service - Legacy Wrapper
 * Wrapper around the new RouteAwareSpeedService for backward compatibility
 * 
 * Provides a bridge between the old proximity-based system and new route-aware system
 * while maintaining existing API contracts
 */

import RouteAwareSpeedService from './RouteAwareSpeedService';
import PlacesService from './PlacesService';
import { SAUDI_SPEED_RULES } from '../config/constants';

class SpeedService {
  constructor() {
    this.isUsingRouteAware = false;
    this.lastSpeedResult = null;
    this.fallbackMode = false;
  }

  /**
   * Primary method: Get speed limit for location
   * @param {number} latitude - GPS latitude
   * @param {number} longitude - GPS longitude
   * @param {Object} options - Options (heading, route context, etc)
   * @returns {Promise<number>} - Speed limit in km/h
   */
  async getSpeedLimit(latitude, longitude, options = {}) {
    try {
      const gpsPosition = {
        latitude,
        longitude,
        heading: options.heading,
        speed: options.speed,
        accuracy: options.accuracy
      };

      // Try route-aware system first if available
      if (this.isUsingRouteAware) {
        const routeAwareResult = await this.getRouteAwareSpeedLimit(gpsPosition, options);
        if (routeAwareResult !== null) {
          return routeAwareResult;
        }
      }

      // Fallback to traditional method
      console.log('📍 Using fallback speed detection');
      return await this.getFallbackSpeedLimit(latitude, longitude, options);

    } catch (error) {
      console.error('❌ Speed limit detection failed:', error);
      return this.getSafetyFallback();
    }
  }

  /**
   * Get speed limit using route-aware system
   * @param {Object} gpsPosition - GPS position
   * @param {Object} options - Additional options
   * @returns {Promise<number|null>} - Speed limit or null if not available
   */
  async getRouteAwareSpeedLimit(gpsPosition, options = {}) {
    try {
      // Get nearby POIs for zone detection
      const nearbyPOIs = options.skipPOIs ? [] : await this.getNearbyPOIs(gpsPosition);
      
      const result = await RouteAwareSpeedService.getCurrentSpeedLimit(
        gpsPosition,
        nearbyPOIs,
        options
      );

      if (result.success) {
        this.lastSpeedResult = result;
        console.log(`🎯 Route-aware speed: ${result.speedLimit} km/h (${result.speedSource})`);
        return result.speedLimit;
      }

      return null;

    } catch (error) {
      console.warn('⚠️ Route-aware system failed:', error);
      return null;
    }
  }

  /**
   * Fallback speed limit detection (compatibility mode)
   * @param {number} latitude - GPS latitude
   * @param {number} longitude - GPS longitude
   * @param {Object} options - Additional options
   * @returns {Promise<number>} - Speed limit
   */
  async getFallbackSpeedLimit(latitude, longitude, options = {}) {
    // Simple fallback based on area type
    try {
      const nearbyPOIs = await this.getNearbyPOIs({ latitude, longitude });
      
      // Check for special zones
      const schoolNearby = nearbyPOIs.some(poi => 
        poi.types?.some(type => ['school', 'university'].includes(type))
      );
      
      const hospitalNearby = nearbyPOIs.some(poi =>
        poi.types?.some(type => ['hospital', 'clinic'].includes(type))
      );

      if (schoolNearby) return 30;
      if (hospitalNearby) return 40;

      // Default based on likely road type
      return this.estimateRoadTypeSpeed(options.roadHint);

    } catch (error) {
      console.warn('⚠️ Fallback detection failed:', error);
      return this.getSafetyFallback();
    }
  }

  /**
   * Estimate speed based on road characteristics
   * @param {string} roadHint - Road type hint
   * @returns {number} - Estimated speed limit
   */
  estimateRoadTypeSpeed(roadHint) {
    if (!roadHint) return 60;

    const lowerHint = roadHint.toLowerCase();
    
    if (lowerHint.includes('highway') || lowerHint.includes('طريق سريع')) {
      return SAUDI_SPEED_RULES.motorway;
    }
    if (lowerHint.includes('main') || lowerHint.includes('رئيسي')) {
      return SAUDI_SPEED_RULES.trunk;
    }
    if (lowerHint.includes('residential') || lowerHint.includes('سكني')) {
      return SAUDI_SPEED_RULES.residential;
    }
    
    return SAUDI_SPEED_RULES.secondary;
  }

  /**
   * Get nearby points of interest for zone detection
   * @param {Object} position - GPS position
   * @returns {Promise<Array>} - Nearby POIs
   */
  async getNearbyPOIs(position) {
    try {
      if (!PlacesService || typeof PlacesService.searchNearbyPlaces !== 'function') {
        return [];
      }

      const places = await PlacesService.searchNearbyPlaces(
        position.latitude,
        position.longitude,
        150, // 150m radius
        ['school', 'hospital', 'place_of_worship', 'shopping_mall']
      );

      return places || [];

    } catch (error) {
      console.warn('⚠️ POI fetch failed:', error);
      return [];
    }
  }

  /**
   * Get safety fallback speed
   * @returns {number} - Safe default speed
   */
  getSafetyFallback() {
    return 60; // Conservative default for Saudi roads
  }

  /**
   * Enable route-aware mode
   * @param {Object} routeData - Route data from DirectionsService
   * @returns {Promise<boolean>} - Success status
   */
  async enableRouteAwareMode(routeData) {
    try {
      console.log('🛣️ Enabling route-aware speed detection...');
      
      const result = await RouteAwareSpeedService.processRoute(routeData);
      
      if (result.success) {
        this.isUsingRouteAware = true;
        this.fallbackMode = false;
        
        console.log(`✅ Route-aware mode enabled: ${result.totalSegments} segments processed`);
        return true;
      }

      throw new Error(result.error);

    } catch (error) {
      console.error('❌ Failed to enable route-aware mode:', error);
      this.fallbackMode = true;
      return false;
    }
  }

  /**
   * Disable route-aware mode
   */
  disableRouteAwareMode() {
    console.log('🔄 Disabling route-aware mode');
    
    this.isUsingRouteAware = false;
    this.fallbackMode = false;
    
    RouteAwareSpeedService.clearRoute();
  }

  /**
   * Get current speed attribution details
   * @returns {Object|null} - Speed attribution details
   */
  getSpeedDetails() {
    if (this.isUsingRouteAware) {
      return {
        mode: 'route_aware',
        status: RouteAwareSpeedService.getSystemStatus(),
        lastResult: this.lastSpeedResult
      };
    }

    return {
      mode: 'fallback',
      fallbackMode: this.fallbackMode
    };
  }

  /**
   * Check if route-aware mode is available
   * @returns {boolean} - Route-aware availability
   */
  isRouteAwareModeAvailable() {
    return this.isUsingRouteAware && !this.fallbackMode;
  }

  /**
   * Get system status
   * @returns {Object} - System status
   */
  getStatus() {
    return {
      isUsingRouteAware: this.isUsingRouteAware,
      fallbackMode: this.fallbackMode,
      hasLastResult: this.lastSpeedResult !== null,
      routeAwareStatus: this.isUsingRouteAware 
        ? RouteAwareSpeedService.getSystemStatus()
        : null
    };
  }

  /**
   * Reset service state
   */
  reset() {
    this.isUsingRouteAware = false;
    this.fallbackMode = false;
    this.lastSpeedResult = null;
    
    RouteAwareSpeedService.clearRoute();
    
    console.log('🔄 SpeedService reset');
  }
}

export default new SpeedService();