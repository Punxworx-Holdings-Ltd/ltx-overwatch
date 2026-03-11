// FusionHaloLayer — Custom deck.gl ScatterplotLayer
// Renders luminous halos around IoT entities that BLEND into satellite imagery
// using screen blending — data appears to glow FROM the image, not float above it.
//
// This is the visual implementation of US Patent 10,951,814 B2:
// "Compositing remote sensing images with IoT data based on geolocation"

import { ScatterplotLayer } from "@deck.gl/layers";
import type { FusionEntity } from "@/types";

const STATUS_COLORS: Record<string, [number, number, number]> = {
  friendly: [0, 229, 160], // accent teal
  neutral: [107, 114, 128], // grey
  threat: [239, 68, 68], // red
  alert: [245, 158, 11], // amber
};

export function createFusionHaloLayer(
  entities: FusionEntity[],
  opts: { id?: string; visible?: boolean } = {}
) {
  const now = Date.now();

  return new ScatterplotLayer<FusionEntity>({
    id: opts.id || "fusion-halo-layer",
    data: entities,
    visible: opts.visible ?? true,
    pickable: false,
    opacity: 0.6,
    stroked: false,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 8,
    radiusMaxPixels: 60,
    getPosition: (d) => [d.currentPosition[0], d.currentPosition[1], 0],
    getRadius: (d) => {
      // Pulse effect: radius oscillates based on time
      const elapsed = now - d.transitionStart;
      const pulse = Math.sin(elapsed / 750) * 0.3 + 1;
      const baseRadius = d.status === "threat" ? 45 : d.status === "alert" ? 40 : 30;
      return baseRadius * pulse;
    },
    getFillColor: (d) => {
      const color = STATUS_COLORS[d.status] || STATUS_COLORS.neutral;
      // Vary opacity based on confidence
      const alpha = Math.round(d.confidence * 120);
      return [...color, alpha] as [number, number, number, number];
    },
    // Use additive blending for the "glow FROM image" effect
    parameters: {
      blendColorOperation: "add",
      blendAlphaOperation: "add",
      blendColorSrcFactor: "src-alpha",
      blendColorDstFactor: "one",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one",
    },
    updateTriggers: {
      getRadius: [now],
      getFillColor: [entities.map((e) => e.status).join(",")],
      getPosition: [entities.map((e) => e.currentPosition.join(",")).join("|")],
    },
  });
}

// Inner bright core of the halo
export function createFusionCoreLayer(
  entities: FusionEntity[],
  opts: { id?: string; visible?: boolean } = {}
) {
  return new ScatterplotLayer<FusionEntity>({
    id: opts.id || "fusion-core-layer",
    data: entities,
    visible: opts.visible ?? true,
    pickable: true,
    opacity: 0.9,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    radiusMinPixels: 3,
    radiusMaxPixels: 12,
    getPosition: (d) => [d.currentPosition[0], d.currentPosition[1], 0],
    getRadius: 6,
    getFillColor: (d) => {
      const color = STATUS_COLORS[d.status] || STATUS_COLORS.neutral;
      return [...color, 220] as [number, number, number, number];
    },
    getLineColor: [255, 255, 255, 180],
    getLineWidth: 1,
    updateTriggers: {
      getPosition: [entities.map((e) => e.currentPosition.join(",")).join("|")],
      getFillColor: [entities.map((e) => e.status).join(",")],
    },
  });
}
