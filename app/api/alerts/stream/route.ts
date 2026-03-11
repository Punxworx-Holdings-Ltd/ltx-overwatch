// Alert SSE stream — real-time alert notifications
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const scenario = req.nextUrl.searchParams.get("scenario");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            message: "Alert stream connected",
            scenario: scenario || "all",
            timestamp: new Date().toISOString(),
          })}\n\n`
        )
      );

      // Simulated alert generation
      let alertCounter = 0;
      const alertInterval = setInterval(() => {
        alertCounter++;

        // Generate a simulated alert every 15-30 seconds
        if (Math.random() > 0.5) return;

        const alertTypes = [
          {
            severity: "medium",
            type: "threshold",
            title: "Soil moisture below threshold",
            scenario: "green-canopy",
          },
          {
            severity: "high",
            type: "anomaly",
            title: "Unusual vessel movement detected",
            scenario: "deep-blue",
          },
          {
            severity: "low",
            type: "identification",
            title: "New entity detected in sector",
            scenario: "iron-curtain",
          },
        ];

        const alert = alertTypes[alertCounter % alertTypes.length];

        if (scenario && alert.scenario !== scenario) return;

        controller.enqueue(
          encoder.encode(
            `event: alert\ndata: ${JSON.stringify({
              id: `ALT-LIVE-${String(alertCounter).padStart(4, "0")}`,
              ...alert,
              status: "active",
              timestamp: new Date().toISOString(),
            })}\n\n`
          )
        );
      }, 10000);

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${Date.now()}\n\n`));
      }, 15000);

      // Cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(alertInterval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
