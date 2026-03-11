// Geofence management API — list/create geofences for scenarios
import { NextRequest, NextResponse } from "next/server";
import { createCircularGeofence } from "@/lib/geofence/detector";

// Pre-configured geofences per scenario
const geofences = [
  {
    id: "GF-001",
    scenarioId: "iron-curtain",
    name: "EXCLUSION ZONE Alpha",
    fenceType: "exclusion",
    severity: "critical",
    center: [44.3, 33.3],
    radiusKm: 0.5,
    alertOnEntry: true,
    alertOnExit: false,
    authorizedEntities: ["PAT-01", "PAT-02", "PAT-03", "PAT-04", "VH-01", "VH-02"],
  },
  {
    id: "GF-002",
    scenarioId: "deep-blue",
    name: "Port Restricted Zone",
    fenceType: "exclusion",
    severity: "high",
    center: [-2.07, 57.14],
    radiusKm: 1.0,
    alertOnEntry: true,
    alertOnExit: true,
    authorizedEntities: [],
  },
  {
    id: "GF-003",
    scenarioId: "wild-pulse",
    name: "Park Boundary",
    fenceType: "alert",
    severity: "medium",
    center: [35.0, -1.5],
    radiusKm: 5.0,
    alertOnEntry: false,
    alertOnExit: true,
    authorizedEntities: [],
  },
  {
    id: "GF-004",
    scenarioId: "black-gold",
    name: "Pipeline Corridor",
    fenceType: "alert",
    severity: "high",
    center: [-1.8, 57.5],
    radiusKm: 0.3,
    alertOnEntry: true,
    alertOnExit: false,
    authorizedEntities: [],
  },
];

export async function GET(req: NextRequest) {
  const scenario = req.nextUrl.searchParams.get("scenario");

  const results = scenario
    ? geofences.filter((g) => g.scenarioId === scenario)
    : geofences;

  return NextResponse.json({
    geofences: results.map((g) => ({
      ...g,
      geometry: createCircularGeofence(g.center as [number, number], g.radiusKm),
    })),
    total: results.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, name, center, radiusKm, fenceType = "alert", severity = "medium" } = body;

    if (!scenarioId || !name || !center || !radiusKm) {
      return NextResponse.json(
        { error: "scenarioId, name, center [lng, lat], and radiusKm required" },
        { status: 400 }
      );
    }

    const geometry = createCircularGeofence(center, radiusKm);
    const newFence = {
      id: `GF-${String(geofences.length + 1).padStart(3, "0")}`,
      scenarioId,
      name,
      fenceType,
      severity,
      center,
      radiusKm,
      alertOnEntry: true,
      alertOnExit: false,
      authorizedEntities: [] as string[],
      geometry,
    };

    geofences.push(newFence as typeof geofences[0]);
    return NextResponse.json({ geofence: { ...newFence, geometry } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
