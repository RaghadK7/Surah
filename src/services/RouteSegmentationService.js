/**
 * Route Segmentation Service
 * Converts Google Directions API routes into granular segments with fixed speed limits
 * 
 * Core Principle: "Speed limits are route-bound. Zones are contextual overlays."
 */

import { decodePolyline, calculateDistance } from '../utils/polylineDecoder';
import { SAUDI_SPEED_RULES, SPECIAL_ZONES } from '../config/constants';
import RoadsAPIService from './RoadsAPIService';

class RouteSegmentationService {
  constructor() {
    this.currentRouteSegments = [];
    this.segmentLength = 25; // 25 meter segments (optimal for Saudi roads)
    this.cache = new Map();
  }

  /**
   * Primary method: Convert route polyline into speed-attributed segments
   * @param {string} encodedPolyline - Google Directions API polyline
   * @param {Object} routeDetails - Additional route information
   * @returns {Array} - Array of route segments with speed limits
   */
  async segmentizeRoute(encodedPolyline, routeDetails = {}) {
    console.log('🛣️ Starting route segmentation...');
    
    try {
      // Step 1: Decode polyline into coordinates
      const routeCoordinates = decodePolyline(encodedPolyline);
      if (routeCoordinates.length === 0) {
        throw new Error('Invalid or empty polyline');
      }

      console.log(`📍 Decoded ${routeCoordinates.length} route points`);

      // Step 2: Create granular segments (20-30m each)
      const granularSegments = this.createGranularSegments(routeCoordinates);
      console.log(`📏 Created ${granularSegments.length} granular segments`);

      // Step 3: Attribute speed limits to each segment
      const attributedSegments = await this.attributeSpeedLimits(granularSegments, routeDetails);
      console.log(`⚡ Attributed speeds to ${attributedSegments.length} segments`);

      // Step 4: Optimize and cache
      this.currentRouteSegments = attributedSegments;
      this.cacheSegments(encodedPolyline, attributedSegments);

      return {
        success: true,
        segments: attributedSegments,
        totalSegments: attributedSegments.length,
        summary: this.generateRouteSummary(attributedSegments)
      };

    } catch (error) {
      console.error('❌ Route segmentation failed:', error);
      return {
        success: false,
        error: error.message,
        segments: []
      };
    }
  }

  /**
   * Create granular segments of ~25 meters each
   * @param {Array} coordinates - Route coordinates
   * @returns {Array} - Granular segments
   */
  createGranularSegments(coordinates) {
    const segments = [];
    let currentSegmentDistance = 0;
    let segmentStartIndex = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const distance = calculateDistance(coordinates[i - 1], coordinates[i]);
      currentSegmentDistance += distance;

      // Create segment when we reach target length or at route end
      if (currentSegmentDistance >= this.segmentLength || i === coordinates.length - 1) {
        const segmentCoordinates = coordinates.slice(segmentStartIndex, i + 1);
        
        segments.push({
          id: segments.length,
          startIndex: segmentStartIndex,
          endIndex: i,
          coordinates: segmentCoordinates,
          startPoint: coordinates[segmentStartIndex],
          endPoint: coordinates[i],
          midPoint: this.calculateMidPoint(segmentCoordinates),
          distance: currentSegmentDistance,
          bearing: this.calculateBearing(coordinates[segmentStartIndex], coordinates[i]),
          speedLimit: null, // To be filled later
          roadType: null,
          source: null
        });

        segmentStartIndex = i;
        currentSegmentDistance = 0;
      }
    }

    return segments;
  }

  /**
   * Attribute speed limits to segments using OpenStreetMap + Saudi defaults
   * @param {Array} segments - Route segments
   * @param {Object} routeDetails - Route metadata
   * @returns {Array} - Segments with speed attribution
   */
  async attributeSpeedLimits(segments, routeDetails = {}) {
    const batchSize = 10; // Process in batches to avoid rate limits
    const attributedSegments = [];

    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (segment) => {
        try {
          // Step 1: Try OpenStreetMap for maxspeed
          const osmSpeed = await this.fetchOSMSpeedLimit(segment.midPoint);
          
          if (osmSpeed !== null) {
            return {
              ...segment,
              speedLimit: osmSpeed,
              source: 'osm',
              confidence: 'high'
            };
          }

          // Step 2: Fallback to Saudi road type classification
          const roadClassification = await this.classifyRoadSegment(segment, routeDetails);
          const saudiSpeed = SAUDI_SPEED_RULES[roadClassification.type] || 80;

          return {
            ...segment,
            speedLimit: saudiSpeed,
            roadType: roadClassification.type,
            source: 'saudi_rules',
            confidence: roadClassification.confidence,
            metadata: roadClassification.metadata
          };

        } catch (error) {
          console.warn(`⚠️ Segment ${segment.id} speed attribution failed:`, error);
          return {
            ...segment,
            speedLimit: 80, // Safe fallback
            source: 'fallback',
            confidence: 'low'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      attributedSegments.push(...batchResults);

      // Rate limiting delay
      if (i + batchSize < segments.length) {
        await this.delay(200);
      }
    }

    return attributedSegments;
  }

  /**
   * Fetch speed limit from OpenStreetMap
   * @param {Object} coordinate - Lat/lng point
   * @returns {number|null} - Speed limit or null
   */
  async fetchOSMSpeedLimit(coordinate) {
    try {
      const cacheKey = `osm_${coordinate.latitude.toFixed(5)}_${coordinate.longitude.toFixed(5)}`;
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Use existing RoadsAPIService OSM integration
      const result = await RoadsAPIService.fetchFromOSM(coordinate.latitude, coordinate.longitude);
      
      if (result !== null) {
        this.cache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.warn('OSM fetch failed:', error);
      return null;
    }
  }

  /**
   * Classify road segment based on characteristics
   * @param {Object} segment - Route segment
   * @param {Object} routeDetails - Route metadata
   * @returns {Object} - Classification result
   */
  async classifyRoadSegment(segment, routeDetails = {}) {
    // Classify based on segment characteristics
    const distance = segment.distance;
    const bearing = segment.bearing;
    
    // Road type inference logic
    if (routeDetails.highway) {
      return { type: 'motorway', confidence: 'high', metadata: { source: 'route_hint' } };
    }

    if (distance > 50 && Math.abs(bearing) < 30) {
      // Long, straight segments typically highways
      return { type: 'trunk', confidence: 'medium', metadata: { inferred: 'straight_long' } };
    }

    if (distance < 15) {
      // Short segments typically residential
      return { type: 'residential', confidence: 'medium', metadata: { inferred: 'short_segment' } };
    }

    // Default classification
    return { type: 'secondary', confidence: 'low', metadata: { inferred: 'default' } };
  }

  /**
   * Calculate midpoint of segment coordinates
   */
  calculateMidPoint(coordinates) {
    const midIndex = Math.floor(coordinates.length / 2);
    return coordinates[midIndex];
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(point1, point2) {
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  /**
   * Generate route summary statistics
   */
  generateRouteSummary(segments) {
    const speedDistribution = {};
    let totalDistance = 0;

    segments.forEach(segment => {
      const speed = segment.speedLimit;
      speedDistribution[speed] = (speedDistribution[speed] || 0) + segment.distance;
      totalDistance += segment.distance;
    });

    return {
      totalDistance: Math.round(totalDistance),
      totalSegments: segments.length,
      averageSegmentLength: Math.round(totalDistance / segments.length),
      speedDistribution,
      sourceMix: this.calculateSourceMix(segments)
    };
  }

  /**
   * Calculate source mix statistics
   */
  calculateSourceMix(segments) {
    const sources = {};
    segments.forEach(segment => {
      sources[segment.source] = (sources[segment.source] || 0) + 1;
    });
    return sources;
  }

  /**
   * Cache segments for performance
   */
  cacheSegments(polylineKey, segments) {
    const cacheKey = `route_${this.hashPolyline(polylineKey)}`;
    this.cache.set(cacheKey, {
      segments,
      timestamp: Date.now()
    });
  }

  /**
   * Get current route segments
   * @returns {Array} - Current route segments
   */
  getCurrentSegments() {
    return this.currentRouteSegments;
  }

  /**
   * Clear current route and cache
   */
  clearRoute() {
    this.currentRouteSegments = [];
    console.log('🗑️ Route segments cleared');
  }

  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  hashPolyline(polyline) {
    return polyline.substring(0, 50); // Simple hash for caching
  }
}

export default new RouteSegmentationService();