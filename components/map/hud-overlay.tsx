"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Military HUD overlay — compass, coordinates, bearing, altitude readout
 * Renders on top of map viewport as a heads-up display
 */
export function HudOverlay({
  lat,
  lng,
  zoom,
  bearing = 0,
  pitch = 0,
  entityCount = 0,
  mode = "standard",
}: {
  lat: number;
  lng: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
  entityCount?: number;
  mode?: string;
}) {
  const [time, setTime] = useState("");
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        })
      );
      setFrameCount((p) => p + 1);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const altitude = Math.round(
    (40075000 * Math.cos((lat * Math.PI) / 180)) /
      Math.pow(2, zoom + 8) *
      1000
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 font-mono">
      {/* Top-left — coordinates + bearing */}
      <div className="absolute top-3 left-3 space-y-1">
        <div className="text-[10px] text-white/70 tabular-nums tracking-wider">
          <span className="text-accent/80">LAT</span>{" "}
          {lat >= 0 ? "N" : "S"}
          {Math.abs(lat).toFixed(6)}°
        </div>
        <div className="text-[10px] text-white/70 tabular-nums tracking-wider">
          <span className="text-accent/80">LNG</span>{" "}
          {lng >= 0 ? "E" : "W"}
          {Math.abs(lng).toFixed(6)}°
        </div>
        <div className="text-[10px] text-white/70 tabular-nums tracking-wider">
          <span className="text-accent/80">BRG</span>{" "}
          {bearing.toFixed(1)}° <span className="text-white/40">|</span>{" "}
          <span className="text-accent/80">PIT</span> {pitch.toFixed(1)}°
        </div>
        <div className="text-[10px] text-white/70 tabular-nums tracking-wider">
          <span className="text-accent/80">ALT</span>{" "}
          {altitude > 1000
            ? `${(altitude / 1000).toFixed(1)}km`
            : `${altitude}m`}
        </div>
      </div>

      {/* Top-right — time + system status */}
      <div className="absolute top-3 right-3 text-right space-y-1">
        <div className="text-[10px] text-white/70 tabular-nums tracking-widest">
          {time} <span className="text-white/40">UTC</span>
        </div>
        <div className="text-[10px] text-accent/60 tracking-wider">
          Z{zoom.toFixed(1)}
        </div>
        {entityCount > 0 && (
          <div className="text-[10px] text-accent/80 tracking-wider">
            {entityCount} TGT
          </div>
        )}
        <div className="text-[9px] text-white/30 tracking-wider uppercase">
          {mode}
        </div>
      </div>

      {/* Centre crosshair — thin, subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-px h-5 bg-white/10 absolute left-1/2 -top-6 -translate-x-1/2" />
        <div className="w-px h-5 bg-white/10 absolute left-1/2 top-1 -translate-x-1/2" />
        <div className="h-px w-5 bg-white/10 absolute top-1/2 -left-6 -translate-y-1/2" />
        <div className="h-px w-5 bg-white/10 absolute top-1/2 left-1 -translate-y-1/2" />
      </div>

      {/* Bottom compass strip */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex items-end gap-0 overflow-hidden w-48 justify-center">
          {Array.from({ length: 9 }, (_, i) => {
            const deg = Math.round(bearing - 40 + i * 10);
            const normalised = ((deg % 360) + 360) % 360;
            const isCardinal =
              normalised === 0 ||
              normalised === 90 ||
              normalised === 180 ||
              normalised === 270;
            const label =
              normalised === 0
                ? "N"
                : normalised === 90
                  ? "E"
                  : normalised === 180
                    ? "S"
                    : normalised === 270
                      ? "W"
                      : null;

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ width: "24px" }}
              >
                <div
                  className={`w-px ${isCardinal ? "h-3 bg-accent/50" : "h-2 bg-white/15"}`}
                />
                {label ? (
                  <span className="text-[8px] text-accent/70 mt-0.5">
                    {label}
                  </span>
                ) : (
                  <span className="text-[7px] text-white/20 mt-0.5">
                    {normalised}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom-left — patent watermark */}
      <div className="absolute bottom-3 left-3">
        <div className="text-[8px] text-white/20 tracking-widest">
          US 10,951,814 B2 — IoT-SATELLITE FUSION
        </div>
      </div>

      {/* Animated scan line (subtle) */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/[0.06] to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
