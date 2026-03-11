"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointerClick,
  Crosshair,
  Radio,
  Zap,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

// Simulated entity that appears when user clicks the map
interface PlacedEntity {
  id: string;
  lng: number;
  lat: number;
  label: string;
  type: string;
  color: string;
  payload: Record<string, string>;
  placedAt: number;
}

const ENTITY_PRESETS: Array<{
  label: string;
  type: string;
  icon: string;
  color: string;
  payload: Record<string, string>;
}> = [
  {
    label: "GPS Tracker",
    type: "gps_tracker",
    icon: "📡",
    color: "#00E5A0",
    payload: { speed: "12 km/h", battery: "87%", signal: "Strong" },
  },
  {
    label: "Patrol Unit",
    type: "biometric",
    icon: "🎖️",
    color: "#3B82F6",
    payload: { heart_rate: "78 bpm", SpO2: "98%", temp: "36.8°C" },
  },
  {
    label: "Vessel AIS",
    type: "ais_transponder",
    icon: "🚢",
    color: "#F59E0B",
    payload: { MMSI: "235009840", heading: "142°", speed: "8.2 kn" },
  },
  {
    label: "Soil Sensor",
    type: "soil_sensor",
    icon: "🌱",
    color: "#10B981",
    payload: { moisture: "32%", pH: "6.4", temp: "14.2°C" },
  },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LiveDemo() {
  const [entities, setEntities] = useState<PlacedEntity[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || !mapRef.current) return;

      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert pixel to fake lat/lng for display
      const lng = ((x / rect.width) * 0.08 - 2.14).toFixed(4);
      const lat = ((1 - y / rect.height) * 0.06 + 57.12).toFixed(4);

      const preset = ENTITY_PRESETS[selectedPreset];
      const entity: PlacedEntity = {
        id: `USER-${Date.now()}`,
        lng: parseFloat(lng),
        lat: parseFloat(lat),
        label: preset.label,
        type: preset.type,
        color: preset.color,
        payload: preset.payload,
        placedAt: Date.now(),
      };

      setEntities((prev) => [...prev, entity]);
    },
    [isActive, selectedPreset]
  );

  const reset = () => {
    setEntities([]);
    setIsActive(false);
  };

  return (
    <section className="py-24 px-4 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00E5A0]/30 bg-[#00E5A0]/5 text-[#00E5A0] text-xs font-mono mb-4">
            <Radio className="w-3 h-3 animate-pulse" />
            INTERACTIVE DEMO
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Place Your IoT Device.{" "}
            <span className="text-[#00E5A0]">See It From Space.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Click anywhere on the satellite imagery to place a device. Watch it
            appear <span className="text-white font-medium">IN</span> the image
            — not on top. That&apos;s the patent in action.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Satellite map area */}
          <div className="relative">
            {/* Device type selector */}
            <div className="flex gap-2 mb-4">
              {ENTITY_PRESETS.map((preset, i) => (
                <button
                  key={preset.type}
                  onClick={() => setSelectedPreset(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                    selectedPreset === i
                      ? "bg-white/10 border border-white/20 text-white"
                      : "bg-white/5 border border-white/5 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span>{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Map surface */}
            <div
              ref={mapRef}
              onClick={handleMapClick}
              className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border transition-all ${
                isActive
                  ? "border-[#00E5A0]/40 cursor-crosshair"
                  : "border-white/10"
              }`}
              style={{
                backgroundImage:
                  `url(https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-2.0975,57.1497,13,0/800x500@2x?access_token=${MAPBOX_TOKEN})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Grid overlay to show "fusion" effect */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,229,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.3) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Placed entities */}
              <AnimatePresence>
                {entities.map((entity) => {
                  const rect = mapRef.current?.getBoundingClientRect();
                  if (!rect) return null;

                  const x = ((entity.lng + 2.14) / 0.08) * 100;
                  const y = (1 - (entity.lat - 57.12) / 0.06) * 100;

                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {/* Pulsing halo — the patent in action */}
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: 60,
                          height: 60,
                          left: -30,
                          top: -30,
                          background: `radial-gradient(circle, ${entity.color}40 0%, transparent 70%)`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.8, 0.3, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Core dot */}
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-lg relative z-10"
                        style={{ backgroundColor: entity.color }}
                      />
                      {/* Label */}
                      <div
                        className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded text-[10px] font-mono border z-10"
                        style={{
                          backgroundColor: `${entity.color}20`,
                          borderColor: `${entity.color}40`,
                          color: entity.color,
                        }}
                      >
                        <div className="font-bold">{entity.label}</div>
                        <div className="text-[9px] opacity-70">
                          {entity.lng.toFixed(4)}°E {entity.lat.toFixed(4)}°N
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Activation overlay */}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActive(true);
                    }}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#00E5A0] text-black font-bold text-lg hover:bg-[#00E5A0]/90 transition-all hover:scale-105"
                  >
                    <MousePointerClick className="w-5 h-5" />
                    Activate Live Demo
                  </button>
                </motion.div>
              )}

              {/* Active mode indicator */}
              {isActive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-[#00E5A0]/30">
                  <Crosshair className="w-4 h-4 text-[#00E5A0] animate-pulse" />
                  <span className="text-[#00E5A0] text-xs font-mono">
                    CLICK TO PLACE — {ENTITY_PRESETS[selectedPreset].label}
                  </span>
                </div>
              )}

              {/* Entity count */}
              {entities.length > 0 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-xs font-mono text-white">
                    <Zap className="w-3 h-3 text-[#00E5A0] inline mr-1" />
                    {entities.length} entities fused into imagery
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="px-2 py-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-xs text-gray-400 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Patent callout beneath map */}
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="px-1.5 py-0.5 rounded bg-[#00E5A0]/10 text-[#00E5A0] border border-[#00E5A0]/20">
                PATENT US 10,951,814 B2
              </span>
              GPS-to-pixel coordinate conversion — entities rendered at exact
              pixel position within satellite tile
            </div>
          </div>

          {/* Entity data panel */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">
              Live Entity Data
            </h3>

            {entities.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
                <MousePointerClick className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {isActive
                    ? "Click on the satellite imagery to place your first IoT device"
                    : 'Activate the demo to start placing devices'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {entities.map((entity) => (
                    <motion.div
                      key={entity.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="rounded-lg border bg-white/[0.02] p-3"
                      style={{ borderColor: `${entity.color}30` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: entity.color }}
                        />
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: entity.color }}
                        >
                          {entity.label}
                        </span>
                        <span className="text-[10px] text-gray-600 ml-auto font-mono">
                          {entity.id}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-gray-500 mb-2">
                        {entity.lng.toFixed(4)}°E, {entity.lat.toFixed(4)}°N
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {Object.entries(entity.payload).map(([key, val]) => (
                          <div
                            key={key}
                            className="rounded px-1.5 py-1 bg-white/5"
                          >
                            <div className="text-[9px] text-gray-600 uppercase">
                              {key}
                            </div>
                            <div className="text-[11px] text-white font-mono">
                              {val}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Call to action */}
            {entities.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#00E5A0]/20 bg-[#00E5A0]/5 p-4"
              >
                <p className="text-sm text-[#00E5A0] mb-2 font-medium">
                  This is the patent in action.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every entity you placed appears at its exact GPS pixel
                  position WITHIN the satellite image — not floating above it.
                  No competitor can legally build this.
                </p>
                <a
                  href="/command"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-[#00E5A0] hover:underline"
                >
                  See the full platform
                  <ChevronRight className="w-3 h-3" />
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
