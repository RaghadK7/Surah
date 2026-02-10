/**
 * Precision Route Speed Engine
 * Production-ready navigation speed engine with maximum accuracy
 * 
 * Flow: GPS → Route Segments → Road Matching → Speed Priority → Current Segment Only
 * 
 * Core Principle: Speed limits determined per road segment, NOT by proximity
 */

import { decodePolyline, calculateDistance } from '../utils/polylineDecoder';
import RoadsAPIService from './RoadsAPIService';
import { SAUDI_SPEED_RULES } from '../config/constants';

// Priority order for speed determination
const SPEED_PRIORITY = {
  EXPLICIT_MAXSPEED: 1,    // Highest: maxspeed from road data
  ROAD_TYPE_MAPPING: 2,    // Fallback: highway type mapping
  ZONE_CONDITIONAL: 3,     // Conditional: zone logic (strict)
  DESTINATION_LOGIC: 4,    // Separate: destination proximity
  SAFETY_FALLBACK: 5      // Lowest: safe default
};

// Road type speed mapping (Saudi standards)
const ROAD_TYPE_SPEEDS = {
  motorway: 120,
  trunk: 100,
  primary: 80,
  secondary: 60,
  tertiary: 60,
  residential: 40,
  living_street: 30,
  service: 30,
  unclassified: 60
};

// Zone-eligible road types (strict)
const ZONE_ELIGIBLE_ROADS = ['residential', 'living_street'];

class PrecisionRouteSpeedEngine {
  constructor() {
    this.activeRoute = null;
    this.routeSegments = [];
    this.currentSegmentIndex = -1;
    this.segmentCache = new Map();
    this.roadDataCache = new Map();
    this.isProcessing = false;
    
    // Performance metrics
    this.metrics = {
      totalUpdates: 0,
      cacheHits: 0,
      apiCalls: 0,
      processingTimes: []
    };
  }

  /**
   * STEP 1-3: Process route and create road segments
   * @param {Object} routeData - Route from Google Directions API
   * @returns {Promise<Object>} - Processing result
   */
  async processActiveRoute(routeData) {
    console.log('🛣️ Processing active route for precision speed engine...');
    
    const startTime = Date.now();
    
    try {
      if (!routeData?.polyline) {
        throw new Error('Invalid route data - missing polyline');
      }

      // Extract polyline and decode to ordered points
      const routePoints = decodePolyline(routeData.polyline);
      if (routePoints.length < 2) {
        throw new Error('Insufficient route points');
      }

      console.log(`📍 Decoded ${routePoints.length} route points`);

      // Convert consecutive points into road segments
      const segments = this.createRoadSegments(routePoints);
      console.log(`🔗 Created ${segments.length} road segments`);

      // Store route data
      this.activeRoute = {
        ...routeData,
        totalPoints: routePoints.length,
        totalSegments: segments.length,
        processedAt: Date.now()
      };

      this.routeSegments = segments;
      this.currentSegmentIndex = -1;

      const processingTime = Date.now() - startTime;
      console.log(`✅ Route processed in ${processingTime}ms`);

      return {
        success: true,
        totalSegments: segments.length,
        processingTime
      };

    } catch (error) {
      console.error('❌ Route processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * STEP 3: Convert consecutive points into road segments
   * Each segment represents an actual road between two points
   */
  createRoadSegments(routePoints) {
    const segments = [];

    for (let i = 0; i < routePoints.length - 1; i++) {
      const startPoint = routePoints[i];
      const endPoint = routePoints[i + 1];
      
      const segment = {
        id: i,
        startPoint,
        endPoint,
        midPoint: this.calculateMidpoint(startPoint, endPoint),
        distance: calculateDistance(startPoint, endPoint),
        bearing: this.calculateBearing(startPoint, endPoint),
        
        // Road data (to be filled)
        roadType: null,
        roadName: null,
        maxspeed: null,
        speedLimit: null,
        speedSource: null,
        
        // Processing state
        processed: false,
        lastUpdated: null
      };

      segments.push(segment);
    }

    return segments;
  }

  /**
   * MAIN METHOD: Get speed limit for current GPS position
   * @param {Object} gpsLocation - Current GPS location
   * @param {Object} destination - Final destination (optional)
   * @returns {Promise<Object>} - Speed determination result
   */
  async getCurrentSpeedLimit(gpsLocation, destination = null) {
    const startTime = Date.now();
    this.metrics.totalUpdates++;

    try {
      if (!this.activeRoute || this.routeSegments.length === 0) {
        return this.createErrorResult('No active route available');
      }

      if (!this.validateGPSLocation(gpsLocation)) {
        return this.createErrorResult('Invalid GPS location');
      }

      // STEP 2: Find current road segment
      const currentSegment = await this.findCurrentSegment(gpsLocation);
      if (!currentSegment) {
        return this.createErrorResult('Cannot match GPS to route segment');
      }

      this.currentSegmentIndex = currentSegment.id;

      // STEP 4-5: Match segment to real road and determine speed
      const speedResult = await this.determineSegmentSpeed(currentSegment, gpsLocation, destination);

      const processingTime = Date.now() - startTime;
      this.metrics.processingTimes.push(processingTime);

      console.log(`🎯 Current segment ${currentSegment.id}: ${speedResult.speedLimit} km/h (${speedResult.source})`);

      return {
        success: true,
        currentSegment: currentSegment.id,
        speedLimit: speedResult.speedLimit,
        speedSource: speedResult.source,
        roadType: speedResult.roadType,
        roadName: speedResult.roadName,
        confidence: speedResult.confidence,
        processingTime,
        
        // Segment details
        segmentDistance: Math.round(currentSegment.distance),
        segmentBearing: Math.round(currentSegment.bearing),
        
        // Destination info
        destinationDistance: destination ? 
          calculateDistance(gpsLocation, destination) : null,
        
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ Speed determination failed:', error);
      return this.createErrorResult(error.message);
    }
  }

  /**
   * STEP 4-5: Determine speed limit for segment using priority order
   */
  async determineSegmentSpeed(segment, gpsLocation, destination) {
    try {
      // Check if already processed and cached
      const cacheKey = `segment_${segment.id}`;
      if (this.segmentCache.has(cacheKey)) {
        this.metrics.cacheHits++;
        const cached = this.segmentCache.get(cacheKey);
        
        // Apply destination logic if needed
        return this.applyDestinationLogic(cached, gpsLocation, destination);
      }

      // STEP 4: Match segment to real road
      const roadData = await this.matchSegmentToRealRoad(segment);
      
      // STEP 5: Apply speed priority logic
      const speedResult = this.applySpeedPriorityLogic(roadData, segment, gpsLocation);
      
      // Cache the result (without destination logic)
      this.segmentCache.set(cacheKey, speedResult);
      
      // Apply destination logic if needed
      return this.applyDestinationLogic(speedResult, gpsLocation, destination);

    } catch (error) {
      console.warn(`⚠️ Segment speed determination failed: ${error.message}`);
      return this.createFallbackSpeed(segment);
    }
  }

  /**
   * STEP 4: Match segment to real road using road snapping
   */
  async matchSegmentToRealRoad(segment) {
    try {
      const roadCacheKey = `road_${segment.midPoint.latitude.toFixed(5)}_${segment.midPoint.longitude.toFixed(5)}`;
      
      // Check road data cache
      if (this.roadDataCache.has(roadCacheKey)) {
        this.metrics.cacheHits++;
        return this.roadDataCache.get(roadCacheKey);
      }

      this.metrics.apiCalls++;

      // Try Google Roads API for road snapping
      const roadData = await this.snapToRealRoad(segment);
      
      // Cache the road data
      this.roadDataCache.set(roadCacheKey, roadData);
      
      return roadData;

    } catch (error) {
      console.warn('Road matching failed, using fallback:', error);
      return {
        roadType: 'unclassified',
        roadName: 'Unknown Road',
        maxspeed: null,
        confidence: 'low'
      };
    }
  }

  /**
   * Snap segment to real road using Google Roads API or OSM
   */
  async snapToRealRoad(segment) {
    try {
      // Use existing RoadsAPIService integration
      const result = await RoadsAPIService.getDetailedRoadInfo(
        segment.midPoint.latitude,
        segment.midPoint.longitude
      );

      if (result) {
        return {
          roadType: result.highway || 'unclassified',
          roadName: result.name || 'Unnamed Road',
          maxspeed: result.maxspeed,
          confidence: 'high'
        };
      }

      // Fallback to basic classification
      return this.classifyRoadByContext(segment);

    } catch (error) {
      console.warn('Road snapping failed:', error);
      return this.classifyRoadByContext(segment);
    }
  }

  /**
   * STEP 5: Apply speed priority logic (A → B → C → D → Fallback)
   */
  applySpeedPriorityLogic(roadData, segment, gpsLocation) {
    // A. EXPLICIT MAXSPEED (Highest Priority)
    if (roadData.maxspeed && roadData.maxspeed > 0) {
      console.log(`🎯 Using explicit maxspeed: ${roadData.maxspeed} km/h`);
      return {
        speedLimit: roadData.maxspeed,
        source: 'explicit_maxspeed',
        priority: SPEED_PRIORITY.EXPLICIT_MAXSPEED,
        roadType: roadData.roadType,
        roadName: roadData.roadName,
        confidence: 'high'
      };
    }

    // B. ROAD TYPE MAPPING (Smart Fallback)
    const roadTypeSpeed = ROAD_TYPE_SPEEDS[roadData.roadType];
    if (roadTypeSpeed) {
      console.log(`🛣️ Using road type speed: ${roadTypeSpeed} km/h (${roadData.roadType})`);
      return {
        speedLimit: roadTypeSpeed,
        source: 'road_type_mapping',
        priority: SPEED_PRIORITY.ROAD_TYPE_MAPPING,
        roadType: roadData.roadType,
        roadName: roadData.roadName,
        confidence: 'medium'
      };
    }

    // C. ZONE LOGIC (Conditional - very strict)
    const zoneSpeed = this.checkZoneLogic(roadData, segment, gpsLocation);
    if (zoneSpeed) {
      return zoneSpeed;
    }

    // Fallback
    return {
      speedLimit: 60,
      source: 'safety_fallback',
      priority: SPEED_PRIORITY.SAFETY_FALLBACK,
      roadType: roadData.roadType || 'unknown',
      roadName: roadData.roadName || 'Unknown Road',
      confidence: 'low'
    };
  }

  /**
   * C. ZONE LOGIC - Apply ONLY if segment is inside zone polygon AND road is residential
   */
  checkZoneLogic(roadData, segment, gpsLocation) {
    // Only apply to eligible road types
    if (!ZONE_ELIGIBLE_ROADS.includes(roadData.roadType)) {
      return null; // ❌ Not eligible for zone logic
    }

    // TODO: Implement polygon-based zone checking
    // This would check if segment.midPoint is inside school/hospital polygon
    // For now, return null (no zone logic applied)
    
    return null;
  }

  /**
   * D. DESTINATION LOGIC - Apply based on destination type within proximity
   */
  applyDestinationLogic(speedResult, gpsLocation, destination) {
    if (!destination) {
      return speedResult; // No destination
    }

    const distanceToDestination = calculateDistance(gpsLocation, destination);
    
    // Check if we're within destination zone range (50-150m depending on type)
    const destinationZoneInfo = this.analyzeDestinationType(destination, distanceToDestination);
    
    if (destinationZoneInfo.shouldApplyZoneSpeed) {
      console.log(`🏁 Destination ${destinationZoneInfo.type}: ${destinationZoneInfo.speed} km/h (${Math.round(distanceToDestination)}m away)`);
      
      return {
        ...speedResult,
        speedLimit: destinationZoneInfo.speed,
        source: `destination_${destinationZoneInfo.type}`,
        priority: SPEED_PRIORITY.DESTINATION_LOGIC,
        originalSpeed: speedResult.speedLimit,
        destinationOverride: true,
        destinationType: destinationZoneInfo.type,
        distanceToDestination: Math.round(distanceToDestination)
      };
    }

    return speedResult; // Regular speed - not close enough or no special destination
  }

  /**
   * Analyze destination type and determine appropriate zone speed
   * @param {Object} destination - Destination with location and type info
   * @param {number} distance - Current distance to destination
   * @returns {Object} - Zone speed analysis
   */
  analyzeDestinationType(destination, distance) {
    // Define destination zone rules
    const DESTINATION_ZONES = {
      // Educational institutions
      school: {
        speed: 30,
        radius: 100,
        keywords: ['school', 'مدرسة', 'مدارس', 'تعليم']
      },
      university: {
        speed: 30,
        radius: 120,
        keywords: ['university', 'جامعة', 'جامعات', 'college', 'كلية']
      },
      
      // Medical facilities  
      hospital: {
        speed: 40,
        radius: 100,
        keywords: ['hospital', 'مستشفى', 'مستشفيات', 'clinic', 'عيادة', 'medical']
      },
      
      // Commercial areas
      mall: {
        speed: 50,
        radius: 100,
        keywords: ['mall', 'مول', 'مولات', 'shopping', 'تسوق', 'center', 'مركز']
      },
      shopping_center: {
        speed: 50,
        radius: 100,
        keywords: ['shopping', 'تسوق', 'market', 'سوق']
      },
      
      // Religious places
      mosque: {
        speed: 40,
        radius: 80,
        keywords: ['mosque', 'مسجد', 'مساجد', 'جامع']
      },
      
      // Residential
      residential: {
        speed: 40,
        radius: 80,
        keywords: ['home', 'house', 'منزل', 'بيت', 'residence', 'سكن']
      },
      
      // Government/public
      government: {
        speed: 50,
        radius: 100,  
        keywords: ['government', 'حكومي', 'ministry', 'وزارة', 'municipal', 'بلدية']
      }
    };

    // Determine destination type
    const destinationType = this.classifyDestination(destination, DESTINATION_ZONES);
    
    if (!destinationType) {
      return {
        shouldApplyZoneSpeed: false,
        type: 'unknown',
        speed: null,
        reason: 'Unknown destination type'
      };
    }

    const zoneRule = DESTINATION_ZONES[destinationType];
    
    // Check if within zone radius
    if (distance <= zoneRule.radius) {
      return {
        shouldApplyZoneSpeed: true,
        type: destinationType,
        speed: zoneRule.speed,
        radius: zoneRule.radius,
        distance: Math.round(distance)
      };
    }

    return {
      shouldApplyZoneSpeed: false,
      type: destinationType,
      speed: zoneRule.speed,
      reason: `Outside radius (${Math.round(distance)}m > ${zoneRule.radius}m)`
    };
  }

  /**
   * Classify destination based on name and types
   * @param {Object} destination - Destination object
   * @param {Object} zones - Zone definitions
   * @returns {string|null} - Destination type
   */
  classifyDestination(destination, zones) {
    if (!destination) return null;

    // Check destination name
    const destName = (destination.name || destination.address || '').toLowerCase();
    
    // Check destination types (from Places API)
    const destTypes = destination.types || [];
    
    // Check against each zone type
    for (const [zoneType, zoneData] of Object.entries(zones)) {
      // Check name keywords
      const nameMatch = zoneData.keywords.some(keyword => 
        destName.includes(keyword.toLowerCase())
      );
      
      // Check Google Places types
      const typeMatch = destTypes.some(type => {
        switch (zoneType) {
          case 'school':
            return ['school', 'primary_school', 'secondary_school'].includes(type);
          case 'university':
            return ['university'].includes(type);
          case 'hospital':
            return ['hospital', 'doctor', 'health', 'clinic'].includes(type);
          case 'mall':
            return ['shopping_mall', 'department_store'].includes(type);
          case 'shopping_center':
            return ['shopping_mall', 'store'].includes(type);
          case 'mosque':
            return ['mosque', 'place_of_worship'].includes(type);
          case 'residential':
            return ['premise', 'street_address', 'subpremise'].includes(type);
          case 'government':
            return ['local_government_office', 'city_hall'].includes(type);
          default:
            return false;
        }
      });

      if (nameMatch || typeMatch) {
        console.log(`🎯 Destination classified as: ${zoneType} (name: ${nameMatch}, type: ${typeMatch})`);
        return zoneType;
      }
    }

    return null; // Unknown destination type
  }

  /**
   * STEP 2: Find current road segment from GPS location
   */
  async findCurrentSegment(gpsLocation) {
    let bestMatch = null;
    let minDistance = Infinity;

    for (const segment of this.routeSegments) {
      const distance = this.distanceToSegment(gpsLocation, segment);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = segment;
      }
    }

    // Accept match only if within reasonable distance
    if (bestMatch && minDistance <= 50) { // 50m tolerance
      return bestMatch;
    }

    return null;
  }

  /**
   * Calculate distance from point to line segment
   */
  distanceToSegment(point, segment) {
    const { startPoint, endPoint } = segment;
    
    const A = point.latitude - startPoint.latitude;
    const B = point.longitude - startPoint.longitude;
    const C = endPoint.latitude - startPoint.latitude;
    const D = endPoint.longitude - startPoint.longitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = startPoint.latitude;
      yy = startPoint.longitude;
    } else if (param > 1) {
      xx = endPoint.latitude;
      yy = endPoint.longitude;
    } else {
      xx = startPoint.latitude + param * C;
      yy = startPoint.longitude + param * D;
    }

    return calculateDistance(point, { latitude: xx, longitude: yy });
  }

  /**
   * Classify road by segment context (fallback)
   */
  classifyRoadByContext(segment) {
    const distance = segment.distance;
    
    // Heuristic classification
    if (distance > 100) {
      return { roadType: 'primary', confidence: 'low' };
    } else if (distance > 50) {
      return { roadType: 'secondary', confidence: 'low' };
    } else {
      return { roadType: 'residential', confidence: 'low' };
    }
  }

  /**
   * Utility methods
   */
  
  calculateMidpoint(point1, point2) {
    return {
      latitude: (point1.latitude + point2.latitude) / 2,
      longitude: (point1.longitude + point2.longitude) / 2
    };
  }

  calculateBearing(point1, point2) {
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  validateGPSLocation(location) {
    return location &&
           typeof location.latitude === 'number' &&
           typeof location.longitude === 'number' &&
           location.latitude >= -90 && location.latitude <= 90 &&
           location.longitude >= -180 && location.longitude <= 180;
  }

  createErrorResult(message) {
    return {
      success: false,
      error: message,
      speedLimit: 60, // Safe fallback
      speedSource: 'error_fallback',
      timestamp: Date.now()
    };
  }

  createFallbackSpeed(segment) {
    return {
      speedLimit: 60,
      source: 'processing_fallback',
      priority: SPEED_PRIORITY.SAFETY_FALLBACK,
      roadType: 'unknown',
      roadName: 'Unknown Road',
      confidence: 'low'
    };
  }

  /**
   * Public methods
   */

  getCurrentSegmentIndex() {
    return this.currentSegmentIndex;
  }

  getTotalSegments() {
    return this.routeSegments.length;
  }

  getPerformanceMetrics() {
    const avgProcessingTime = this.metrics.processingTimes.length > 0
      ? this.metrics.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.processingTimes.length
      : 0;

    return {
      totalUpdates: this.metrics.totalUpdates,
      cacheHitRate: this.metrics.totalUpdates > 0 
        ? `${((this.metrics.cacheHits / this.metrics.totalUpdates) * 100).toFixed(1)}%`
        : '0%',
      apiCalls: this.metrics.apiCalls,
      averageProcessingTime: Math.round(avgProcessingTime)
    };
  }

  clearRoute() {
    this.activeRoute = null;
    this.routeSegments = [];
    this.currentSegmentIndex = -1;
    this.segmentCache.clear();
    this.roadDataCache.clear();
    
    console.log('🗑️ Precision speed engine cleared');
  }

  // Cache management with TTL
  cleanupCache() {
    const now = Date.now();
    const ttl = 3600000; // 1 hour

    // Clean segment cache
    for (const [key, value] of this.segmentCache.entries()) {
      if (now - value.timestamp > ttl) {
        this.segmentCache.delete(key);
      }
    }

    // Clean road data cache  
    for (const [key, value] of this.roadDataCache.entries()) {
      if (now - value.timestamp > ttl) {
        this.roadDataCache.delete(key);
      }
    }
  }
}

export default new PrecisionRouteSpeedEngine();