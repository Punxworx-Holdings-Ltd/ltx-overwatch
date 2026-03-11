// Movement pattern generators for IoT device simulation

import type { SimulatedDevice } from "./engine";

export type MovementPattern = "patrol" | "random_walk" | "route" | "stationary";

interface MovementResult {
  lng: number;
  lat: number;
  heading: number;
  speed: number;
}

export function generateMovement(device: SimulatedDevice): MovementResult {
  switch (device.pattern) {
    case "patrol":
      return movePatrol(device);
    case "random_walk":
      return moveRandomWalk(device);
    case "route":
      return moveRoute(device);
    case "stationary":
      return moveStationary(device);
  }
}

// Patrol: Follow a roughly circular path around a center point with some noise
function movePatrol(device: SimulatedDevice): MovementResult {
  const angularSpeed = 0.002; // radians per tick
  const currentAngle = Math.atan2(
    device.lat - (device.metadata.centerLat as number || device.lat),
    device.lng - (device.metadata.centerLng as number || device.lng)
  );

  const newAngle = currentAngle + angularSpeed + (Math.random() - 0.5) * 0.001;
  const radius = 0.003 + Math.sin(Date.now() / 10000) * 0.001; // ~300m with variance

  const noise = (Math.random() - 0.5) * 0.0002;
  const newLng = device.lng + Math.cos(newAngle) * 0.00008 + noise;
  const newLat = device.lat + Math.sin(newAngle) * 0.00008 + noise;

  const heading = ((newAngle * 180) / Math.PI + 90 + 360) % 360;
  const speed = 2 + Math.random() * 3; // 2-5 km/h walking

  return { lng: newLng, lat: newLat, heading, speed };
}

// Random walk: Brownian motion with drift (wildlife, search teams)
function moveRandomWalk(device: SimulatedDevice): MovementResult {
  const stepSize = 0.00015; // ~15m
  const drift = 0.00002; // slight directional bias

  // Add heading persistence — animals don't randomly change direction every tick
  const headingChange = (Math.random() - 0.5) * 60; // ±30° per tick
  const newHeading = (device.heading + headingChange + 360) % 360;
  const headingRad = (newHeading * Math.PI) / 180;

  const newLng = device.lng + Math.cos(headingRad) * stepSize + (Math.random() - 0.5) * drift;
  const newLat = device.lat + Math.sin(headingRad) * stepSize + (Math.random() - 0.5) * drift;

  const speed = 1 + Math.random() * 8; // variable speed

  return { lng: newLng, lat: newLat, heading: newHeading, speed };
}

// Route: Follow a roughly linear path with periodic course corrections
function moveRoute(device: SimulatedDevice): MovementResult {
  const headingRad = (device.heading * Math.PI) / 180;
  const stepSize = 0.0002; // ~20m per tick

  // Periodic course correction
  const correction = Math.sin(Date.now() / 15000) * 0.5;
  const adjustedHeading = device.heading + correction;
  const adjustedRad = (adjustedHeading * Math.PI) / 180;

  const newLng = device.lng + Math.cos(adjustedRad) * stepSize;
  const newLat = device.lat + Math.sin(adjustedRad) * stepSize;

  const speed = 5 + Math.random() * 15; // 5-20 km/h (vessels, vehicles)

  return { lng: newLng, lat: newLat, heading: adjustedHeading, speed };
}

// Stationary: Fixed position with small GPS jitter
function moveStationary(device: SimulatedDevice): MovementResult {
  const jitter = 0.00001; // ~1m GPS noise
  return {
    lng: device.lng + (Math.random() - 0.5) * jitter,
    lat: device.lat + (Math.random() - 0.5) * jitter,
    heading: device.heading,
    speed: 0,
  };
}
