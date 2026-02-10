import { decode } from "@mapbox/polyline";

export const decodePolyline = (encodedPolyline) => {
  try {
    if (!encodedPolyline) {
      console.warn("No polyline to decode");
      return [];
    }

    const decoded = decode(encodedPolyline);

    return decoded.map(([latitude, longitude]) => ({
      latitude,
      longitude,
    }));
  } catch (error) {
    console.error("Error decoding polyline:", error);
    return [];
  }
};

export const calculateDistance = (point1, point2) => {
  const R = 6371e3;
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateTotalDistance = (coordinates) => {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += calculateDistance(coordinates[i - 1], coordinates[i]);
  }
  return total;
};
