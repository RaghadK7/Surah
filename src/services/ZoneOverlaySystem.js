/**
 * Zone Overlay System
 * Manages contextual zones as visual/warning overlays without speed overrides
 * 
 * Core Principle: Zones provide context and warnings, not regulatory speed limits
 * Speed overrides are only applied when:
 * 1. Destination lies within the zone
 * 2. Explicit zone entry/exit is detected
 * 3. User explicitly enters a zone-restricted area
 */

import { calculateDistance } from '../utils/polylineDecoder';
import { SPECIAL_ZONES, ROAD_PRIORITY_RULES } from '../config/constants';

const ZONE_TYPES = {
  SCHOOL: 'school',
  HOSPITAL: 'hospital',
  MOSQUE: 'mosque',
  CONSTRUCTION: 'construction',
  MALL: 'mall',
  RESIDENTIAL: 'residential'
};

const WARNING_LEVELS = {
  PROXIMITY: 'proximity',     // Visual indicator only
  APPROACH: 'approach',       // Audio/visual warning
  CAUTION: 'caution',        // Active recommendation
  OVERRIDE: 'override'       // Speed limit override (rare)
};

class ZoneOverlaySystem {
  constructor() {
    this.activeZones = [];
    this.zoneHistory = [];
    this.warningCooldown = {};
    this.lastZoneCheck = 0;
    this.checkInterval = 3000; // Check every 3 seconds
  }

  /**
   * Primary method: Process zones for current position and route
   * @param {Object} currentPosition - GPS position
   * @param {Object} routeContext - Current route segment and destination
   * @param {Array} nearbyPOIs - Nearby points of interest
   * @returns {Object} - Zone processing result
   */
  processZones(currentPosition, routeContext, nearbyPOIs = []) {
    console.log('🏘️ Processing zone overlays...');

    try {
      const now = Date.now();
      
      // Throttle zone checks for performance
      if (now - this.lastZoneCheck < this.checkInterval) {
        return this.getLastResult();
      }

      this.lastZoneCheck = now;

      // Step 1: Detect nearby zones
      const detectedZones = this.detectNearbyZones(currentPosition, nearbyPOIs);
      
      // Step 2: Classify zone interactions
      const classifiedZones = this.classifyZoneInteractions(
        detectedZones, 
        currentPosition, 
        routeContext
      );
      
      // Step 3: Generate appropriate responses
      const zoneResponses = this.generateZoneResponses(classifiedZones, routeContext);
      
      // Step 4: Update active zones
      this.updateActiveZones(classifiedZones);

      console.log(`🎯 Processed ${detectedZones.length} zones, ${zoneResponses.warnings.length} warnings`);

      return {
        success: true,
        zones: classifiedZones,
        warnings: zoneResponses.warnings,
        speedOverride: zoneResponses.speedOverride,
        visualIndicators: zoneResponses.visualIndicators,
        metadata: {
          totalZones: detectedZones.length,
          activeZones: this.activeZones.length,
          processingTime: Date.now() - now
        }
      };

    } catch (error) {
      console.error('❌ Zone processing failed:', error);
      return this.createFailedResult(error.message);
    }
  }

  /**
   * Detect zones near current position
   * @param {Object} position - Current GPS position
   * @param {Array} pois - Points of interest from Google Places API
   * @returns {Array} - Detected zones
   */
  detectNearbyZones(position, pois) {
    const detectedZones = [];

    // Process each POI
    pois.forEach(poi => {
      const distance = calculateDistance(position, poi.location);
      const zoneType = this.classifyPOIAsZone(poi);
      
      if (zoneType && distance <= SPECIAL_ZONES[zoneType]?.detectionRadius) {
        detectedZones.push({
          id: `${zoneType}_${poi.place_id || poi.id}`,
          type: zoneType,
          name: poi.name,
          location: poi.location,
          distance,
          poi,
          detectionRadius: SPECIAL_ZONES[zoneType].detectionRadius,
          applicationRadius: SPECIAL_ZONES[zoneType].applicationRadius,
          recommendedSpeed: SPECIAL_ZONES[zoneType].speed,
          detected_at: Date.now()
        });
      }
    });

    return detectedZones.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Classify POI as zone type
   * @param {Object} poi - Point of interest
   * @returns {string|null} - Zone type or null
   */
  classifyPOIAsZone(poi) {
    const types = poi.types || [];
    
    // School zones
    if (types.some(type => SPECIAL_ZONES.school.types.includes(type))) {
      return ZONE_TYPES.SCHOOL;
    }
    
    // Hospital zones  
    if (types.some(type => SPECIAL_ZONES.hospital.types.includes(type))) {
      return ZONE_TYPES.HOSPITAL;
    }
    
    // Mosque zones
    if (types.some(type => SPECIAL_ZONES.mosque.types.includes(type))) {
      return ZONE_TYPES.MOSQUE;
    }
    
    // Construction zones
    if (types.some(type => SPECIAL_ZONES.construction.types.includes(type))) {
      return ZONE_TYPES.CONSTRUCTION;
    }
    
    // Mall zones
    if (types.some(type => SPECIAL_ZONES.mall.types.includes(type))) {
      return ZONE_TYPES.MALL;
    }

    return null;
  }

  /**
   * Classify zone interactions based on route context
   * @param {Array} detectedZones - Nearby zones
   * @param {Object} position - Current position
   * @param {Object} routeContext - Route and destination info
   * @returns {Array} - Classified zone interactions
   */
  classifyZoneInteractions(detectedZones, position, routeContext) {
    return detectedZones.map(zone => {
      const interaction = this.determineZoneInteraction(zone, position, routeContext);
      
      return {
        ...zone,
        interaction,
        warningLevel: this.determineWarningLevel(zone, interaction, routeContext),
        shouldOverrideSpeed: this.shouldOverrideSpeed(zone, interaction, routeContext),
        priority: this.calculateZonePriority(zone, interaction)
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Determine type of interaction with zone
   * @param {Object} zone - Zone information
   * @param {Object} position - Current position
   * @param {Object} routeContext - Route context
   * @returns {string} - Interaction type
   */
  determineZoneInteraction(zone, position, routeContext) {
    const { currentSegment, destination, route } = routeContext || {};
    
    // Check if destination is within zone
    if (destination && calculateDistance(destination, zone.location) <= zone.applicationRadius) {
      return 'destination_in_zone';
    }
    
    // Check if currently inside zone application area
    if (zone.distance <= zone.applicationRadius) {
      return 'inside_zone';
    }
    
    // Check if approaching zone
    if (zone.distance <= zone.detectionRadius) {
      return 'approaching_zone';
    }
    
    // Check if route passes through zone
    if (this.routePassesThroughZone(zone, route)) {
      return 'route_through_zone';
    }
    
    return 'proximity_only';
  }

  /**
   * Determine warning level for zone interaction
   * @param {Object} zone - Zone information
   * @param {string} interaction - Interaction type
   * @param {Object} routeContext - Route context
   * @returns {string} - Warning level
   */
  determineWarningLevel(zone, interaction, routeContext) {
    const { currentSegment } = routeContext || {};
    const roadType = currentSegment?.roadType;
    
    // Check if road type allows zone influence
    if (!this.roadAllowsZoneInfluence(roadType, zone.type)) {
      return WARNING_LEVELS.PROXIMITY; // Visual only
    }
    
    switch (interaction) {
      case 'destination_in_zone':
      case 'inside_zone':
        return WARNING_LEVELS.OVERRIDE;
        
      case 'route_through_zone':
        return WARNING_LEVELS.CAUTION;
        
      case 'approaching_zone':
        return WARNING_LEVELS.APPROACH;
        
      default:
        return WARNING_LEVELS.PROXIMITY;
    }
  }

  /**
   * Check if speed should be overridden for zone
   * @param {Object} zone - Zone information
   * @param {string} interaction - Interaction type  
   * @param {Object} routeContext - Route context
   * @returns {boolean} - Should override speed
   */
  shouldOverrideSpeed(zone, interaction, routeContext) {
    const { currentSegment } = routeContext || {};
    const roadType = currentSegment?.roadType;
    
    // Never override on protected road types
    if (!this.roadAllowsZoneInfluence(roadType, zone.type)) {
      return false;
    }
    
    // Override only for specific interactions
    return interaction === 'destination_in_zone' || 
           interaction === 'inside_zone';
  }

  /**
   * Check if road type allows zone influence
   * @param {string} roadType - Current road type
   * @param {string} zoneType - Zone type
   * @returns {boolean} - Whether zone can influence this road type
   */
  roadAllowsZoneInfluence(roadType, zoneType) {
    if (!roadType) return true; // Unknown roads allow influence
    
    const roadLevel = ROAD_PRIORITY_RULES.getRoadLevel(roadType);
    if (!roadLevel) return true;
    
    // Check if zone type is in allowed zones for this road level
    return roadLevel.allowedZones.includes(zoneType);
  }

  /**
   * Generate appropriate responses for classified zones
   * @param {Array} classifiedZones - Classified zone interactions
   * @param {Object} routeContext - Route context
   * @returns {Object} - Zone responses
   */
  generateZoneResponses(classifiedZones, routeContext) {
    const warnings = [];
    const visualIndicators = [];
    let speedOverride = null;
    
    classifiedZones.forEach(zone => {
      // Generate warning if needed
      if (this.shouldShowWarning(zone)) {
        warnings.push(this.createZoneWarning(zone));
      }
      
      // Create visual indicator
      visualIndicators.push(this.createVisualIndicator(zone));
      
      // Apply speed override if appropriate
      if (zone.shouldOverrideSpeed && !speedOverride) {
        speedOverride = {
          speed: zone.recommendedSpeed,
          reason: `${zone.type}_zone`,
          zoneName: zone.name,
          temporary: true
        };
      }
    });
    
    return {
      warnings,
      visualIndicators,
      speedOverride
    };
  }

  /**
   * Check if warning should be shown (with cooldown)
   * @param {Object} zone - Zone information
   * @returns {boolean} - Should show warning
   */
  shouldShowWarning(zone) {
    if (zone.warningLevel === WARNING_LEVELS.PROXIMITY) {
      return false; // Visual only
    }
    
    const cooldownKey = `${zone.id}_${zone.warningLevel}`;
    const lastWarning = this.warningCooldown[cooldownKey] || 0;
    const cooldownPeriod = this.getWarningCooldownPeriod(zone.warningLevel);
    
    if (Date.now() - lastWarning > cooldownPeriod) {
      this.warningCooldown[cooldownKey] = Date.now();
      return true;
    }
    
    return false;
  }

  /**
   * Create zone warning object
   * @param {Object} zone - Zone information
   * @returns {Object} - Warning object
   */
  createZoneWarning(zone) {
    return {
      id: `warning_${zone.id}`,
      type: zone.type,
      level: zone.warningLevel,
      message: this.getWarningMessage(zone),
      zoneName: zone.name,
      recommendedSpeed: zone.recommendedSpeed,
      distance: Math.round(zone.distance),
      timestamp: Date.now()
    };
  }

  /**
   * Create visual indicator for zone
   * @param {Object} zone - Zone information
   * @returns {Object} - Visual indicator
   */
  createVisualIndicator(zone) {
    return {
      id: `indicator_${zone.id}`,
      type: zone.type,
      location: zone.location,
      name: zone.name,
      distance: Math.round(zone.distance),
      warningLevel: zone.warningLevel,
      icon: this.getZoneIcon(zone.type),
      color: this.getZoneColor(zone.warningLevel),
      shouldPulse: zone.warningLevel !== WARNING_LEVELS.PROXIMITY
    };
  }

  /**
   * Utility methods
   */
  
  calculateZonePriority(zone, interaction) {
    const basePriority = {
      'destination_in_zone': 100,
      'inside_zone': 90,
      'route_through_zone': 70,
      'approaching_zone': 50,
      'proximity_only': 20
    };
    
    const typePriority = {
      [ZONE_TYPES.CONSTRUCTION]: 20,
      [ZONE_TYPES.SCHOOL]: 15,
      [ZONE_TYPES.HOSPITAL]: 10,
      [ZONE_TYPES.MOSQUE]: 5,
      [ZONE_TYPES.MALL]: 2
    };
    
    return (basePriority[interaction] || 0) + (typePriority[zone.type] || 0);
  }

  getWarningCooldownPeriod(warningLevel) {
    switch (warningLevel) {
      case WARNING_LEVELS.OVERRIDE: return 5000;
      case WARNING_LEVELS.CAUTION: return 10000;
      case WARNING_LEVELS.APPROACH: return 15000;
      default: return 30000;
    }
  }

  getWarningMessage(zone) {
    const messages = {
      [ZONE_TYPES.SCHOOL]: '🏫 School zone ahead - Drive carefully',
      [ZONE_TYPES.HOSPITAL]: '🏥 Hospital zone - Reduce speed',  
      [ZONE_TYPES.MOSQUE]: '🕌 Mosque area - Please drive slowly',
      [ZONE_TYPES.CONSTRUCTION]: '🚧 Construction zone - Caution required',
      [ZONE_TYPES.MALL]: '🏬 Shopping area - Heavy pedestrian traffic'
    };
    
    return messages[zone.type] || `${zone.name} - Please drive carefully`;
  }

  getZoneIcon(zoneType) {
    const icons = {
      [ZONE_TYPES.SCHOOL]: '🏫',
      [ZONE_TYPES.HOSPITAL]: '🏥',
      [ZONE_TYPES.MOSQUE]: '🕌',
      [ZONE_TYPES.CONSTRUCTION]: '🚧',
      [ZONE_TYPES.MALL]: '🏬'
    };
    
    return icons[zoneType] || '⚠️';
  }

  getZoneColor(warningLevel) {
    const colors = {
      [WARNING_LEVELS.PROXIMITY]: '#4CAF50',   // Green
      [WARNING_LEVELS.APPROACH]: '#FF9800',    // Orange
      [WARNING_LEVELS.CAUTION]: '#FF5722',     // Red-orange
      [WARNING_LEVELS.OVERRIDE]: '#F44336'     // Red
    };
    
    return colors[warningLevel] || '#9E9E9E';
  }

  routePassesThroughZone(zone, route) {
    // Simplified check - could be enhanced with more sophisticated geometry
    if (!route || !route.coordinates) return false;
    
    return route.coordinates.some(coord => 
      calculateDistance(coord, zone.location) <= zone.applicationRadius
    );
  }

  updateActiveZones(classifiedZones) {
    this.activeZones = classifiedZones.filter(zone => 
      zone.warningLevel !== WARNING_LEVELS.PROXIMITY
    );
  }

  getLastResult() {
    return {
      success: true,
      cached: true,
      zones: this.activeZones,
      warnings: [],
      speedOverride: null,
      visualIndicators: this.activeZones.map(zone => this.createVisualIndicator(zone))
    };
  }

  createFailedResult(reason) {
    return {
      success: false,
      reason,
      zones: [],
      warnings: [],
      speedOverride: null,
      visualIndicators: []
    };
  }

  /**
   * Public methods for external control
   */

  clearActiveZones() {
    this.activeZones = [];
    this.warningCooldown = {};
    console.log('🗑️ Zone overlays cleared');
  }

  getActiveZones() {
    return this.activeZones;
  }

  adjustCheckInterval(interval) {
    this.checkInterval = interval;
    console.log(`⚙️ Zone check interval set to ${interval}ms`);
  }
}

export default new ZoneOverlaySystem();