/**
 * Map Matching Engine
 * Direction-aware GPS position matching to route segments
 * 
 * Ensures GPS positions are accurately matched to the correct road segment
 * even in complex scenarios like parallel roads, bridges, and service roads
 */

import { calculateDistance } from '../utils/polylineDecoder';

class MapMatchingEngine {
  constructor() {
    this.matchingRadius = 50; // 50 meter search radius
    this.directionTolerance = 45; // 45 degree direction tolerance
    this.lastMatchedSegment = null;
    this.matchingConfidence = 0;
    this.consecutiveMatches = 0;
  }

  /**
   * Primary method: Match GPS position to route segment
   * @param {Object} gpsPosition - Current GPS position {lat, lng, heading?, speed?}
   * @param {Array} routeSegments - Available route segments from RouteSegmentationService
   * @param {Object} options - Matching options
   * @returns {Object} - Matching result with segment and confidence
   */
  matchToRoute(gpsPosition, routeSegments, options = {}) {
    console.log('🎯 Starting GPS map matching...');

    try {
      // Validate inputs
      if (!this.validateInputs(gpsPosition, routeSegments)) {
        return this.createFailedMatch('Invalid inputs');
      }

      // Step 1: Find candidate segments within radius
      const candidates = this.findCandidateSegments(gpsPosition, routeSegments);
      
      if (candidates.length === 0) {
        console.warn('⚠️ No candidate segments found within radius');
        return this.createFailedMatch('No candidates found', gpsPosition);
      }

      console.log(`🔍 Found ${candidates.length} candidate segments`);

      // Step 2: Direction-aware filtering
      const directionFiltered = this.filterByDirection(gpsPosition, candidates);
      
      // Step 3: Calculate match scores
      const scoredCandidates = this.scoreMatches(gpsPosition, directionFiltered);
      
      // Step 4: Select best match with continuity consideration
      const bestMatch = this.selectBestMatch(scoredCandidates, options);

      // Step 5: Update tracking state
      this.updateMatchingState(bestMatch);

      console.log(`✅ Matched to segment ${bestMatch.segment.id} with confidence ${bestMatch.confidence}%`);

      return bestMatch;

    } catch (error) {
      console.error('❌ Map matching failed:', error);
      return this.createFailedMatch(error.message, gpsPosition);
    }
  }

  /**
   * Find segments within matching radius
   * @param {Object} gpsPosition - GPS position
   * @param {Array} routeSegments - Route segments
   * @returns {Array} - Candidate segments with distances
   */
  findCandidateSegments(gpsPosition, routeSegments) {
    const candidates = [];

    routeSegments.forEach(segment => {
      // Calculate distance to segment midpoint
      const distanceToMid = calculateDistance(gpsPosition, segment.midPoint);
      
      if (distanceToMid <= this.matchingRadius) {
        // Calculate more precise distance to segment line
        const lineDistance = this.distanceToLineSegment(gpsPosition, segment);
        
        candidates.push({
          segment,
          distanceToMid,
          distanceToLine: lineDistance,
          isWithinRadius: lineDistance <= this.matchingRadius
        });
      }
    });

    // Sort by line distance (most accurate)
    return candidates
      .filter(c => c.isWithinRadius)
      .sort((a, b) => a.distanceToLine - b.distanceToLine);
  }

  /**
   * Filter candidates by direction compatibility
   * @param {Object} gpsPosition - GPS position with heading
   * @param {Array} candidates - Candidate segments
   * @returns {Array} - Direction-compatible candidates
   */
  filterByDirection(gpsPosition, candidates) {
    // If no heading available, skip direction filtering
    if (!gpsPosition.heading && gpsPosition.heading !== 0) {
      return candidates;
    }

    return candidates.filter(candidate => {
      const segmentBearing = candidate.segment.bearing;
      const directionDiff = this.calculateDirectionDifference(gpsPosition.heading, segmentBearing);
      
      candidate.directionDiff = directionDiff;
      candidate.directionMatch = directionDiff <= this.directionTolerance;
      
      return candidate.directionMatch;
    });
  }

  /**
   * Score matches based on multiple criteria
   * @param {Object} gpsPosition - GPS position
   * @param {Array} candidates - Filtered candidates
   * @returns {Array} - Scored candidates
   */
  scoreMatches(gpsPosition, candidates) {
    return candidates.map(candidate => {
      const scores = {
        distance: this.scoreDistance(candidate.distanceToLine),
        direction: this.scoreDirection(candidate.directionDiff || 0),
        continuity: this.scoreContinuity(candidate.segment),
        geometry: this.scoreGeometry(candidate.segment, gpsPosition)
      };

      // Weighted total score
      const totalScore = (
        scores.distance * 0.4 +
        scores.direction * 0.3 +
        scores.continuity * 0.2 +
        scores.geometry * 0.1
      );

      return {
        ...candidate,
        scores,
        totalScore,
        confidence: Math.round(totalScore)
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Select the best match considering multiple factors
   * @param {Array} scoredCandidates - Scored candidate segments
   * @param {Object} options - Selection options
   * @returns {Object} - Best match result
   */
  selectBestMatch(scoredCandidates, options = {}) {
    if (scoredCandidates.length === 0) {
      return this.createFailedMatch('No valid candidates after scoring');
    }

    const bestCandidate = scoredCandidates[0];
    
    // Apply minimum confidence threshold
    const minConfidence = options.minConfidence || 70;
    if (bestCandidate.confidence < minConfidence) {
      return this.createFailedMatch(`Low confidence: ${bestCandidate.confidence}%`);
    }

    return {
      success: true,
      segment: bestCandidate.segment,
      confidence: bestCandidate.confidence,
      distanceToRoute: Math.round(bestCandidate.distanceToLine),
      directionMatch: bestCandidate.directionMatch !== false,
      scores: bestCandidate.scores,
      metadata: {
        totalCandidates: scoredCandidates.length,
        matchingRadius: this.matchingRadius,
        consecutiveMatches: this.consecutiveMatches
      }
    };
  }

  /**
   * Calculate distance from point to line segment
   * @param {Object} point - GPS point
   * @param {Object} segment - Route segment
   * @returns {number} - Distance in meters
   */
  distanceToLineSegment(point, segment) {
    const startPoint = segment.startPoint;
    const endPoint = segment.endPoint;
    
    // Calculate the distance from point to line segment
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
   * Calculate angular difference between two bearings
   * @param {number} heading1 - First bearing
   * @param {number} heading2 - Second bearing
   * @returns {number} - Difference in degrees
   */
  calculateDirectionDifference(heading1, heading2) {
    let diff = Math.abs(heading1 - heading2);
    if (diff > 180) {
      diff = 360 - diff;
    }
    return diff;
  }

  /**
   * Scoring functions
   */
  scoreDistance(distance) {
    // Score 0-100 based on distance (closer = higher score)
    if (distance <= 5) return 100;
    if (distance <= 10) return 90;
    if (distance <= 20) return 80;
    if (distance <= 30) return 70;
    if (distance <= 40) return 60;
    return Math.max(0, 50 - distance);
  }

  scoreDirection(directionDiff) {
    // Score 0-100 based on direction alignment
    if (directionDiff <= 5) return 100;
    if (directionDiff <= 15) return 90;
    if (directionDiff <= 30) return 80;
    if (directionDiff <= 45) return 70;
    return Math.max(0, 70 - directionDiff * 2);
  }

  scoreContinuity(segment) {
    // Score based on continuity with previous matches
    if (!this.lastMatchedSegment) return 50;
    
    const segmentGap = Math.abs(segment.id - this.lastMatchedSegment.id);
    
    if (segmentGap === 0) return 100; // Same segment
    if (segmentGap === 1) return 90;  // Adjacent segment
    if (segmentGap <= 3) return 70;   // Close segments
    if (segmentGap <= 5) return 50;   // Nearby segments
    return 30; // Distant segments
  }

  scoreGeometry(segment, gpsPosition) {
    // Score based on segment geometry compatibility
    const segmentLength = segment.distance;
    
    // Prefer segments of appropriate length
    if (segmentLength >= 15 && segmentLength <= 35) return 100;
    if (segmentLength >= 10 && segmentLength <= 50) return 80;
    return 60;
  }

  /**
   * Update internal matching state
   */
  updateMatchingState(matchResult) {
    if (matchResult.success) {
      this.lastMatchedSegment = matchResult.segment;
      this.matchingConfidence = matchResult.confidence;
      this.consecutiveMatches += 1;
    } else {
      this.consecutiveMatches = Math.max(0, this.consecutiveMatches - 1);
    }
  }

  /**
   * Create failed match result
   */
  createFailedMatch(reason, gpsPosition = null) {
    return {
      success: false,
      reason,
      segment: null,
      confidence: 0,
      gpsPosition,
      metadata: {
        consecutiveMatches: this.consecutiveMatches
      }
    };
  }

  /**
   * Validate inputs
   */
  validateInputs(gpsPosition, routeSegments) {
    return (
      gpsPosition &&
      typeof gpsPosition.latitude === 'number' &&
      typeof gpsPosition.longitude === 'number' &&
      Array.isArray(routeSegments) &&
      routeSegments.length > 0
    );
  }

  /**
   * Get current match quality statistics
   */
  getMatchingStats() {
    return {
      lastMatchedSegment: this.lastMatchedSegment?.id || null,
      matchingConfidence: this.matchingConfidence,
      consecutiveMatches: this.consecutiveMatches,
      matchingRadius: this.matchingRadius,
      directionTolerance: this.directionTolerance
    };
  }

  /**
   * Reset matching state
   */
  resetMatching() {
    this.lastMatchedSegment = null;
    this.matchingConfidence = 0;
    this.consecutiveMatches = 0;
    console.log('🔄 Map matching state reset');
  }

  /**
   * Adjust matching parameters
   */
  adjustParameters(options = {}) {
    if (options.matchingRadius) {
      this.matchingRadius = options.matchingRadius;
    }
    if (options.directionTolerance) {
      this.directionTolerance = options.directionTolerance;
    }
    
    console.log(`⚙️ Matching parameters updated: radius=${this.matchingRadius}m, direction=${this.directionTolerance}°`);
  }
}

export default new MapMatchingEngine();