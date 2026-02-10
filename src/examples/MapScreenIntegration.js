/**
 * Integration Example: MapScreen with Route-Aware Speed System
 * 
 * This example shows how to integrate the new RouteAwareSpeedService
 * into the existing MapScreen component for precise speed attribution
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

// New route-aware services
import RouteAwareSpeedService from '../../services/RouteAwareSpeedService';
import SpeedService from '../../services/SpeedService'; // Updated wrapper
import DirectionsService from '../../services/DirectionsService';

// Existing services and components
import useLocation from '../../hooks/useLocation';
import SpeedDisplay from '../../components/SpeedDisplay';
import SpeedLimitBadge from '../../components/SpeedLimitBadge';

const MapScreenExample = ({ navigation }) => {
  // Existing state
  const [speedLimit, setSpeedLimit] = useState(80);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [routePolyline, setRoutePolyline] = useState(null);
  
  // New route-aware state
  const [isRouteAware, setIsRouteAware] = useState(false);
  const [routeSegments, setRouteSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [speedSource, setSpeedSource] = useState('fallback');
  const [zoneWarnings, setZoneWarnings] = useState([]);

  const { 
    location, 
    speed, 
    heading,
    accuracy 
  } = useLocation();

  /**
   * Effect: Initialize route-aware system when route is available
   */
  useEffect(() => {
    initializeRouteAwareSystem();
  }, []);

  /**
   * Effect: Process GPS updates for speed attribution
   */
  useEffect(() => {
    if (location) {
      handleGPSUpdate();
    }
  }, [location, heading]);

  /**
   * Initialize the route-aware speed system
   */
  const initializeRouteAwareSystem = async () => {
    try {
      console.log('🚀 Initializing Route-Aware Speed System...');
      
      // Check if we have an active route
      const routeData = DirectionsService.getRouteForSpeedProcessing();
      
      if (routeData) {
        console.log('📍 Found active route, enabling route-aware mode...');
        await enableRouteAwareMode(routeData);
      } else {
        console.log('📍 No active route, using fallback mode');
        setIsRouteAware(false);
      }

    } catch (error) {
      console.error('❌ Failed to initialize route-aware system:', error);
      setIsRouteAware(false);
    }
  };

  /**
   * Enable route-aware speed attribution
   */
  const enableRouteAwareMode = async (routeData) => {
    try {
      // Enable route-aware mode in SpeedService
      const success = await SpeedService.enableRouteAwareMode(routeData);
      
      if (success) {
        setIsRouteAware(true);
        setSpeedSource('route_aware');
        
        // Get route visualization data
        const routeViz = RouteAwareSpeedService.getRouteVisualization();
        if (routeViz) {
          setRouteSegments(routeViz.segments);
        }

        console.log('✅ Route-aware mode enabled successfully');
        
        // Show success feedback
        Alert.alert(
          'Route-Aware Speed Detection',
          'Precise speed limits are now active based on your route!',
          [{ text: 'Got it', style: 'default' }]
        );

      } else {
        throw new Error('Failed to process route');
      }

    } catch (error) {
      console.error('❌ Failed to enable route-aware mode:', error);
      setIsRouteAware(false);
      setSpeedSource('fallback');
      
      Alert.alert(
        'Speed Detection',
        'Using standard speed detection. Route-aware mode unavailable.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  /**
   * Handle GPS position updates for speed attribution
   */
  const handleGPSUpdate = async () => {
    if (!location) return;

    try {
      // Get speed limit using the updated SpeedService
      const detectedSpeedLimit = await SpeedService.getSpeedLimit(
        location.latitude,
        location.longitude,
        {
          heading: heading,
          speed: speed,
          accuracy: accuracy
        }
      );

      // Update speed limit
      if (detectedSpeedLimit && detectedSpeedLimit !== speedLimit) {
        setSpeedLimit(detectedSpeedLimit);
        console.log(`🎯 Speed limit updated: ${detectedSpeedLimit} km/h`);
      }

      // Get additional details if in route-aware mode
      if (isRouteAware) {
        const speedDetails = SpeedService.getSpeedDetails();
        
        if (speedDetails && speedDetails.lastResult) {
          const result = speedDetails.lastResult;
          
          // Update segment info
          setCurrentSegment(result.routeSegment);
          setSpeedSource(result.speedSource);
          
          // Update zone warnings
          if (result.zones && result.zones.warnings) {
            setZoneWarnings(result.zones.warnings);
          }
        }
      }

      // Update current speed
      let currentSpeed = speed || 0;
      if (currentSpeed < 2) currentSpeed = 0; // Filter out GPS noise
      setCurrentSpeed(Math.round(currentSpeed));

    } catch (error) {
      console.error('❌ GPS update processing failed:', error);
    }
  };

  /**
   * Handle new route selection
   */
  const handleRouteSelected = async (newRouteData) => {
    console.log('🛣️ New route selected, updating speed system...');
    
    try {
      await enableRouteAwareMode(newRouteData);
      setRoutePolyline(newRouteData.polyline);
      
    } catch (error) {
      console.error('❌ Route update failed:', error);
    }
  };

  /**
   * Get route polyline with speed-colored segments
   */
  const getSpeedColoredRoute = () => {
    if (!isRouteAware || !routeSegments || routeSegments.length === 0) {
      // Standard single-color route
      return routePolyline ? (
        <Polyline
          coordinates={routePolyline}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
      ) : null;
    }

    // Multi-colored route based on speed limits
    return routeSegments.map((segment, index) => (
      <Polyline
        key={`segment-${index}`}
        coordinates={segment.coordinates}
        strokeColor={segment.color}
        strokeWidth={currentSegment?.id === segment.id ? 6 : 4}
        strokeOpacity={currentSegment?.id === segment.id ? 1 : 0.8}
      />
    ));
  };

  /**
   * Get system status indicator
   */
  const getSystemStatusIndicator = () => {
    if (isRouteAware) {
      const status = RouteAwareSpeedService.getSystemStatus();
      return (
        <View style={styles.systemStatusBadge}>
          <Text style={styles.systemStatusText}>
            🎯 Route-Aware ({status.totalSegments} segments)
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.systemStatusBadge, styles.fallbackMode]}>
        <Text style={styles.systemStatusText}>
          📍 Standard Mode
        </Text>
      </View>
    );
  };

  /**
   * Render zone warning indicators
   */
  const renderZoneWarnings = () => {
    return zoneWarnings.map((warning, index) => (
      <View key={`warning-${index}`} style={styles.zoneWarning}>
        <Text style={styles.zoneWarningText}>
          {warning.message}
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location?.latitude || 24.7136,
          longitude: location?.longitude || 46.6753,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
      >
        {/* Route polyline with speed colors */}
        {getSpeedColoredRoute()}
      </MapView>

      {/* System status indicator */}
      {getSystemStatusIndicator()}

      {/* Speed display components */}
      <SpeedDisplay
        currentSpeed={currentSpeed}
        speedLimit={speedLimit}
        speedSource={speedSource}
        isRouteAware={isRouteAware}
      />

      <SpeedLimitBadge
        speedLimit={speedLimit}
        source={speedSource}
        confidence={currentSegment?.confidence}
      />

      {/* Zone warnings */}
      <View style={styles.warningsContainer}>
        {renderZoneWarnings()}
      </View>

      {/* Current segment info (debug) */}
      {__DEV__ && currentSegment && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Segment {currentSegment.id}: {currentSegment.roadType}
          </Text>
          <Text style={styles.debugText}>
            Distance: {currentSegment.distance}m
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles for the integration example
const styles = {
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  systemStatusBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fallbackMode: {
    backgroundColor: '#FF9800',
  },
  systemStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
  },
  zoneWarning: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  zoneWarningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
};

export default MapScreenExample;

/**
 * Integration Checklist:
 * 
 * ✅ 1. Import new services
 * ✅ 2. Initialize route-aware system
 * ✅ 3. Handle GPS updates with new system
 * ✅ 4. Process route updates
 * ✅ 5. Display route with speed-colored segments
 * ✅ 6. Show system status indicator
 * ✅ 7. Handle zone warnings as overlays
 * ✅ 8. Provide fallback mode
 * 
 * Key Benefits:
 * - Precise speed limits based on actual route segments
 * - Visual route coloring by speed zones
 * - Direction-aware GPS matching
 * - Zones as warnings, not speed overrides
 * - Backward compatibility with existing code
 */