// Satellite orbit predictions — pass times for a given location
import { NextRequest, NextResponse } from "next/server";
import { CONSTELLATION, predictPasses, nextCaptureWindow } from "@/lib/satellite/orbit-calculator";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") || "51.5");
  const lng = parseFloat(params.get("lng") || "-0.1");
  const hours = parseInt(params.get("hours") || "72");
  const satelliteId = params.get("satellite");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  // If specific satellite requested
  if (satelliteId) {
    const sat = CONSTELLATION.find((s) => s.id === satelliteId);
    if (!sat) {
      return NextResponse.json({ error: `Satellite ${satelliteId} not found` }, { status: 404 });
    }
    const passes = predictPasses(lat, lng, sat, hours);
    return NextResponse.json({ satellite: sat, passes, location: { lat, lng } });
  }

  // All satellites
  const allPasses = CONSTELLATION.filter((s) => s.status === "active").flatMap((sat) => {
    const passes = predictPasses(lat, lng, sat, hours);
    return passes.map((p) => ({ ...p, satellite: sat }));
  });

  allPasses.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const next = nextCaptureWindow(lat, lng);

  return NextResponse.json({
    constellation: CONSTELLATION,
    passes: allPasses.slice(0, 50).map((p) => ({
      satelliteId: p.satelliteId,
      satelliteName: p.satelliteName,
      startTime: p.startTime.toISOString(),
      endTime: p.endTime.toISOString(),
      maxElevation: p.maxElevation.toFixed(1),
      direction: p.direction,
      coverageOverlap: p.coverageOverlap.toFixed(2),
    })),
    nextCapture: next
      ? {
          satellite: next.satelliteName,
          startTime: next.startTime.toISOString(),
        }
      : null,
    location: { lat, lng },
  });
}
