/**
 * Route-Aware Speed Service
 * Main orchestrator for precise speed attribution using route segmentation
 * 
 * Architecture:
 * 1. RouteSegmentationService - Converts routes into granular speed segments
 * 2. MapMatchingEngine - Matches GPS to route segments (direction-aware)
 * 3. ZoneOverlaySystem - Manages contextual zones as overlays, not overrides
 * 4. This service - Orchestrates and provides unified API
 * 
 * Core Principle: "Speed limits are route-bound. Zones are contextual overlays."
 */

import RouteSegmentationService from './RouteSegmentationService';
import MapMatchingEngine from './MapMatchingEngine';
import ZoneOverlaySystem from './ZoneOverlaySystem';
import DirectionsService from './DirectionsService';
import { calculateDistance } from '../utils/polylineDecoder';

const SYSTEM_STATUS = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  TRACKING: 'tracking', 
  NO_ROUTE: 'no_route',
  ERROR: 'error'
};

class RouteAwareSpeedService {
  constructor() {
    this.status = SYSTEM_STATUS.INITIALIZING;
    this.currentRoute = null;
    this.routeSegments = [];
    this.currentMatch = null;
    this.lastGPSUpdate = 0;
    this.performanceStats = {
      routeProcessingTime: 0,
      matchingTime: 0,
      totalUpdates: 0,
      successfulMatches: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize the speed attribution system
   */
  async initialize() {
    console.log('🚀 Initializing Route-Aware Speed Service...');
    
    try {
      // Reset sub-services
      RouteSegmentationService.clearRoute();
      MapMatchingEngine.resetMatching();
      ZoneOverlaySystem.clearActiveZones();
      
      this.status = SYSTEM_STATUS.READY;
      console.log('✅ Route-Aware Speed Service ready');
      
    } catch (error) {
      console.error('❌ Failed to initialize speed service:', error);
      this.status = SYSTEM_STATUS.ERROR;
      throw error;
    }
  }

  /**
   * Primary method: Process new route and prepare for tracking
   * @param {Object} routeData - Route data from DirectionsService
   * @param {Object} options - Processing options
   * @returns {Object} - Route processing result
   */
  async processRoute(routeData, options = {}) {
    console.log('🛣️ Processing route for speed attribution...');
    
    const startTime = Date.now();
    
    try {
      if (!routeData || !routeData.polyline) {
        throw new Error('Invalid route data');
      }

      this.status = SYSTEM_STATUS.INITIALIZING;

      // Step 1: Segment the route
      const segmentationResult = await RouteSegmentationService.segmentizeRoute(
        routeData.polyline,
        {
          distance: routeData.distance,
          duration: routeData.duration,
          summary: routeData.summary,
          steps: routeData.steps
        }
      );

      if (!segmentationResult.success) {
        throw new Error(`Route segmentation failed: ${segmentationResult.error}`);
      }

      // Step 2: Store route data
      this.currentRoute = {
        ...routeData,
        processedAt: Date.now(),
        totalSegments: segmentationResult.totalSegments,
        summary: segmentationResult.summary
      };

      this.routeSegments = segmentationResult.segments;

      // Step 3: Reset matching state
      MapMatchingEngine.resetMatching();
      ZoneOverlaySystem.clearActiveZones();

      this.status = SYSTEM_STATUS.READY;
      this.performanceStats.routeProcessingTime = Date.now() - startTime;

      console.log(`✅ Route processed: ${this.routeSegments.length} segments, ${this.performanceStats.routeProcessingTime}ms`);

      return {
        success: true,
        totalSegments: this.routeSegments.length,
        routeSummary: segmentationResult.summary,
        processingTime: this.performanceStats.routeProcessingTime
      };

    } catch (error) {
      console.error('❌ Route processing failed:', error);
      this.status = SYSTEM_STATUS.ERROR;
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Main method: Get speed limit for current GPS position
   * @param {Object} gpsPosition - Current GPS position {lat, lng, heading, speed, accuracy}
   * @param {Array} nearbyPOIs - Nearby points of interest for zone detection
   * @param {Object} options - Processing options
   * @returns {Object} - Complete speed attribution result
   */
  async getCurrentSpeedLimit(gpsPosition, nearbyPOIs = [], options = {}) {
    const startTime = Date.now();
    this.performanceStats.totalUpdates++;

    try {
      // Validate inputs
      if (!this.validateGPSPosition(gpsPosition)) {
        return this.createErrorResult('Invalid GPS position');
      }

      if (this.status !== SYSTEM_STATUS.READY && this.status !== SYSTEM_STATUS.TRACKING) {
        return this.createErrorResult(`System not ready: ${this.status}`);
      }

      if (this.routeSegments.length === 0) {
        return this.createErrorResult('No route available');
      }

      this.status = SYSTEM_STATUS.TRACKING;

      // Step 1: Map-match GPS position to route segment
      const matchResult = MapMatchingEngine.matchToRoute(
        gpsPosition, 
        this.routeSegments, 
        options.matching || {}
      );

      if (!matchResult.success) {
        console.warn('⚠️ Map matching failed:', matchResult.reason);
        return this.createNoMatchResult(gpsPosition, matchResult.reason);
      }

      // Step 2: Process zones as overlays
      const zoneResult = await ZoneOverlaySystem.processZones(
        gpsPosition,
        {
          currentSegment: matchResult.segment,
          destination: this.currentRoute?.destination,
          route: this.currentRoute
        },
        nearbyPOIs
      );

      // Step 3: Determine final speed limit
      const finalSpeedLimit = this.determineFinalSpeedLimit(
        matchResult.segment,
        zoneResult.speedOverride,
        options.rules || {}
      );

      // Step 4: Create comprehensive result
      this.currentMatch = matchResult;
      this.performanceStats.successfulMatches++;
      this.performanceStats.matchingTime = Date.now() - startTime;

      const result = {
        success: true,
        speedLimit: finalSpeedLimit.speed,
        speedSource: finalSpeedLimit.source,
        confidence: matchResult.confidence,
        
        // Route information
        routeSegment: {
          id: matchResult.segment.id,
          roadType: matchResult.segment.roadType,
          distance: Math.round(matchResult.segment.distance),
          bearing: Math.round(matchResult.segment.bearing)
        },
        
        // Map matching details
        matching: {
          distanceToRoute: matchResult.distanceToRoute,
          directionMatch: matchResult.directionMatch,
          segmentId: matchResult.segment.id
        },
        
        // Zone information
        zones: {
          active: zoneResult.zones || [],
          warnings: zoneResult.warnings || [],
          visualIndicators: zoneResult.visualIndicators || [],
          speedOverride: zoneResult.speedOverride
        },
        
        // Performance metrics
        performance: {
          processingTime: Date.now() - startTime,
          totalSegments: this.routeSegments.length,
          matchingStats: MapMatchingEngine.getMatchingStats()
        },
        
        timestamp: Date.now()
      };

      console.log(`🎯 Speed limit: ${finalSpeedLimit.speed} km/h (${finalSpeedLimit.source}) - Segment ${matchResult.segment.id}`);
      
      return result;

    } catch (error) {
      console.error('❌ Speed limit retrieval failed:', error);
      return this.createErrorResult(error.message);
    }
  }

  /**
   * Determine final speed limit considering route and zone overrides
   * @param {Object} routeSegment - Matched route segment
   * @param {Object} zoneOverride - Zone speed override (if any)
   * @param {Object} rules - Speed determination rules
   * @returns {Object} - Final speed decision
   */
  determineFinalSpeedLimit(routeSegment, zoneOverride, rules = {}) {
    // Rule 1: Zone override takes precedence (when applicable)
    if (zoneOverride && zoneOverride.speed && !rules.ignoreZones) {
      console.log(`🚧 Zone override applied: ${zoneOverride.speed} km/h (${zoneOverride.reason})`);
      return {
        speed: zoneOverride.speed,
        source: `zone_${zoneOverride.reason}`,
        override: true,
        originalSpeed: routeSegment.speedLimit
      };
    }

    // Rule 2: Route segment speed (primary source)
    return {
      speed: routeSegment.speedLimit,
      source: routeSegment.source,
      override: false,
      roadType: routeSegment.roadType,
      confidence: routeSegment.confidence
    };
  }

  /**
   * Get current system status and statistics
   * @returns {Object} - System status
   */
  getSystemStatus() {
    return {
      status: this.status,
      hasRoute: this.currentRoute !== null,
      totalSegments: this.routeSegments.length,
      currentSegment: this.currentMatch?.segment?.id || null,
      performanceStats: this.performanceStats,
      lastUpdate: this.lastGPSUpdate,
      services: {
        segmentation: RouteSegmentationService.getCurrentSegments().length > 0,
        mapMatching: MapMatchingEngine.getMatchingStats(),
        zoneOverlay: ZoneOverlaySystem.getActiveZones().length
      }
    };
  }

  /**
   * Get route visualization data
   * @returns {Object} - Route visualization data
   */
  getRouteVisualization() {
    if (!this.routeSegments || this.routeSegments.length === 0) {
      return null;
    }

    return {
      segments: this.routeSegments.map(segment => ({
        id: segment.id,
        coordinates: [segment.startPoint, segment.endPoint],
        speedLimit: segment.speedLimit,
        color: this.getSegmentColor(segment.speedLimit),
        roadType: segment.roadType,
        source: segment.source
      })),
      activeZones: ZoneOverlaySystem.getActiveZones(),
      currentMatch: this.currentMatch ? {
        segmentId: this.currentMatch.segment.id,
        confidence: this.currentMatch.confidence
      } : null
    };
  }

  /**
   * Update route in real-time (for dynamic changes)
   * @param {string} newPolyline - Updated route polyline
   * @returns {Object} - Update result
   */
  async updateRoute(newPolyline) {
    console.log('🔄 Updating route...');
    
    try {
      const routeData = {
        polyline: newPolyline,
        updated: true
      };
      
      return await this.processRoute(routeData);
      
    } catch (error) {
      console.error('❌ Route update failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear current route and reset system
   */
  clearRoute() {
    console.log('🗑️ Clearing route...');
    
    this.currentRoute = null;
    this.routeSegments = [];
    this.currentMatch = null;
    this.status = SYSTEM_STATUS.NO_ROUTE;
    
    RouteSegmentationService.clearRoute();
    MapMatchingEngine.resetMatching();
    ZoneOverlaySystem.clearActiveZones();
    
    console.log('✅ Route cleared');
  }

  /**
   * Utility methods
   */

  validateGPSPosition(position) {
    return position &&
           typeof position.latitude === 'number' &&
           typeof position.longitude === 'number' &&
           position.latitude >= -90 && position.latitude <= 90 &&
           position.longitude >= -180 && position.longitude <= 180;
  }

  createErrorResult(error) {
    return {
      success: false,
      error,
      speedLimit: null,
      timestamp: Date.now()
    };
  }

  createNoMatchResult(gpsPosition, reason) {
    return {
      success: false,
      reason: 'no_route_match',
      details: reason,
      speedLimit: 80, // Safe fallback
      speedSource: 'fallback',
      confidence: 0,
      gpsPosition,
      timestamp: Date.now()
    };
  }

  getSegmentColor(speedLimit) {
    if (speedLimit >= 100) return '#4CAF50';  // Green - Highway
    if (speedLimit >= 80) return '#2196F3';   // Blue - Major road
    if (speedLimit >= 60) return '#FF9800';   // Orange - Secondary
    if (speedLimit >= 40) return '#FF5722';   // Red-orange - Residential
    return '#9E9E9E';                         // Gray - Low speed
  }

  /**
   * Advanced features
   */

  /**
   * Predict speed limit ahead based on route
   * @param {number} lookAheadDistance - Distance to look ahead (meters)
   * @returns {Array} - Upcoming speed limits
   */
  getUpcomingSpeedLimits(lookAheadDistance = 500) {
    if (!this.currentMatch || this.routeSegments.length === 0) {
      return [];
    }

    const currentSegmentId = this.currentMatch.segment.id;
    const upcomingSegments = [];
    let accumulatedDistance = 0;

    for (let i = currentSegmentId + 1; i < this.routeSegments.length; i++) {
      const segment = this.routeSegments[i];
      accumulatedDistance += segment.distance;
      
      if (accumulatedDistance > lookAheadDistance) break;
      
      upcomingSegments.push({
        segmentId: segment.id,
        speedLimit: segment.speedLimit,
        distance: accumulatedDistance,
        roadType: segment.roadType
      });
    }

    return upcomingSegments;
  }

  /**
   * Get performance metrics
   * @returns {Object} - Detailed performance metrics
   */
  getPerformanceMetrics() {
    const successRate = this.performanceStats.totalUpdates > 0 
      ? (this.performanceStats.successfulMatches / this.performanceStats.totalUpdates * 100).toFixed(2)
      : 0;

    return {
      ...this.performanceStats,
      successRate: `${successRate}%`,
      averageMatchingTime: this.performanceStats.totalUpdates > 0 
        ? Math.round(this.performanceStats.matchingTime / this.performanceStats.totalUpdates)
        : 0
    };
  }
}

export default new RouteAwareSpeedService();