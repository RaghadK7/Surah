// src/components/OptimizedMapView/index.js
import React, { memo, useCallback, useMemo } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAP_CONFIG } from '../../config/constants';
import { COLORS } from '../../config/colors';
import UserMarker from '../UserMarker';
import SpeedZoneMarker from '../SpeedZoneMarker';

const OptimizedMapView = memo(({
  mapRef,
  location,
  heading,
  speed,
  destination,
  route,
  speedZones,
  isNavigating,
  mapReady,
  setMapReady,
  decodePolyline,
  calculateDistance
}) => {
  // Optimize initial region calculation
  const initialRegion = useMemo(() => ({
    latitude: location?.latitude || MAP_CONFIG.INITIAL_LATITUDE,
    longitude: location?.longitude || MAP_CONFIG.INITIAL_LONGITUDE,
    latitudeDelta: MAP_CONFIG.LATITUDE_DELTA,
    longitudeDelta: MAP_CONFIG.LONGITUDE_DELTA,
  }), [location?.latitude, location?.longitude]);

  // Optimize polyline coordinates
  const routeCoordinates = useMemo(() => {
    if (!route?.route?.polyline) return [];
    try {
      return decodePolyline(route.route.polyline);
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  }, [route?.route?.polyline, decodePolyline]);

  // Optimize speed zone rendering - show only nearby zones
  const visibleSpeedZones = useMemo(() => {
    if (!speedZones || !location) return [];
    
    return speedZones.filter(zone => {
      const distance = calculateDistance(location, zone.coordinate);
      return distance < 2000; // Show only zones within 2km
    }).slice(0, 10); // Limit to maximum 10 zones
  }, [speedZones, location, calculateDistance]);

  // Memoized map ready handler
  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, [setMapReady]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      showsUserLocation={false} // Use custom marker instead
      showsMyLocationButton={false}
      showsCompass={true}
      showsTraffic={false} // Disable traffic for better performance
      onMapReady={handleMapReady}
      followsUserLocation={isNavigating}
      rotateEnabled={true}
      // Performance optimizations
      loadingEnabled={true}
      loadingIndicatorColor={COLORS.primary}
      loadingBackgroundColor={COLORS.background}
      moveOnMarkerPress={false}
      showsPointsOfInterest={false} // Disable POI for better performance
      showsBuildings={false} // Disable 3D buildings for better performance
    >
      {/* User Location Marker - Custom optimized marker */}
      {location && (
        <UserMarker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          heading={heading}
          speed={speed}
          isNavigating={isNavigating}
        />
      )}

      {/* Destination Marker */}
      {destination && (
        <Marker
          key="destination"
          coordinate={destination}
          title={destination.name}
          description={destination.address}
          pinColor="red"
        />
      )}

      {/* Route Polyline - Optimized */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={COLORS.primary}
          strokeWidth={4}
          zIndex={1}
          geodesic={true} // Better performance on long routes
        />
      )}

      {/* Speed Zone Markers - Optimized and limited */}
      {visibleSpeedZones.map((zone, index) => {
        const distanceFromUser = location
          ? calculateDistance(location, zone.coordinate)
          : null;

        return (
          <SpeedZoneMarker
            key={`speed-zone-${zone.coordinate.latitude}-${zone.coordinate.longitude}`}
            coordinate={zone.coordinate}
            speedLimit={zone.speedLimit}
            isUpcoming={distanceFromUser && distanceFromUser < 500}
            distanceFromUser={distanceFromUser}
          />
        );
      })}
    </MapView>
  );
});

OptimizedMapView.displayName = 'OptimizedMapView';

export default OptimizedMapView;