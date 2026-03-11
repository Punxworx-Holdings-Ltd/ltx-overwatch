// Fusion composite API — returns current fusion state for a scenario
import { NextRequest, NextResponse } from "next/server";
import { SCENARIOS } from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  const scenario = req.nextUrl.searchParams.get("scenario");

  if (!scenario) {
    return NextResponse.json(
      { error: "scenario parameter required" },
      { status: 400 }
    );
  }

  const config = SCENARIOS.find((s) => s.slug === scenario);
  if (!config) {
    return NextResponse.json(
      { error: `Unknown scenario: ${scenario}` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    scenario: config.slug,
    name: config.name,
    sector: config.sector,
    viewport: {
      center: config.center,
      zoom: config.zoom,
    },
    layers: [
      { id: "satellite-base", type: "satellite", zIndex: 0, active: true },
      { id: "geofence-zones", type: "geofence", zIndex: 1, active: true },
      { id: "entity-trails", type: "trail", zIndex: 2, active: true },
      { id: "fusion-halos", type: "halo", zIndex: 3, active: true },
      { id: "entity-cores", type: "entity", zIndex: 4, active: true },
      { id: "alert-ripples", type: "alert", zIndex: 5, active: true },
    ],
    patent: "US 10,951,814 B2",
    method: "GPS-to-pixel coordinate conversion compositing IoT data INTO satellite imagery",
    streamEndpoint: `/api/iot/stream?scenario=${scenario}`,
    timestamp: new Date().toISOString(),
  });
}
