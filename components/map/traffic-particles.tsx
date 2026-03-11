"use client";

import { useState, useEffect, useMemo } from "react";
import { Marker } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import { Car } from "lucide-react";

interface TrafficParticle {
  id: string;
  route: [number, number][]; // waypoints
  speed: number; // 0-1 normalised
  type: "car" | "truck" | "bus";
  direction: 1 | -1; // forward or reverse along route
  phase: number; // 0-1 position along route
}

/**
 * Generate road routes for a scenario area
 * Uses a grid of realistic-looking road segments around the center point
 */
function generateRoads(
  centerLng: number,
  centerLat: number,
  spread: number = 0.008
): [number, number][][] {
  const roads: [number, number][][] = [];

  // Main east-west roads
  for (let i = -2; i <= 2; i++) {
    const latOffset = i * spread * 0.5;
    const road: [number, number][] = [];
    for (let j = -5; j <= 5; j++) {
      const lngOffset = j * spread * 0.4;
      road.push([
        centerLng + lngOffset + (Math.random() - 0.5) * spread * 0.05,
        centerLat + latOffset + (Math.random() - 0.5) * spread * 0.05,
      ]);
    }
    roads.push(road);
  }

  // Main north-south roads
  for (let i = -2; i <= 2; i++) {
    const lngOffset = i * spread * 0.5;
    const road: [number, number][] = [];
    for (let j = -5; j <= 5; j++) {
      const latOffset = j * spread * 0.4;
      road.push([
        centerLng + lngOffset + (Math.random() - 0.5) * spread * 0.05,
        centerLat + latOffset + (Math.random() - 0.5) * spread * 0.05,
      ]);
    }
    roads.push(road);
  }

  // Diagonal roads
  const diag1: [number, number][] = [];
  const diag2: [number, number][] = [];
  for (let i = -4; i <= 4; i++) {
    diag1.push([
      centerLng + i * spread * 0.4,
      centerLat + i * spread * 0.3,
    ]);
    diag2.push([
      centerLng + i * spread * 0.4,
      centerLat - i * spread * 0.3,
    ]);
  }
  roads.push(diag1, diag2);

  return roads;
}

/**
 * Generate traffic particles along road routes
 */
function generateTraffic(
  roads: [number, number][][],
  density: number = 3
): TrafficParticle[] {
  const particles: TrafficParticle[] = [];
  const types: TrafficParticle["type"][] = ["car", "car", "car", "truck", "bus"];

  roads.forEach((road, roadIdx) => {
    for (let i = 0; i < density; i++) {
      particles.push({
        id: `traffic-${roadIdx}-${i}`,
        route: road,
        speed: 0.3 + Math.random() * 0.7,
        type: types[Math.floor(Math.random() * types.length)],
        direction: Math.random() > 0.5 ? 1 : -1,
        phase: Math.random(),
      });
    }
  });

  return particles;
}

/**
 * Interpolate position along a route at a given phase (0-1)
 */
function interpolateRoute(
  route: [number, number][],
  phase: number
): [number, number] {
  const p = Math.max(0, Math.min(1, phase));
  const totalSegments = route.length - 1;
  const segmentFloat = p * totalSegments;
  const segmentIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1);
  const segmentPhase = segmentFloat - segmentIdx;

  const start = route[segmentIdx];
  const end = route[segmentIdx + 1] || start;

  return [
    start[0] + (end[0] - start[0]) * segmentPhase,
    start[1] + (end[1] - start[1]) * segmentPhase,
  ];
}

const particleColors: Record<TrafficParticle["type"], string> = {
  car: "#FFFFFF",
  truck: "#F59E0B",
  bus: "#3B82F6",
};

/**
 * Procedural traffic system — renders animated vehicle particles
 * along generated road networks in the scenario area.
 *
 * Particles move continuously along routes, creating the appearance
 * of live urban traffic. Uses Mapbox Markers for 3D-correct positioning.
 */
export function TrafficParticleOverlay({
  centerLng,
  centerLat,
  enabled = true,
  density = 3,
}: {
  centerLng: number;
  centerLat: number;
  enabled?: boolean;
  density?: number;
}) {
  const [tick, setTick] = useState(0);

  // Generate roads and traffic once based on center
  const { particles } = useMemo(() => {
    const roads = generateRoads(centerLng, centerLat);
    const particles = generateTraffic(roads, density);
    return { roads, particles };
  }, [centerLng, centerLat, density]);

  // Animate particles
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [enabled]);

  // Calculate current positions
  const positions = useMemo(() => {
    return particles.map((p) => {
      // Move phase along route based on speed and direction
      const elapsed = tick * 0.003 * p.speed * p.direction;
      const phase = ((p.phase + elapsed) % 1 + 1) % 1;
      const pos = interpolateRoute(p.route, phase);
      return { ...p, currentPos: pos };
    });
  }, [particles, tick]);

  if (!enabled) return null;

  return (
    <>
      {positions.map((p) => (
        <Marker
          key={p.id}
          longitude={p.currentPos[0]}
          latitude={p.currentPos[1]}
          anchor="center"
        >
          <div
            className="w-1.5 h-1.5 rounded-full opacity-60"
            style={{
              backgroundColor: particleColors[p.type],
              boxShadow: `0 0 3px ${particleColors[p.type]}40`,
            }}
          />
        </Marker>
      ))}

      {/* Traffic count badge */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-background/60 backdrop-blur-sm border border-border/50 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <Car className="w-3 h-3 text-text-dim" />
          <span className="font-mono text-[8px] text-text-dim">
            {positions.length} VEHICLES
          </span>
        </div>
      </div>
    </>
  );
}
