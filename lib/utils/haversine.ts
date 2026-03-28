export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates the Haversine distance between two points on the Earth.
 * Returns the distance in kilometers.
 */
export function calculateHaversineDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

/**
 * Finds the nearest point from an array of target points to a source point.
 */
export function findNearestLocation<T extends Coordinates>(source: Coordinates, targets: T[]): T | null {
  if (targets.length === 0) return null;

  let nearestTarget = targets[0];
  let minDistance = calculateHaversineDistance(source, nearestTarget);

  for (let i = 1; i < targets.length; i++) {
    const distance = calculateHaversineDistance(source, targets[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestTarget = targets[i];
    }
  }

  return nearestTarget;
}
