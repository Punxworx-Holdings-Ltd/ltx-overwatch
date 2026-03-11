// Fusion layers API — describes the layer stack used for compositing
import { NextResponse } from "next/server";
import { DEFAULT_LAYER_STACK } from "@/lib/fusion/compositor";

export async function GET() {
  return NextResponse.json({
    layers: DEFAULT_LAYER_STACK.map((layer) => ({
      ...layer,
      description: getLayerDescription(layer.type),
    })),
    patent: "US 10,951,814 B2",
    method: "WebGL GPU-rendered layers composited INTO satellite imagery tiles using deck.gl MapboxOverlay with interleaved rendering",
    tiers: [
      {
        tier: 1,
        name: "Satellite Base",
        description: "BitmapLayer/TileLayer rendering real satellite tiles from Sentinel Hub or Mapbox",
      },
      {
        tier: 2,
        name: "FusionHaloLayer",
        description: "Custom ScatterplotLayer with additive blending — halos appear to glow FROM the satellite imagery",
      },
      {
        tier: 3,
        name: "EntityIdentificationLayer",
        description: "GPU-rendered entity icons + data readouts (callsigns, biometrics, speed) that scale with imagery zoom",
      },
    ],
  });
}

function getLayerDescription(type: string): string {
  switch (type) {
    case "satellite": return "Base satellite imagery tiles (Sentinel-2, Mapbox Satellite)";
    case "geofence": return "Geofence polygon boundaries with breach-state colouring";
    case "trail": return "Entity movement trails as time-decaying polylines";
    case "halo": return "Luminous halos blended INTO imagery using additive WebGL blending";
    case "entity": return "Entity identification labels with live data readouts";
    case "alert": return "Expanding ripple rings at alert trigger locations";
    default: return "Unknown layer type";
  }
}
