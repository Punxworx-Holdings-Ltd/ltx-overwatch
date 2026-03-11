// IoT device registry — list and manage devices per scenario
import { NextRequest, NextResponse } from "next/server";
import { getServerSimEngine } from "@/lib/simulation/engine";

export async function GET(req: NextRequest) {
  const scenario = req.nextUrl.searchParams.get("scenario");

  if (!scenario) {
    return NextResponse.json(
      { error: "scenario parameter required" },
      { status: 400 }
    );
  }

  const engine = getServerSimEngine();
  engine.initScenario(scenario);
  const devices = engine.getDevices(scenario);

  return NextResponse.json({
    scenario,
    devices: devices.map((d) => ({
      id: d.id,
      deviceType: d.deviceType,
      entityType: d.entityType,
      entityId: d.entityId,
      name: d.name,
      status: d.status,
      position: {
        lng: d.lng,
        lat: d.lat,
      },
    })),
    total: devices.length,
  });
}
