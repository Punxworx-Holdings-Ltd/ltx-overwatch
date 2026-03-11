// SSE endpoint for real-time IoT data streaming
// Clients connect to /api/iot/stream?scenario=iron-curtain to receive live readings

import { NextRequest } from "next/server";
import { getServerSimEngine } from "@/lib/simulation/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const scenarioSlug = request.nextUrl.searchParams.get("scenario");

  if (!scenarioSlug) {
    return new Response(JSON.stringify({ error: "Missing ?scenario= parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const engine = getServerSimEngine();

  // Initialise scenario devices if not already done
  try {
    const existing = engine.getDevices(scenarioSlug);
    if (existing.length === 0) {
      engine.initScenario(scenarioSlug);
    }
  } catch {
    return new Response(JSON.stringify({ error: `Unknown scenario: ${scenarioSlug}` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Start streaming if not already
  engine.startStreaming(scenarioSlug, 2000);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial device roster
      const devices = engine.getDevices(scenarioSlug);
      const initEvent = `event: init\ndata: ${JSON.stringify({
        scenario: scenarioSlug,
        devices: devices.map((d) => ({
          id: d.id,
          deviceType: d.deviceType,
          entityType: d.entityType,
          entityId: d.entityId,
          name: d.name,
          lng: d.lng,
          lat: d.lat,
          heading: d.heading,
          speed: d.speed,
          status: d.status,
          metadata: d.metadata,
        })),
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initEvent));

      // Subscribe to readings
      const unsubscribe = engine.subscribe(scenarioSlug, (reading) => {
        try {
          const device = engine.getDevice(reading.device_id);
          const data = `event: reading\ndata: ${JSON.stringify({
            ...reading,
            entityType: device?.entityType,
            entityId: device?.entityId,
            name: device?.name,
            deviceType: device?.deviceType,
            status: device?.status,
          })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // Client disconnected
        }
      });

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
