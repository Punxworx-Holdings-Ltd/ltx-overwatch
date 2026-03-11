"use client";

import { motion } from "framer-motion";
import { Terminal, Zap } from "lucide-react";

export function ApiDemo() {
  const curlCommand = `curl -X POST https://ltx-overwatch.vercel.app/api/iot/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "demo_public",
    "device_id": "my-tracker-01",
    "device_type": "gps_tracker",
    "entity_type": "vehicle",
    "entity_id": "Fleet Van #7",
    "lng": -2.0975,
    "lat": 57.1497,
    "payload": {
      "speed_kmh": 45,
      "fuel_pct": 72,
      "engine_temp": 88
    }
  }'`;

  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-accent" />
            <span className="font-mono text-sm tracking-widest text-accent uppercase">
              Connect Your IoT
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Try It Now. See Yourself From Space.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Send your GPS coordinates to our API. Your device appears IN the
            satellite imagery instantly &mdash; not as a pin on a map, but fused
            into the satellite tile with a pulsing halo and live data readout.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -top-3 left-4 flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full">
            <Zap className="w-3 h-3 text-accent" />
            <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
              Live API Endpoint
            </span>
          </div>
          <pre className="p-6 pt-8 rounded-lg border border-border bg-background overflow-x-auto">
            <code className="font-mono text-sm text-foreground whitespace-pre">
              {curlCommand}
            </code>
          </pre>
          <p className="mt-4 font-mono text-xs text-text-dim text-center">
            POST your IoT data &rarr; GPS converts to pixel coordinates &rarr;
            Entity appears IN the satellite image &rarr; That&apos;s the patent.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
