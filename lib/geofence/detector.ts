// Geofence breach detection using @turf/turf
// Patent claim: "Geofence breach detection within composited satellite-IoT imagery"

import { point, booleanPointInPolygon, polygon as turfPolygon } from "@turf/turf";

export interface GeofenceZone {
  id: string;
  name: string;
  scenarioId: string;
  geometry: GeoJSON.Polygon;
  fenceType: "exclusion" | "inclusion" | "alert";
  severity: "critical" | "high" | "medium" | "low";
  alertOnEntry: boolean;
  alertOnExit: boolean;
  authorizedEntities: string[];
  isActive: boolean;
}

export interface BreachEvent {
  geofenceId: string;
  geofenceName: string;
  entityId: string;
  deviceId: string;
  breachType: "entry" | "exit";
  severity: GeofenceZone["severity"];
  position: [number, number];
  timestamp: Date;
}

// Track entity positions for entry/exit detection
const entityPositionCache = new Map<string, Map<string, boolean>>();

/**
 * Check if a point is inside a geofence polygon
 */
export function isInsideGeofence(
  lng: number,
  lat: number,
  geofence: GeofenceZone
): boolean {
  const pt = point([lng, lat]);
  const poly = turfPolygon(geofence.geometry.coordinates);
  return booleanPointInPolygon(pt, poly);
}

/**
 * Check all geofences for a given entity position.
 * Returns breach events for any entries or exits detected.
 */
export function checkGeofences(
  entityId: string,
  deviceId: string,
  lng: number,
  lat: number,
  geofences: GeofenceZone[]
): BreachEvent[] {
  const breaches: BreachEvent[] = [];

  for (const fence of geofences) {
    if (!fence.isActive) continue;

    const isInside = isInsideGeofence(lng, lat, fence);

    // Get previous state
    if (!entityPositionCache.has(fence.id)) {
      entityPositionCache.set(fence.id, new Map());
    }
    const fenceCache = entityPositionCache.get(fence.id)!;
    const wasInside = fenceCache.get(entityId);

    // Detect entry
    if (isInside && !wasInside && fence.alertOnEntry) {
      // Check if entity is authorized
      const isAuthorized =
        fence.authorizedEntities.length === 0 ||
        fence.authorizedEntities.includes(entityId);

      if (!isAuthorized || fence.fenceType === "alert") {
        breaches.push({
          geofenceId: fence.id,
          geofenceName: fence.name,
          entityId,
          deviceId,
          breachType: "entry",
          severity: fence.severity,
          position: [lng, lat],
          timestamp: new Date(),
        });
      }
    }

    // Detect exit
    if (!isInside && wasInside && fence.alertOnExit) {
      breaches.push({
        geofenceId: fence.id,
        geofenceName: fence.name,
        entityId,
        deviceId,
        breachType: "exit",
        severity: fence.severity,
        position: [lng, lat],
        timestamp: new Date(),
      });
    }

    // Update cache
    fenceCache.set(entityId, isInside);
  }

  return breaches;
}

/**
 * Reset tracking state for a scenario (e.g., on scenario switch)
 */
export function resetGeofenceState(geofenceId?: string) {
  if (geofenceId) {
    entityPositionCache.delete(geofenceId);
  } else {
    entityPositionCache.clear();
  }
}

/**
 * Create a circular geofence from center + radius (metres)
 */
export function createCircularGeofence(
  center: [number, number],
  radiusKm: number,
  segments = 64
): GeoJSON.Polygon {
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const lat = center[1] + (dy / 111.32);
    const lng = center[0] + (dx / (111.32 * Math.cos((center[1] * Math.PI) / 180)));
    coords.push([lng, lat]);
  }
  return { type: "Polygon", coordinates: [coords] };
}
