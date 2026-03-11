"use client";

import { useState, useEffect, useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Maximize2, Radio, Shield } from "lucide-react";

interface CCTVCamera {
  id: string;
  name: string;
  lng: number;
  lat: number;
  source: string;
  type: "traffic" | "security" | "harbour" | "perimeter";
  bearing: number; // direction camera faces
  fov: number; // field of view degrees
}

// Curated CCTV cameras per scenario — positioned at real building coordinates
const DEMO_CAMERAS: Record<string, CCTVCamera[]> = {
  "deep-blue": [
    {
      id: "cam-harbour-n",
      name: "HARBOUR NORTH — Pier 3",
      lng: -2.0725,
      lat: 57.1435,
      source: "Port Authority CCTV",
      type: "harbour",
      bearing: 45,
      fov: 120,
    },
    {
      id: "cam-harbour-s",
      name: "HARBOUR SOUTH — Breakwater",
      lng: -2.0695,
      lat: 57.1405,
      source: "Port Authority CCTV",
      type: "harbour",
      bearing: 180,
      fov: 90,
    },
    {
      id: "cam-dock-east",
      name: "EAST DOCK — Vessel Bay",
      lng: -2.0650,
      lat: 57.1420,
      source: "Coastguard CCTV",
      type: "security",
      bearing: 270,
      fov: 110,
    },
    {
      id: "cam-bridge-don",
      name: "A90 — Bridge of Don",
      lng: -2.0940,
      lat: 57.1720,
      source: "Traffic Scotland",
      type: "traffic",
      bearing: 0,
      fov: 90,
    },
  ],
  "black-gold": [
    {
      id: "cam-pipe-s1",
      name: "PIPELINE CAM — Sector S1",
      lng: -1.82,
      lat: 57.51,
      source: "Pipeline SCADA",
      type: "security",
      bearing: 90,
      fov: 80,
    },
    {
      id: "cam-pipe-s3",
      name: "PIPELINE CAM — Sector S3",
      lng: -1.78,
      lat: 57.49,
      source: "Pipeline SCADA",
      type: "security",
      bearing: 180,
      fov: 80,
    },
  ],
  "iron-curtain": [
    {
      id: "cam-gate-alpha",
      name: "MAIN GATE — CAM ALPHA",
      lng: 44.302,
      lat: 33.302,
      source: "Perimeter Defence",
      type: "perimeter",
      bearing: 0,
      fov: 120,
    },
    {
      id: "cam-north-bravo",
      name: "NORTH PERIMETER — CAM BRAVO",
      lng: 44.298,
      lat: 33.305,
      source: "Perimeter Defence",
      type: "perimeter",
      bearing: 315,
      fov: 90,
    },
    {
      id: "cam-compound",
      name: "INNER COMPOUND — CAM CHARLIE",
      lng: 44.300,
      lat: 33.300,
      source: "Base Security",
      type: "security",
      bearing: 180,
      fov: 110,
    },
    {
      id: "cam-motor",
      name: "MOTOR POOL — CAM DELTA",
      lng: 44.304,
      lat: 33.298,
      source: "Base Security",
      type: "security",
      bearing: 90,
      fov: 90,
    },
  ],
  "first-light": [
    {
      id: "cam-fl-main",
      name: "MAIN ROAD — CAM 01",
      lng: 37.201,
      lat: 37.001,
      source: "Municipal CCTV",
      type: "traffic",
      bearing: 0,
      fov: 120,
    },
    {
      id: "cam-fl-square",
      name: "CENTRAL SQUARE — CAM 02",
      lng: 37.199,
      lat: 36.999,
      source: "Municipal CCTV",
      type: "security",
      bearing: 90,
      fov: 90,
    },
  ],
};

/**
 * Simulated CCTV feed — generates a dynamic "camera view" with
 * scan lines, noise, timestamp, and status overlays
 */
function CCTVFeedDisplay({
  camera,
  large = false,
}: {
  camera: CCTVCamera;
  large?: boolean;
}) {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrameCount((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const ts = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      className={`relative bg-black overflow-hidden ${large ? "aspect-video" : "w-[200px] h-[120px]"}`}
    >
      {/* Simulated scene — dark with grid elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0a] via-[#0d120d] to-[#060806]">
        {/* Ground plane grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,200,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,100,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            transform: `perspective(200px) rotateX(60deg) translateY(30%)`,
          }}
        />
        {/* Simulated building outline */}
        <div className="absolute bottom-[30%] left-[20%] w-[25%] h-[40%] border border-green-500/20 bg-green-900/10" />
        <div className="absolute bottom-[30%] right-[15%] w-[20%] h-[55%] border border-green-500/15 bg-green-900/8" />
        {/* Simulated movement (IR blobs) */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-green-400/40 blur-sm"
          animate={{
            left: ["30%", "60%", "45%", "30%"],
            top: ["50%", "55%", "65%", "50%"],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-green-300/30 blur-sm"
          animate={{
            left: ["65%", "40%", "55%", "65%"],
            top: ["60%", "45%", "55%", "60%"],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 3px)",
        }}
      />

      {/* Moving scan beam */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: frameCount * 0.01,
        }}
      />

      {/* REC indicator */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-[7px] text-red-400/80">REC</span>
      </div>

      {/* Camera ID */}
      <div className="absolute top-1.5 right-1.5">
        <span className="font-mono text-[7px] text-green-400/60">
          {camera.id.toUpperCase()}
        </span>
      </div>

      {/* Timestamp */}
      <div className="absolute bottom-1.5 left-1.5">
        <span className="font-mono text-[8px] text-green-300/70 tabular-nums">
          {ts} UTC
        </span>
      </div>

      {/* Source label */}
      <div className="absolute bottom-1.5 right-1.5">
        <span className="font-mono text-[7px] text-green-400/40">
          {camera.source}
        </span>
      </div>

      {/* IoT-FUSED badge */}
      <div className="absolute bottom-5 left-1.5">
        <span className="font-mono text-[6px] text-accent/40">
          IoT-FUSED — {camera.bearing}° FOV:{camera.fov}°
        </span>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-px h-3 bg-green-400/15 absolute left-1/2 -top-3 -translate-x-1/2" />
        <div className="w-px h-3 bg-green-400/15 absolute left-1/2 top-0.5 -translate-x-1/2" />
        <div className="h-px w-3 bg-green-400/15 absolute top-1/2 -left-3 -translate-y-1/2" />
        <div className="h-px w-3 bg-green-400/15 absolute top-1/2 left-0.5 -translate-y-1/2" />
      </div>
    </div>
  );
}

/**
 * 3D-projected CCTV overlay — renders camera feeds as Mapbox Markers
 * positioned at building GPS coordinates. Each camera shows a floating
 * screen panel that moves with the 3D map view.
 *
 * This is the "CCTV projected onto 3D building geometry" feature.
 */
export function CCTVProjectionOverlay({
  scenario,
  enabled = true,
}: {
  scenario?: string;
  enabled?: boolean;
}) {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera | null>(null);

  useEffect(() => {
    if (!enabled || !scenario) return;
    setCameras(DEMO_CAMERAS[scenario] || []);
  }, [scenario, enabled]);

  if (!enabled || cameras.length === 0) return null;

  return (
    <>
      {/* 3D positioned camera feed markers */}
      {cameras.map((camera) => (
        <Marker
          key={camera.id}
          longitude={camera.lng}
          latitude={camera.lat}
          anchor="bottom"
        >
          <div className="group relative">
            {/* Vertical connection line — "pole" from ground to screen */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-t from-accent/60 to-accent/20" />

            {/* Ground marker — pulse dot at building base */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-accent/60 animate-ping absolute -inset-0.5" />
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>

            {/* Camera feed screen — floating above the building */}
            <div
              className="relative -top-8 cursor-pointer"
              onClick={() =>
                setSelectedCamera(
                  selectedCamera?.id === camera.id ? null : camera
                )
              }
            >
              {/* Screen frame */}
              <div className="rounded border border-accent/40 overflow-hidden shadow-lg shadow-accent/10 bg-black">
                {expandedCamera === camera.id ? (
                  <div className="w-[280px]">
                    <CCTVFeedDisplay camera={camera} large />
                  </div>
                ) : (
                  <CCTVFeedDisplay camera={camera} />
                )}

                {/* Screen label bar */}
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-surface/90 border-t border-accent/20">
                  <Camera className="w-2.5 h-2.5 text-accent" />
                  <span className="font-mono text-[7px] text-accent/80 truncate flex-1">
                    {camera.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCamera(
                        expandedCamera === camera.id ? null : camera.id
                      );
                    }}
                    className="p-0.5 hover:bg-accent/10 rounded"
                  >
                    <Maximize2 className="w-2.5 h-2.5 text-accent/50" />
                  </button>
                </div>
              </div>

              {/* FOV cone indicator — shows camera coverage area */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderTop: "20px solid rgba(0,229,160,0.08)",
                  transform: `rotate(${camera.bearing}deg)`,
                }}
              />
            </div>
          </div>
        </Marker>
      ))}

      {/* Camera count badge */}
      <div className="absolute top-3 right-48 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/30 flex items-center gap-2 z-30 pointer-events-none">
        <Camera className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[10px] text-accent">
          {cameras.length} CCTV FEEDS
        </span>
        <Radio className="w-3 h-3 text-accent/50 animate-pulse" />
      </div>

      {/* Selected camera detail panel */}
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-14 right-3 w-72 rounded-lg bg-background/95 backdrop-blur-md border border-accent/30 shadow-2xl z-40 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Camera className="w-3.5 h-3.5 text-accent" />
              <span className="font-mono text-[10px] text-foreground flex-1">
                {selectedCamera.name}
              </span>
              <button
                onClick={() => setSelectedCamera(null)}
                className="p-1 rounded hover:bg-elevated"
              >
                <X className="w-3 h-3 text-text-dim" />
              </button>
            </div>
            <CCTVFeedDisplay camera={selectedCamera} large />
            <div className="px-3 py-2 border-t border-border bg-surface/60 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px]">
              <div>
                <span className="text-accent/80">LAT</span>{" "}
                <span className="text-text-dim">
                  {selectedCamera.lat.toFixed(4)}°
                </span>
              </div>
              <div>
                <span className="text-accent/80">LNG</span>{" "}
                <span className="text-text-dim">
                  {selectedCamera.lng.toFixed(4)}°
                </span>
              </div>
              <div>
                <span className="text-accent/80">BRG</span>{" "}
                <span className="text-text-dim">
                  {selectedCamera.bearing}°
                </span>
              </div>
              <div>
                <span className="text-accent/80">FOV</span>{" "}
                <span className="text-text-dim">{selectedCamera.fov}°</span>
              </div>
              <div className="col-span-2 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-accent/50" />
                <span className="text-accent/50">
                  IoT-FUSED CCTV — US 10,951,814 B2
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for backwards compat (old overlay component name)
export { CCTVProjectionOverlay as CCTVOverlay };
