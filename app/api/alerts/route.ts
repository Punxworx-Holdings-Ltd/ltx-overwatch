// Alerts API — CRUD for alerts + active alert listing
import { NextRequest, NextResponse } from "next/server";

// In-memory alert store (would be Supabase alerts table in production)
const alertStore: Array<{
  id: string;
  scenarioId: string;
  severity: string;
  alertType: string;
  title: string;
  description: string;
  lng: number;
  lat: number;
  status: string;
  entityId: string;
  createdAt: string;
}> = [
  {
    id: "ALT-001",
    scenarioId: "iron-curtain",
    severity: "critical",
    alertType: "geofence_breach",
    title: "Unauthorised entity in EXCLUSION ZONE Alpha",
    description: "Unknown entity entered the exclusion perimeter at high speed.",
    lng: 44.31,
    lat: 33.31,
    status: "active",
    entityId: "UNKNOWN-1",
    createdAt: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "ALT-002",
    scenarioId: "black-gold",
    severity: "critical",
    alertType: "threshold",
    title: "Pipeline pressure anomaly — Segment S3",
    description: "Pressure drop of 27bar. Leak probability: 82%.",
    lng: -1.78,
    lat: 57.51,
    status: "active",
    entityId: "PIPE-013",
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "ALT-003",
    scenarioId: "first-light",
    severity: "high",
    alertType: "anomaly",
    title: "Elevated heart rate — Survivor CIV-026",
    description: "Heart rate spike to 142bpm, SpO2 dropped to 88%.",
    lng: 37.21,
    lat: 37.01,
    status: "active",
    entityId: "CIV-026",
    createdAt: new Date(Date.now() - 180000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const severity = req.nextUrl.searchParams.get("severity");
  const status = req.nextUrl.searchParams.get("status");
  const scenario = req.nextUrl.searchParams.get("scenario");

  let results = alertStore;
  if (severity) results = results.filter((a) => a.severity === severity);
  if (status) results = results.filter((a) => a.status === status);
  if (scenario) results = results.filter((a) => a.scenarioId === scenario);

  return NextResponse.json({
    alerts: results,
    total: results.length,
    counts: {
      critical: alertStore.filter((a) => a.severity === "critical" && a.status === "active").length,
      high: alertStore.filter((a) => a.severity === "high" && a.status === "active").length,
      active: alertStore.filter((a) => a.status === "active").length,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const { alertId, status } = await req.json();
    const alert = alertStore.find((a) => a.id === alertId);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }
    alert.status = status;
    return NextResponse.json({ alert });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
