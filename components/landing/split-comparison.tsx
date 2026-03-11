"use client";

import { motion } from "framer-motion";
import { MapPin, Satellite, Radio, Crosshair } from "lucide-react";

// Simulated entity data for the comparison
const entities = [
  { id: "VH-01", label: "HMWV-03", data: "45km/h • Engine 88°C", top: "35%", left: "42%" },
  { id: "VH-02", label: "PAT-07", data: "Stationary • 2h14m", top: "55%", left: "68%" },
  { id: "PER-01", label: "SGT REEVES", data: "HR:72 SpO2:98%", top: "48%", left: "35%" },
  { id: "PER-02", label: "CPL AHMED", data: "HR:88 SpO2:96%", top: "62%", left: "52%" },
  { id: "CAM-01", label: "WATCHTOWER-N", data: "Clear • 12 detections", top: "28%", left: "55%" },
];

export function SplitComparison() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-mono text-sm tracking-widest text-accent uppercase mb-4 block">
            The Difference
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Data <span className="text-text-dim">ON</span> a Map vs Data{" "}
            <span className="text-accent">IN</span> the Image
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Every competitor places markers on top of maps. Our patent puts data
            inside the satellite imagery itself.
          </p>
        </motion.div>

        {/* Split comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-1 rounded-xl overflow-hidden border border-border"
        >
          {/* LEFT — Industry Standard (flat map with pins) */}
          <div className="relative bg-[#1a2744] min-h-[400px] overflow-hidden">
            {/* Simulated flat map background */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(100,120,160,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(100,120,160,0.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Simulated map shapes */}
              <div className="absolute top-[25%] left-[30%] w-[45%] h-[50%] rounded-lg bg-[#1e3050]/60 border border-[#2a4070]/30" />
              <div className="absolute top-[35%] left-[60%] w-[25%] h-[30%] rounded bg-[#1e3050]/40 border border-[#2a4070]/20" />
            </div>

            {/* Standard map pins */}
            {entities.map((e) => (
              <div
                key={e.id}
                className="absolute"
                style={{ top: e.top, left: e.left }}
              >
                <MapPin className="w-6 h-6 text-red-500 -translate-x-1/2 -translate-y-full drop-shadow-lg" />
              </div>
            ))}

            {/* Label */}
            <div className="absolute top-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
                  Industry Standard
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/40">
                Pins ON a flat map. No identity. No data. No context.
              </p>
            </div>

            {/* "What you see" callout */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded bg-black/40 border border-white/10">
              <div className="font-mono text-[10px] text-white/50 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>5 markers on map</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span>No identity — just dots</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span>Click popup for data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span>No relationship to ground truth</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — LTx OVERWATCH (fusion view) */}
          <div className="relative bg-[#0c1a0c] min-h-[400px] overflow-hidden">
            {/* Simulated satellite imagery background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1510] via-[#0d1a12] to-[#081510]" />
              {/* Terrain texture */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse at 45% 45%, rgba(34,80,44,0.5) 0%, transparent 50%), radial-gradient(ellipse at 65% 55%, rgba(28,60,38,0.4) 0%, transparent 40%)",
                }}
              />
              {/* Structures */}
              <div className="absolute top-[30%] left-[35%] w-16 h-10 bg-[#2a3a2a]/50 border border-[#3a5a3a]/30 rounded-sm" />
              <div className="absolute top-[45%] left-[50%] w-12 h-8 bg-[#2a3a2a]/40 border border-[#3a5a3a]/20 rounded-sm" />
              <div className="absolute top-[55%] left-[62%] w-14 h-6 bg-[#2a3a2a]/30 border border-[#3a5a3a]/15 rounded-sm" />
            </div>

            {/* Fusion entities — glowing halos with data readouts */}
            {entities.map((e) => (
              <div
                key={e.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: e.top, left: e.left }}
              >
                {/* Outer halo glow */}
                <div className="absolute -inset-4 rounded-full bg-accent/10 animate-halo-pulse" />
                <div className="absolute -inset-2 rounded-full bg-accent/20" />
                {/* Core dot */}
                <div className="relative w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(0,229,160,0.6)]" />
                {/* Data readout */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  <div className="font-mono text-[10px] font-bold text-accent leading-none">
                    {e.label}
                  </div>
                  <div className="font-mono text-[8px] text-accent/60 leading-none mt-0.5">
                    {e.data}
                  </div>
                </div>
              </div>
            ))}

            {/* Label */}
            <div className="absolute top-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <Crosshair className="w-4 h-4 text-accent" />
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  LTx OVERWATCH
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                  PATENTED
                </span>
              </div>
              <p className="font-mono text-[10px] text-accent/50">
                IoT data fused INTO satellite imagery. Identity. Data. Context.
              </p>
            </div>

            {/* "What you see" callout */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded bg-black/40 border border-accent/20">
              <div className="font-mono text-[10px] text-accent/70 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>5 identified entities in imagery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>
                    Callsign, speed, biometrics — at a glance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>GPS-to-pixel precision (patent core)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>WebGL-rendered in satellite context</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center font-mono text-xs text-text-dim mt-6"
        >
          Left: What every competitor does. Right: What only Space Aye can do
          (US Patent 10,951,814 B2).
        </motion.p>
      </div>
    </section>
  );
}
