// Fusion compositor — orchestrates the compositing of IoT data INTO satellite imagery
// Patent claim: "Hybrid image generation: compositing IoT data INTO satellite imagery"

import type { FusionEntity, ViewportState } from "@/types";
import { gpsToBboxPosition } from "./coordinate-converter";

export interface CompositeLayer {
  id: string;
  type: "satellite" | "halo" | "entity" | "trail" | "geofence" | "alert";
  zIndex: number;
  visible: boolean;
  opacity: number;
}

// Default layer stack for fusion compositing
export const DEFAULT_LAYER_STACK: CompositeLayer[] = [
  { id: "satellite-base", type: "satellite", zIndex: 0, visible: true, opacity: 1.0 },
  { id: "geofence-zones", type: "geofence", zIndex: 1, visible: true, opacity: 0.6 },
  { id: "entity-trails", type: "trail", zIndex: 2, visible: true, opacity: 0.8 },
  { id: "fusion-halos", type: "halo", zIndex: 3, visible: true, opacity: 0.9 },
  { id: "entity-cores", type: "entity", zIndex: 4, visible: true, opacity: 1.0 },
  { id: "alert-ripples", type: "alert", zIndex: 5, visible: true, opacity: 0.8 },
];

/**
 * Calculate the bounding box for the current viewport
 */
export function viewportBbox(viewport: ViewportState): [number, number, number, number] {
  const { longitude, latitude, zoom } = viewport;
  const tileSize = 360 / Math.pow(2, zoom);
  const aspectRatio = 16 / 9;

  return [
    longitude - tileSize * aspectRatio / 2,
    latitude - tileSize / 2,
    longitude + tileSize * aspectRatio / 2,
    latitude + tileSize / 2,
  ];
}

/**
 * Filter entities within the current viewport bounds
 */
export function entitiesInViewport(
  entities: FusionEntity[],
  viewport: ViewportState,
  margin = 0.1
): FusionEntity[] {
  const [west, south, east, north] = viewportBbox(viewport);
  const dLng = (east - west) * margin;
  const dLat = (north - south) * margin;

  return entities.filter((e) => {
    const [lng, lat] = e.currentPosition;
    return (
      lng >= west - dLng &&
      lng <= east + dLng &&
      lat >= south - dLat &&
      lat <= north + dLat
    );
  });
}

/**
 * Calculate entity screen positions relative to viewport
 * Returns normalised [0-1, 0-1] positions for overlay rendering
 */
export function entityScreenPositions(
  entities: FusionEntity[],
  viewport: ViewportState
): Array<{ entity: FusionEntity; x: number; y: number }> {
  const [west, south, east, north] = viewportBbox(viewport);

  return entities.map((entity) => {
    const [lng, lat] = entity.currentPosition;
    const pos = gpsToBboxPosition(lng, lat, { west, south, east, north });
    return { entity, x: pos.u, y: pos.v };
  });
}

/**
 * Determine which composite layers should be active for a given zoom level
 */
export function activeLayersForZoom(zoom: number): CompositeLayer[] {
  return DEFAULT_LAYER_STACK.map((layer) => {
    // Trails only visible at higher zoom
    if (layer.type === "trail" && zoom < 10) {
      return { ...layer, visible: false };
    }
    // Entity labels only at higher zoom
    if (layer.type === "entity" && zoom < 8) {
      return { ...layer, visible: false };
    }
    return layer;
  });
}

/**
 * Generate fusion metadata for API response
 */
export function fusionMetadata(
  entities: FusionEntity[],
  viewport: ViewportState
) {
  const visible = entitiesInViewport(entities, viewport);
  const statusCounts = {
    friendly: visible.filter((e) => e.status === "friendly").length,
    neutral: visible.filter((e) => e.status === "neutral").length,
    threat: visible.filter((e) => e.status === "threat").length,
    alert: visible.filter((e) => e.status === "alert").length,
  };

  return {
    totalEntities: entities.length,
    visibleEntities: visible.length,
    statusCounts,
    viewport: viewportBbox(viewport),
    activeLayers: activeLayersForZoom(viewport.zoom).filter((l) => l.visible).length,
    timestamp: new Date().toISOString(),
  };
}
