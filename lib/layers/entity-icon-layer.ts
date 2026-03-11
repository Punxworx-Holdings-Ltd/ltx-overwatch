// EntityIdentificationLayer — deck.gl TextLayer + IconLayer
// Renders entity identification labels and data readouts that
// scale with satellite imagery zoom level.
//
// Patent claim: Entity identification within composited imagery

import { TextLayer } from "@deck.gl/layers";
import type { FusionEntity } from "@/types";

const STATUS_COLORS: Record<string, [number, number, number, number]> = {
  friendly: [0, 229, 160, 230],
  neutral: [150, 150, 150, 200],
  threat: [239, 68, 68, 230],
  alert: [245, 158, 11, 230],
};

export function createEntityLabelLayer(
  entities: FusionEntity[],
  opts: { id?: string; visible?: boolean; zoom?: number } = {}
) {
  const zoom = opts.zoom ?? 14;

  // Only show labels at reasonable zoom levels
  if (zoom < 10) return null;

  // Progressive detail levels
  const showDetail = zoom >= 15;
  const showPayload = zoom >= 14;

  return new TextLayer<FusionEntity>({
    id: opts.id || "entity-label-layer",
    data: entities,
    visible: opts.visible ?? true,
    pickable: true,
    getPosition: (d) => [d.currentPosition[0], d.currentPosition[1], 0],
    getText: (d) => {
      const callsign = d.entityId || d.name;
      if (!showPayload) return callsign;

      // Build compact readout — 1 key metric only unless zoomed right in
      const lines = [callsign];
      const payload = d.latestPayload;

      if (showDetail) {
        if (payload.heart_rate) lines.push(`HR:${payload.heart_rate} SpO2:${payload.spo2}%`);
        else if (payload.speed_kmh) lines.push(`${payload.speed_kmh}km/h`);
        else if (payload.pressure_bar) lines.push(`${payload.pressure_bar}bar`);
        else if (payload.moisture_pct) lines.push(`M:${payload.moisture_pct}%`);
        else if (payload.speed_knots) lines.push(`${payload.speed_knots}kn`);
        else if (payload.activity_level) lines.push(`${payload.activity_level}`);
      }

      return lines.join("\n");
    },
    getColor: (d) => STATUS_COLORS[d.status] || STATUS_COLORS.neutral,
    getSize: 10,
    getAngle: 0,
    getTextAnchor: "start",
    getAlignmentBaseline: "center",
    getPixelOffset: [12, -2],
    fontFamily: "JetBrains Mono, monospace",
    fontWeight: 700,
    outlineWidth: 3,
    outlineColor: [10, 10, 10, 220],
    billboard: true,
    sizeScale: 1,
    sizeMinPixels: 8,
    sizeMaxPixels: 12,
    updateTriggers: {
      getText: [
        zoom,
        entities.map((e) => JSON.stringify(e.latestPayload)).join("|"),
      ],
      getPosition: [entities.map((e) => e.currentPosition.join(",")).join("|")],
    },
  });
}
