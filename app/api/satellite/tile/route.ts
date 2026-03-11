// Satellite tile API route
// Fetches satellite imagery tiles from Sentinel Hub or returns a fallback

import { NextRequest, NextResponse } from "next/server";
import type { ImageryType, BoundingBox } from "@/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const west = parseFloat(params.get("west") || "");
  const south = parseFloat(params.get("south") || "");
  const east = parseFloat(params.get("east") || "");
  const north = parseFloat(params.get("north") || "");
  const width = parseInt(params.get("width") || "512");
  const height = parseInt(params.get("height") || "512");
  const layer = (params.get("layer") || "optical") as ImageryType;

  if (isNaN(west) || isNaN(south) || isNaN(east) || isNaN(north)) {
    return NextResponse.json(
      { error: "Missing or invalid bbox parameters: west, south, east, north" },
      { status: 400 }
    );
  }

  const bbox: BoundingBox = { west, south, east, north };

  // Check if Sentinel Hub is configured
  const hasSentinelHub =
    process.env.SENTINEL_HUB_CLIENT_ID && process.env.SENTINEL_HUB_CLIENT_SECRET;

  if (hasSentinelHub) {
    try {
      const { fetchSentinelTile } = await import("@/lib/satellite/sentinel-hub");
      const tile = await fetchSentinelTile({
        bbox,
        width,
        height,
        imageryType: layer,
      });

      return new Response(new Uint8Array(tile), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    } catch (error) {
      console.error("Sentinel Hub fetch failed:", error);
      // Fall through to fallback
    }
  }

  // Fallback: Return tile metadata (Mapbox satellite tiles are loaded client-side)
  return NextResponse.json({
    source: "mapbox_satellite",
    bbox,
    layer,
    message:
      "Satellite tiles loaded via Mapbox GL JS client-side. Configure SENTINEL_HUB_CLIENT_ID and SENTINEL_HUB_CLIENT_SECRET for Copernicus Sentinel-2 tiles.",
    available_layers: ["optical", "ndvi", "sar", "infrared", "hyperspectral"],
  });
}
