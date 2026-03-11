// AlertRippleLayer — expanding ring animation at alert locations
// Renders cascading ripple effects when geofence breaches or threshold alerts fire

import { ScatterplotLayer } from "@deck.gl/layers";

interface AlertLocation {
  id: string;
  position: [number, number];
  severity: "critical" | "high" | "medium" | "low";
  timestamp: number;
}

const SEVERITY_COLORS: Record<string, [number, number, number]> = {
  critical: [239, 68, 68],   // threat red
  high: [245, 158, 11],      // warning amber
  medium: [59, 130, 246],    // intel blue
  low: [107, 114, 128],      // neutral grey
};

const RIPPLE_DURATION_MS = 3000;
const RIPPLE_MAX_RADIUS = 200;
const RIPPLE_RINGS = 3;

/**
 * Create multiple expanding ripple ring layers for active alerts
 */
export function createAlertRippleLayers(
  alerts: AlertLocation[],
  opts: { visible?: boolean; now?: number } = {}
) {
  const now = opts.now ?? Date.now();
  const visible = opts.visible ?? true;
  const layers = [];

  for (let ring = 0; ring < RIPPLE_RINGS; ring++) {
    const ringOffset = (ring / RIPPLE_RINGS) * RIPPLE_DURATION_MS;

    layers.push(
      new ScatterplotLayer<AlertLocation>({
        id: `alert-ripple-${ring}`,
        data: alerts.filter((a) => now - a.timestamp < RIPPLE_DURATION_MS * 3),
        visible,
        pickable: false,
        getPosition: (d) => [d.position[0], d.position[1], 0],
        getRadius: (d) => {
          const elapsed = (now - d.timestamp + ringOffset) % RIPPLE_DURATION_MS;
          const progress = elapsed / RIPPLE_DURATION_MS;
          return progress * RIPPLE_MAX_RADIUS;
        },
        getFillColor: (d) => {
          const color = SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.medium;
          const elapsed = (now - d.timestamp + ringOffset) % RIPPLE_DURATION_MS;
          const progress = elapsed / RIPPLE_DURATION_MS;
          const alpha = Math.max(0, (1 - progress) * 120);
          return [...color, alpha] as [number, number, number, number];
        },
        getLineColor: (d) => {
          const color = SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.medium;
          const elapsed = (now - d.timestamp + ringOffset) % RIPPLE_DURATION_MS;
          const progress = elapsed / RIPPLE_DURATION_MS;
          const alpha = Math.max(0, (1 - progress) * 200);
          return [...color, alpha] as [number, number, number, number];
        },
        filled: true,
        stroked: true,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 2,
        radiusMinPixels: 2,
        radiusMaxPixels: 80,
        parameters: {
          blendColorSrcFactor: "src-alpha",
          blendColorDstFactor: "one",
          blendAlphaSrcFactor: "one",
          blendAlphaDstFactor: "one",
        },
        updateTriggers: {
          getRadius: [now],
          getFillColor: [now],
          getLineColor: [now],
        },
      })
    );
  }

  return layers;
}
