// IoT reading history — retrieve historical readings for a device
import { NextRequest, NextResponse } from "next/server";

// In-memory history buffer (would be Supabase iot_readings in production)
const historyBuffer = new Map<string, Array<{
  timestamp: string;
  lng: number;
  lat: number;
  payload: Record<string, unknown>;
}>>();

const MAX_HISTORY = 500;

/**
 * Record a reading into history (called by stream endpoint)
 */
export function recordReading(deviceId: string, reading: {
  timestamp: string;
  lng: number;
  lat: number;
  payload: Record<string, unknown>;
}) {
  if (!historyBuffer.has(deviceId)) {
    historyBuffer.set(deviceId, []);
  }
  const history = historyBuffer.get(deviceId)!;
  history.push(reading);
  if (history.length > MAX_HISTORY) history.shift();
}

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");

  if (!deviceId) {
    return NextResponse.json(
      { error: "device_id parameter required" },
      { status: 400 }
    );
  }

  const history = historyBuffer.get(deviceId) || [];

  return NextResponse.json({
    deviceId,
    readings: history.slice(-limit),
    total: history.length,
    note: history.length === 0
      ? "No history available. Start the IoT stream first via GET /api/iot/stream?scenario=<slug>"
      : undefined,
  });
}
