// Coordinate conversion API — GPS to pixel position within satellite tiles
// Demonstrates the core patent claim: GPS-to-pixel compositing
import { NextRequest, NextResponse } from "next/server";
import { gpsToPixel, gpsToBboxPosition, metersPerPixel } from "@/lib/fusion/coordinate-converter";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lng = parseFloat(params.get("lng") || "");
  const lat = parseFloat(params.get("lat") || "");
  const zoom = parseFloat(params.get("zoom") || "14");
  const viewportWidth = parseFloat(params.get("width") || "1920");
  const viewportHeight = parseFloat(params.get("height") || "1080");
  const centerLng = parseFloat(params.get("centerLng") || String(lng));
  const centerLat = parseFloat(params.get("centerLat") || String(lat));
  const bbox = params.get("bbox");

  if (isNaN(lng) || isNaN(lat)) {
    return NextResponse.json(
      {
        error: "lng and lat parameters required",
        example: "/api/fusion/coordinate?lng=-2.0975&lat=57.1497&zoom=14",
      },
      { status: 400 }
    );
  }

  const pixel = gpsToPixel(lng, lat, viewportWidth, viewportHeight, zoom, centerLng, centerLat);
  const mpp = metersPerPixel(lat, zoom);

  const result: Record<string, unknown> = {
    input: { lng, lat, zoom, viewportWidth, viewportHeight },
    pixel: { x: pixel.x.toFixed(2), y: pixel.y.toFixed(2) },
    metersPerPixel: mpp.toFixed(2),
    patent: "US 10,951,814 B2 — GPS-to-pixel coordinate conversion",
  };

  if (bbox) {
    const [west, south, east, north] = bbox.split(",").map(Number);
    if (![west, south, east, north].some(isNaN)) {
      const normalised = gpsToBboxPosition(lng, lat, { west, south, east, north });
      result.bboxPosition = {
        u: normalised.u.toFixed(6),
        v: normalised.v.toFixed(6),
        note: "Normalised [0-1] position within the bounding box",
      };
    }
  }

  return NextResponse.json(result);
}
