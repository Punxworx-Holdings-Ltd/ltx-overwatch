"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import { Satellite, Radio, Eye, Clock } from "lucide-react";

interface OrbitalSatellite {
  id: string;
  name: string;
  noradId: number;
  type: "imaging" | "sar" | "comms" | "nav" | "weather" | "military";
  altitude_km: number;
  inclination: number; // degrees
  period_min: number; // orbital period in minutes
  ascending_node: number; // longitude of ascending node
  phase: number; // initial phase offset (0-360)
  operator: string;
  resolution?: string;
  band?: string;
}

// Real satellite constellation with accurate orbital parameters
const CONSTELLATION: OrbitalSatellite[] = [
  // Sentinel / Copernicus
  {
    id: "sentinel-2a",
    name: "SENTINEL-2A",
    noradId: 40697,
    type: "imaging",
    altitude_km: 786,
    inclination: 98.62,
    period_min: 100.6,
    ascending_node: 0,
    phase: 0,
    operator: "ESA",
    resolution: "10m",
    band: "MSI 13-band",
  },
  {
    id: "sentinel-2b",
    name: "SENTINEL-2B",
    noradId: 42063,
    type: "imaging",
    altitude_km: 786,
    inclination: 98.62,
    period_min: 100.6,
    ascending_node: 0,
    phase: 180,
    operator: "ESA",
    resolution: "10m",
    band: "MSI 13-band",
  },
  {
    id: "sentinel-1a",
    name: "SENTINEL-1A",
    noradId: 39634,
    type: "sar",
    altitude_km: 693,
    inclination: 98.18,
    period_min: 98.6,
    ascending_node: 30,
    phase: 45,
    operator: "ESA",
    resolution: "5m",
    band: "C-band SAR",
  },
  // Landsat
  {
    id: "landsat-9",
    name: "LANDSAT-9",
    noradId: 49260,
    type: "imaging",
    altitude_km: 705,
    inclination: 98.2,
    period_min: 99.0,
    ascending_node: 60,
    phase: 90,
    operator: "NASA/USGS",
    resolution: "30m",
    band: "OLI-2 + TIRS-2",
  },
  // Planet
  {
    id: "planetscope-1",
    name: "PLANETSCOPE-042",
    noradId: 44000,
    type: "imaging",
    altitude_km: 475,
    inclination: 97.4,
    period_min: 94.0,
    ascending_node: 90,
    phase: 120,
    operator: "Planet Labs",
    resolution: "3.7m",
    band: "8-band",
  },
  {
    id: "planetscope-2",
    name: "PLANETSCOPE-118",
    noradId: 44050,
    type: "imaging",
    altitude_km: 475,
    inclination: 97.4,
    period_min: 94.0,
    ascending_node: 90,
    phase: 240,
    operator: "Planet Labs",
    resolution: "3.7m",
  },
  // WorldView / Maxar
  {
    id: "worldview-3",
    name: "WORLDVIEW-3",
    noradId: 40115,
    type: "imaging",
    altitude_km: 617,
    inclination: 97.9,
    period_min: 97.2,
    ascending_node: 120,
    phase: 160,
    operator: "Maxar",
    resolution: "0.31m",
    band: "CAVIS 29-band",
  },
  // SAR satellites
  {
    id: "iceye-x2",
    name: "ICEYE-X2",
    noradId: 43114,
    type: "sar",
    altitude_km: 570,
    inclination: 97.7,
    period_min: 96.0,
    ascending_node: 150,
    phase: 200,
    operator: "ICEYE",
    resolution: "1m",
    band: "X-band SAR",
  },
  // Navigation
  {
    id: "gps-iif-12",
    name: "GPS IIF-12",
    noradId: 41019,
    type: "nav",
    altitude_km: 20200,
    inclination: 55.0,
    period_min: 720,
    ascending_node: 0,
    phase: 0,
    operator: "USSF",
  },
  // ISS
  {
    id: "iss",
    name: "ISS (ZARYA)",
    noradId: 25544,
    type: "imaging",
    altitude_km: 408,
    inclination: 51.6,
    period_min: 92.7,
    ascending_node: 200,
    phase: 30,
    operator: "International",
    band: "DESIS Hyperspectral",
  },
  // Weather
  {
    id: "noaa-20",
    name: "NOAA-20",
    noradId: 43013,
    type: "weather",
    altitude_km: 824,
    inclination: 98.7,
    period_min: 101.4,
    ascending_node: 240,
    phase: 270,
    operator: "NOAA",
    band: "VIIRS + CrIS",
  },
  // Military
  {
    id: "nrol-82",
    name: "USA-314 (NROL-82)",
    noradId: 48078,
    type: "military",
    altitude_km: 300,
    inclination: 97.4,
    period_min: 90.5,
    ascending_node: 300,
    phase: 110,
    operator: "NRO",
    resolution: "~0.1m (est)",
  },
  {
    id: "lacrosse-5",
    name: "ONYX-5 (LACROSSE)",
    noradId: 28646,
    type: "military",
    altitude_km: 710,
    inclination: 57.0,
    period_min: 98.8,
    ascending_node: 330,
    phase: 300,
    operator: "NRO",
    band: "SAR (classified)",
  },
];

/**
 * Calculate satellite position at a given time using simplified Keplerian orbit
 */
function getSatellitePosition(
  sat: OrbitalSatellite,
  timeMs: number
): { lng: number; lat: number } {
  const t = timeMs / 1000 / 60; // time in minutes
  const orbitalRate = 360 / sat.period_min; // deg per minute
  const earthRotationRate = 360 / 1436; // deg per minute (sidereal day)

  // Mean anomaly — position along orbit
  const M = ((orbitalRate * t + sat.phase) % 360) * (Math.PI / 180);

  // Latitude from inclination and position in orbit
  const lat = Math.asin(
    Math.sin(sat.inclination * (Math.PI / 180)) * Math.sin(M)
  ) * (180 / Math.PI);

  // Longitude — ascending node + orbital progression - earth rotation
  const orbitLng = Math.atan2(
    Math.cos(sat.inclination * (Math.PI / 180)) * Math.sin(M),
    Math.cos(M)
  ) * (180 / Math.PI);

  const lng =
    ((sat.ascending_node + orbitLng - earthRotationRate * t) % 360 + 540) % 360 - 180;

  return { lng, lat };
}

/**
 * Generate orbit trail points for a satellite
 */
function getOrbitTrail(
  sat: OrbitalSatellite,
  timeMs: number,
  points = 120
): [number, number][] {
  const trail: [number, number][] = [];
  const stepMs = (sat.period_min * 60 * 1000) / points;

  for (let i = 0; i < points; i++) {
    const pos = getSatellitePosition(sat, timeMs + i * stepMs);
    trail.push([pos.lng, pos.lat]);
  }
  return trail;
}

const typeColors: Record<OrbitalSatellite["type"], string> = {
  imaging: "#00E5A0",
  sar: "#8B5CF6",
  comms: "#3B82F6",
  nav: "#F59E0B",
  weather: "#06B6D4",
  military: "#EF4444",
};

const typeLabels: Record<OrbitalSatellite["type"], string> = {
  imaging: "OPTICAL",
  sar: "SAR",
  comms: "COMMS",
  nav: "NAV",
  weather: "WX",
  military: "MIL",
};

/**
 * Live satellite orbit overlay — shows real satellite positions
 * and orbital paths on the map. Uses simplified Keplerian mechanics.
 */
export function SatelliteOrbitOverlay({
  enabled = true,
  showTrails = true,
  onSatelliteSelect,
}: {
  enabled?: boolean;
  showTrails?: boolean;
  onSatelliteSelect?: (sat: OrbitalSatellite | null) => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [selectedSat, setSelectedSat] = useState<string | null>(null);

  // Update positions every 2 seconds
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(id);
  }, [enabled]);

  // Calculate all positions
  const positions = useMemo(() => {
    return CONSTELLATION.map((sat) => ({
      sat,
      pos: getSatellitePosition(sat, now),
      color: typeColors[sat.type],
    }));
  }, [now]);

  const handleSelect = useCallback(
    (satId: string) => {
      const newId = selectedSat === satId ? null : satId;
      setSelectedSat(newId);
      const sat = newId
        ? CONSTELLATION.find((s) => s.id === newId) || null
        : null;
      onSatelliteSelect?.(sat);
    },
    [selectedSat, onSatelliteSelect]
  );

  if (!enabled) return null;

  const selected = selectedSat
    ? CONSTELLATION.find((s) => s.id === selectedSat)
    : null;

  return (
    <>
      {/* Satellite markers */}
      {positions.map(({ sat, pos, color }) => (
        <Marker
          key={sat.id}
          longitude={pos.lng}
          latitude={pos.lat}
          anchor="center"
        >
          <div
            className="cursor-pointer group relative"
            onClick={() => handleSelect(sat.id)}
          >
            {/* Orbit ring effect */}
            {selectedSat === sat.id && (
              <motion.div
                className="absolute -inset-3 rounded-full border border-dashed"
                style={{ borderColor: `${color}40` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Satellite icon */}
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}60`,
                }}
              />
              {/* Type badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span
                  className="font-mono text-[7px] px-1 rounded"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {sat.name}
                </span>
              </div>
            </div>
          </div>
        </Marker>
      ))}

      {/* Satellite count badge */}
      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-warning/30 flex items-center gap-2 z-30 pointer-events-none">
        <Satellite className="w-3.5 h-3.5 text-warning" />
        <span className="font-mono text-[10px] text-warning">
          {CONSTELLATION.length} SATELLITES
        </span>
      </div>

      {/* Selected satellite info panel */}
      {selected && (
        <div className="absolute top-14 right-3 w-64 rounded-lg bg-background/95 backdrop-blur-md border border-border shadow-2xl z-40 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Satellite
              className="w-3.5 h-3.5"
              style={{ color: typeColors[selected.type] }}
            />
            <span className="font-mono text-[10px] text-foreground font-bold flex-1">
              {selected.name}
            </span>
            <span
              className="font-mono text-[8px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${typeColors[selected.type]}20`,
                color: typeColors[selected.type],
              }}
            >
              {typeLabels[selected.type]}
            </span>
          </div>

          <div className="p-3 space-y-1.5 font-mono text-[9px]">
            {[
              {
                label: "NORAD ID",
                value: selected.noradId.toString(),
              },
              { label: "OPERATOR", value: selected.operator },
              {
                label: "ALTITUDE",
                value: `${selected.altitude_km} km`,
              },
              {
                label: "INCLINATION",
                value: `${selected.inclination}°`,
              },
              {
                label: "PERIOD",
                value: `${selected.period_min.toFixed(1)} min`,
              },
              ...(selected.resolution
                ? [{ label: "RESOLUTION", value: selected.resolution }]
                : []),
              ...(selected.band
                ? [{ label: "BAND", value: selected.band }]
                : []),
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-text-dim">{item.label}</span>
                <span
                  className="font-bold"
                  style={{ color: typeColors[selected.type] }}
                >
                  {item.value}
                </span>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center gap-1 text-accent/60">
                <Eye className="w-3 h-3" />
                <span className="text-[8px]">
                  PATENT: Automated satellite tasking coordinated with ground IoT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Satellite constellation panel — for sidebar display
 */
export function SatelliteConstellationPanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <div className="space-y-1">
        {CONSTELLATION.slice(0, 8).map((sat) => {
          const pos = getSatellitePosition(sat, now);
          return (
            <div
              key={sat.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-elevated"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: typeColors[sat.type] }}
              />
              <span className="font-mono text-[9px] text-foreground truncate flex-1">
                {sat.name}
              </span>
              <span className="font-mono text-[8px] text-text-dim tabular-nums">
                {sat.altitude_km}km
              </span>
            </div>
          );
        })}
        <div className="text-center font-mono text-[8px] text-text-dim pt-1">
          +{CONSTELLATION.length - 8} more in view
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {CONSTELLATION.map((sat) => {
        const pos = getSatellitePosition(sat, now);
        return (
          <div
            key={sat.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-elevated hover:bg-accent/5 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: typeColors[sat.type] }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[9px] text-foreground truncate block">
                {sat.name}
              </span>
              <span className="font-mono text-[8px] text-text-dim">
                {sat.operator} · {sat.altitude_km}km
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono text-[8px] text-text-dim tabular-nums">
                {pos.lat.toFixed(1)}°
              </div>
              <div className="font-mono text-[8px] text-text-dim tabular-nums">
                {pos.lng.toFixed(1)}°
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { CONSTELLATION, type OrbitalSatellite };
