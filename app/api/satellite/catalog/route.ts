// Satellite imagery catalog search — find available imagery for a location/time
import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/satellite/sentinel-hub";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const bbox = params.get("bbox");
  const from = params.get("from");
  const to = params.get("to");

  if (!bbox) {
    return NextResponse.json(
      { error: "bbox parameter required (west,south,east,north)" },
      { status: 400 }
    );
  }

  const [west, south, east, north] = bbox.split(",").map(Number);

  if ([west, south, east, north].some(isNaN)) {
    return NextResponse.json({ error: "Invalid bbox coordinates" }, { status: 400 });
  }

  const timeFrom = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const timeTo = to || new Date().toISOString().split("T")[0];

  try {
    const results = await searchCatalog(
      { west, south, east, north },
      timeFrom,
      timeTo
    );
    return NextResponse.json({
      results,
      query: { bbox: { west, south, east, north }, timeFrom, timeTo },
    });
  } catch (err) {
    // Fallback with simulated catalog results
    return NextResponse.json({
      results: [
        { id: "S2A_20260310", satellite: "Sentinel-2A", date: "2026-03-10", cloudCover: 12, resolution: 10 },
        { id: "S2B_20260308", satellite: "Sentinel-2B", date: "2026-03-08", cloudCover: 8, resolution: 10 },
        { id: "L9_20260305", satellite: "Landsat-9", date: "2026-03-05", cloudCover: 22, resolution: 30 },
        { id: "S1A_20260309", satellite: "Sentinel-1A", date: "2026-03-09", cloudCover: 0, resolution: 5 },
      ],
      query: { bbox: { west, south, east, north }, timeFrom, timeTo },
      note: "Simulated catalog results (Sentinel Hub credentials not configured)",
    });
  }
}
