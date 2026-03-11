// GeofencePolygonLayer — Renders geofence boundaries on satellite imagery
// with status-aware colouring and breach illumination effects

import { PolygonLayer } from "@deck.gl/layers";
import type { Geofence } from "@/types";

const FENCE_COLORS: Record<string, [number, number, number]> = {
  exclusion: [239, 68, 68], // red
  inclusion: [0, 229, 160], // green
  alert: [245, 158, 11], // amber
};

export function createGeofenceLayer(
  geofences: Geofence[],
  breachedIds: Set<string> = new Set(),
  opts: { id?: string; visible?: boolean } = {}
) {
  return new PolygonLayer<Geofence>({
    id: opts.id || "geofence-polygon-layer",
    data: geofences,
    visible: opts.visible ?? true,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: false,
    lineWidthMinPixels: 1,
    getPolygon: (d) => d.geometry.coordinates[0] as [number, number][],
    getFillColor: (d) => {
      const color = FENCE_COLORS[d.fence_type] || FENCE_COLORS.alert;
      const isBreach = breachedIds.has(d.id);
      // Brighter fill when breached
      const alpha = isBreach ? 60 : 20;
      return [...color, alpha] as [number, number, number, number];
    },
    getLineColor: (d) => {
      const color = FENCE_COLORS[d.fence_type] || FENCE_COLORS.alert;
      const isBreach = breachedIds.has(d.id);
      const alpha = isBreach ? 220 : 140;
      return [...color, alpha] as [number, number, number, number];
    },
    getLineWidth: (d) => (breachedIds.has(d.id) ? 3 : 1.5),
    updateTriggers: {
      getFillColor: [Array.from(breachedIds).join(",")],
      getLineColor: [Array.from(breachedIds).join(",")],
      getLineWidth: [Array.from(breachedIds).join(",")],
    },
  });
}
