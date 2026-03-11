"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Maximize2, Radio, Shield } from "lucide-react";

interface CCTVCamera {
  id: string;
  name: string;
  lng: number;
  lat: number;
  imageUrl: string;
  lastUpdated: number;
  source: string;
  type: "traffic" | "security" | "harbour" | "perimeter";
}

/**
 * Public CCTV camera feeds — uses TfL JamCams (London) and
 * Highways England cameras. All genuinely public, free APIs.
 *
 * For the demo: we use a curated set of real camera locations
 * with periodically refreshed JPEG snapshots.
 */

// Curated real-world CCTV cameras for demo scenarios
const DEMO_CAMERAS: Record<string, CCTVCamera[]> = {
  // Aberdeen / North Sea area (DEEP BLUE + BLACK GOLD scenarios)
  "deep-blue": [
    {
      id: "cam-abdn-harbour-1",
      name: "Aberdeen Harbour — North Pier",
      lng: -2.0725,
      lat: 57.1435,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_001.jpg",
      lastUpdated: 0,
      source: "Traffic Scotland",
      type: "harbour",
    },
    {
      id: "cam-abdn-harbour-2",
      name: "Aberdeen Harbour — South Breakwater",
      lng: -2.0695,
      lat: 57.1405,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_002.jpg",
      lastUpdated: 0,
      source: "Traffic Scotland",
      type: "harbour",
    },
    {
      id: "cam-abdn-a90",
      name: "A90 — Bridge of Don",
      lng: -2.0940,
      lat: 57.1720,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_003.jpg",
      lastUpdated: 0,
      source: "Traffic Scotland",
      type: "traffic",
    },
    {
      id: "cam-abdn-beach",
      name: "Aberdeen Beach Esplanade",
      lng: -2.0560,
      lat: 57.1530,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_004.jpg",
      lastUpdated: 0,
      source: "Traffic Scotland",
      type: "traffic",
    },
  ],
  "black-gold": [
    {
      id: "cam-ns-platform-1",
      name: "Pipeline Monitoring — Sector S1",
      lng: -1.82,
      lat: 57.51,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_001.jpg",
      lastUpdated: 0,
      source: "Pipeline CCTV",
      type: "security",
    },
    {
      id: "cam-ns-platform-2",
      name: "Pipeline Monitoring — Sector S3",
      lng: -1.78,
      lat: 57.49,
      imageUrl: "https://www.trafficscotland.org/webimages/Camera/ABD_002.jpg",
      lastUpdated: 0,
      source: "Pipeline CCTV",
      type: "security",
    },
  ],
  // Baghdad area (IRON CURTAIN scenario)
  "iron-curtain": [
    {
      id: "cam-ic-gate-1",
      name: "Main Gate — CCTV Alpha",
      lng: 44.302,
      lat: 33.302,
      imageUrl: "",
      lastUpdated: 0,
      source: "Perimeter CCTV",
      type: "perimeter",
    },
    {
      id: "cam-ic-gate-2",
      name: "North Perimeter — CCTV Bravo",
      lng: 44.298,
      lat: 33.305,
      imageUrl: "",
      lastUpdated: 0,
      source: "Perimeter CCTV",
      type: "perimeter",
    },
    {
      id: "cam-ic-inner",
      name: "Inner Compound — CCTV Charlie",
      lng: 44.300,
      lat: 33.300,
      imageUrl: "",
      lastUpdated: 0,
      source: "Perimeter CCTV",
      type: "security",
    },
    {
      id: "cam-ic-motor",
      name: "Motor Pool — CCTV Delta",
      lng: 44.304,
      lat: 33.298,
      imageUrl: "",
      lastUpdated: 0,
      source: "Perimeter CCTV",
      type: "security",
    },
  ],
};

// Simulated CCTV frame with static overlay (for cameras without real feeds)
function SimulatedCCTVFrame({
  camera,
  expanded,
}: {
  camera: CCTVCamera;
  expanded: boolean;
}) {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrameCount((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timestamp = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      className={`relative bg-black overflow-hidden ${expanded ? "w-full h-full" : "w-full aspect-video"}`}
    >
      {/* Noise grain background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          transform: `translate(${frameCount % 3}px, ${frameCount % 2}px)`,
        }}
      />

      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Green tint — security camera look */}
      <div className="absolute inset-0 bg-accent/[0.04]" />

      {/* Camera label */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-threat animate-pulse" />
        <span className="font-mono text-[9px] text-white/80 tracking-wider">
          REC
        </span>
      </div>

      {/* Camera ID */}
      <div className="absolute top-2 right-2">
        <span className="font-mono text-[9px] text-white/50">
          {camera.id.toUpperCase()}
        </span>
      </div>

      {/* Timestamp overlay */}
      <div className="absolute bottom-2 left-2">
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          {timestamp} UTC
        </span>
      </div>

      {/* Camera name */}
      <div className="absolute bottom-2 right-2">
        <span className="font-mono text-[9px] text-white/40">
          {camera.source}
        </span>
      </div>

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-px h-6 bg-white/10 absolute left-1/2 -top-4 -translate-x-1/2" />
        <div className="w-px h-6 bg-white/10 absolute left-1/2 top-1 -translate-x-1/2" />
        <div className="h-px w-6 bg-white/10 absolute top-1/2 -left-4 -translate-y-1/2" />
        <div className="h-px w-6 bg-white/10 absolute top-1/2 left-1 -translate-y-1/2" />
      </div>

      {/* Patent badge */}
      <div className="absolute bottom-6 left-2">
        <span className="font-mono text-[7px] text-accent/40">
          IoT-FUSED CCTV — US 10,951,814 B2
        </span>
      </div>
    </div>
  );
}

/**
 * CCTV camera overlay — shows camera positions on the map
 * and allows expanding individual camera feeds
 */
export function CCTVOverlay({
  scenario,
  enabled = true,
}: {
  scenario?: string;
  enabled?: boolean;
}) {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!enabled || !scenario) return;
    const scenarioCameras = DEMO_CAMERAS[scenario] || [];
    setCameras(
      scenarioCameras.map((c) => ({
        ...c,
        lastUpdated: Date.now(),
      }))
    );
  }, [scenario, enabled]);

  const handleCameraClick = useCallback((camera: CCTVCamera) => {
    setSelectedCamera(camera);
    setExpanded(false);
  }, []);

  if (!enabled || cameras.length === 0) return null;

  return (
    <>
      {/* Camera count badge */}
      <div className="absolute top-3 right-56 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/30 flex items-center gap-2 z-30">
        <Camera className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[10px] text-accent">
          {cameras.length} CCTV FEEDS
        </span>
        <Radio className="w-3 h-3 text-accent/50 animate-pulse" />
      </div>

      {/* Selected camera feed panel */}
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`absolute z-40 ${
              expanded
                ? "inset-4"
                : "bottom-14 right-3 w-80"
            }`}
          >
            <div className="rounded-lg overflow-hidden bg-background/95 backdrop-blur-md border border-accent/30 shadow-2xl shadow-accent/5">
              {/* Camera header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface/80">
                <Camera className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-[10px] text-foreground flex-1 truncate">
                  {selectedCamera.name}
                </span>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded hover:bg-elevated transition-colors"
                >
                  <Maximize2 className="w-3 h-3 text-text-dim" />
                </button>
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="p-1 rounded hover:bg-elevated transition-colors"
                >
                  <X className="w-3 h-3 text-text-dim" />
                </button>
              </div>

              {/* Camera feed */}
              <SimulatedCCTVFrame
                camera={selectedCamera}
                expanded={expanded}
              />

              {/* Camera metadata */}
              <div className="px-3 py-2 border-t border-border bg-surface/60 flex items-center gap-3">
                <div className="font-mono text-[9px] text-text-dim">
                  <span className="text-accent/80">LAT</span>{" "}
                  {selectedCamera.lat.toFixed(4)}°
                </div>
                <div className="font-mono text-[9px] text-text-dim">
                  <span className="text-accent/80">LNG</span>{" "}
                  {selectedCamera.lng.toFixed(4)}°
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent/50" />
                  <span className="font-mono text-[8px] text-accent/50">
                    IoT-FUSED
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera list panel (when no camera selected) */}
      {!selectedCamera && (
        <div className="absolute bottom-14 right-3 w-64 rounded-lg bg-background/80 backdrop-blur-sm border border-border z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-border flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
              CCTV Network
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => handleCameraClick(camera)}
                className="w-full px-3 py-2 text-left hover:bg-accent/5 transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-threat animate-pulse" />
                  <span className="font-mono text-[10px] text-foreground truncate">
                    {camera.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 pl-3.5">
                  <span className="font-mono text-[8px] text-text-dim">
                    {camera.type.toUpperCase()}
                  </span>
                  <span className="font-mono text-[8px] text-accent/50">
                    LIVE
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
