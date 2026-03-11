// Satellite tasking API — request new captures
import { NextRequest, NextResponse } from "next/server";
import { nextCaptureWindow } from "@/lib/satellite/orbit-calculator";

// In-memory task queue (would be Supabase in production)
const taskQueue: Array<{
  id: string;
  scenarioId: string;
  imageryType: string;
  bbox: [number, number, number, number];
  status: string;
  satelliteId: string | null;
  scheduledAt: string | null;
  cloudCoverMax: number;
  createdAt: string;
}> = [];

let taskCounter = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, imageryType, lat, lng, cloudCoverMax = 30 } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng required" },
        { status: 400 }
      );
    }

    // Find next capture window
    const nextWindow = nextCaptureWindow(lat, lng);

    taskCounter++;
    const task = {
      id: `TSK-${String(taskCounter).padStart(3, "0")}`,
      scenarioId: scenarioId || "custom",
      imageryType: imageryType || "optical",
      bbox: [lng - 0.05, lat - 0.05, lng + 0.05, lat + 0.05] as [number, number, number, number],
      status: nextWindow ? "scheduled" : "pending",
      satelliteId: nextWindow?.satelliteId ?? null,
      scheduledAt: nextWindow?.startTime.toISOString() ?? null,
      cloudCoverMax,
      createdAt: new Date().toISOString(),
    };

    taskQueue.unshift(task);

    return NextResponse.json({
      task,
      nextWindow: nextWindow
        ? {
            satellite: nextWindow.satelliteName,
            startTime: nextWindow.startTime.toISOString(),
            endTime: nextWindow.endTime.toISOString(),
            elevation: nextWindow.maxElevation.toFixed(1),
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ tasks: taskQueue.slice(0, 20), total: taskQueue.length });
}
