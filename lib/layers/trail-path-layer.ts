// TrailPathLayer — Renders movement trails for IoT entities
// Shows where entities have been, creating temporal context within
// the satellite imagery

import { PathLayer } from "@deck.gl/layers";
import type { FusionEntity } from "@/types";

const STATUS_COLORS: Record<string, [number, number, number]> = {
  friendly: [0, 229, 160],
  neutral: [107, 114, 128],
  threat: [239, 68, 68],
  alert: [245, 158, 11],
};

interface TrailData {
  path: [number, number][];
  color: [number, number, number, number];
  entityId: string;
}

export function createTrailPathLayer(
  entities: FusionEntity[],
  opts: { id?: string; visible?: boolean; zoom?: number } = {}
) {
  // Only show trails for moving entities with enough trail data
  const trailData: TrailData[] = entities
    .filter((e) => e.trail.length > 2 && e.speed > 0.5)
    .map((e) => {
      const color = STATUS_COLORS[e.status] || STATUS_COLORS.neutral;
      return {
        path: e.trail.map((t) => [t[0], t[1]] as [number, number]),
        color: [...color, 100] as [number, number, number, number],
        entityId: e.entityId,
      };
    });

  return new PathLayer<TrailData>({
    id: opts.id || "trail-path-layer",
    data: trailData,
    visible: opts.visible ?? true,
    pickable: false,
    widthScale: 1,
    widthMinPixels: 1,
    widthMaxPixels: 4,
    getPath: (d) => d.path,
    getColor: (d) => d.color,
    getWidth: 2,
    jointRounded: true,
    capRounded: true,
    // Fade trail based on zoom
    opacity: Math.min(0.7, (opts.zoom ?? 14) / 20),
    updateTriggers: {
      getPath: [entities.map((e) => e.trail.length).join(",")],
    },
  });
}
