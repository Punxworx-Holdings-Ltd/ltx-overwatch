// IoT Simulation Engine
// Generates realistic IoT device data for all 6 sector demo scenarios

import type { DeviceType, EntityType, IoTReading } from "@/types";
import { SCENARIOS } from "@/lib/utils/constants";
import {
  generateMovement,
  type MovementPattern,
} from "./movement-patterns";
import { generatePayload } from "./payload-generators";

export interface SimulatedDevice {
  id: string;
  scenarioSlug: string;
  deviceType: DeviceType;
  entityType: EntityType;
  entityId: string;
  name: string;
  lng: number;
  lat: number;
  heading: number;
  speed: number;
  pattern: MovementPattern;
  status: "friendly" | "neutral" | "threat" | "alert";
  metadata: Record<string, unknown>;
}

// Pre-configured devices for all 6 scenarios
const SCENARIO_DEVICES: Record<string, Omit<SimulatedDevice, "lng" | "lat" | "heading" | "speed">[]> = {
  "iron-curtain": [
    // 12 patrol personnel + 4 vehicles + cameras
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `ic-patrol-${i + 1}`,
      scenarioSlug: "iron-curtain",
      deviceType: "biometric_wearable" as DeviceType,
      entityType: "person" as EntityType,
      entityId: `SGT-${String(i + 1).padStart(3, "0")}`,
      name: `Patrol ${i + 1}`,
      pattern: "patrol" as MovementPattern,
      status: "friendly" as const,
      metadata: { rank: i < 4 ? "sergeant" : "corporal", unit: `Alpha-${Math.floor(i / 4) + 1}` },
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `ic-vehicle-${i + 1}`,
      scenarioSlug: "iron-curtain",
      deviceType: "gps_tracker" as DeviceType,
      entityType: "vehicle" as EntityType,
      entityId: `HMWV-${String(i + 1).padStart(2, "0")}`,
      name: `Vehicle ${i + 1}`,
      pattern: "patrol" as MovementPattern,
      status: "friendly" as const,
      metadata: { vehicleType: "HUMVEE", callsign: `Bravo-${i + 1}` },
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `ic-camera-${i + 1}`,
      scenarioSlug: "iron-curtain",
      deviceType: "camera" as DeviceType,
      entityType: "infrastructure" as EntityType,
      entityId: `CAM-${String(i + 1).padStart(3, "0")}`,
      name: `Perimeter Cam ${i + 1}`,
      pattern: "stationary" as MovementPattern,
      status: "neutral" as const,
      metadata: { fov: 120, nightVision: true },
    })),
  ],

  "green-canopy": [
    // 24 soil sensors + weather stations + tractors
    ...Array.from({ length: 24 }, (_, i) => ({
      id: `gc-soil-${i + 1}`,
      scenarioSlug: "green-canopy",
      deviceType: "soil_sensor" as DeviceType,
      entityType: "infrastructure" as EntityType,
      entityId: `SOIL-${String(i + 1).padStart(3, "0")}`,
      name: `Soil Sensor ${i + 1}`,
      pattern: "stationary" as MovementPattern,
      status: "friendly" as const,
      metadata: { depth_cm: [15, 30, 60][i % 3], field: `F${Math.floor(i / 6) + 1}` },
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `gc-weather-${i + 1}`,
      scenarioSlug: "green-canopy",
      deviceType: "weather_station" as DeviceType,
      entityType: "infrastructure" as EntityType,
      entityId: `WX-${String(i + 1).padStart(2, "0")}`,
      name: `Weather Station ${i + 1}`,
      pattern: "stationary" as MovementPattern,
      status: "neutral" as const,
      metadata: {},
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `gc-tractor-${i + 1}`,
      scenarioSlug: "green-canopy",
      deviceType: "gps_tracker" as DeviceType,
      entityType: "vehicle" as EntityType,
      entityId: `TRAC-${String(i + 1).padStart(2, "0")}`,
      name: `Tractor ${i + 1}`,
      pattern: "route" as MovementPattern,
      status: "friendly" as const,
      metadata: { model: "John Deere 8R", implement: ["plough", "sprayer", "harvester"][i] },
    })),
  ],

  "first-light": [
    // 30 survivors + 8 responders + drones
    ...Array.from({ length: 30 }, (_, i) => ({
      id: `fl-survivor-${i + 1}`,
      scenarioSlug: "first-light",
      deviceType: "biometric_wearable" as DeviceType,
      entityType: "person" as EntityType,
      entityId: `CIV-${String(i + 1).padStart(3, "0")}`,
      name: `Survivor ${i + 1}`,
      pattern: "stationary" as MovementPattern,
      status: (i < 20 ? "friendly" : i < 25 ? "alert" : "threat") as SimulatedDevice["status"],
      metadata: { located: i < 20, trapped: i >= 20, priority: i >= 25 ? "critical" : "standard" },
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `fl-responder-${i + 1}`,
      scenarioSlug: "first-light",
      deviceType: "biometric_wearable" as DeviceType,
      entityType: "person" as EntityType,
      entityId: `EMT-${String(i + 1).padStart(3, "0")}`,
      name: `Responder ${i + 1}`,
      pattern: "random_walk" as MovementPattern,
      status: "friendly" as const,
      metadata: { team: ["Medical", "Fire", "SAR", "Logistics"][i % 4], role: i < 4 ? "lead" : "support" },
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `fl-drone-${i + 1}`,
      scenarioSlug: "first-light",
      deviceType: "drone" as DeviceType,
      entityType: "drone" as EntityType,
      entityId: `UAV-${String(i + 1).padStart(2, "0")}`,
      name: `Search Drone ${i + 1}`,
      pattern: "random_walk" as MovementPattern,
      status: "neutral" as const,
      metadata: { payload: ["thermal", "optical", "lidar", "comms"][i], altitude_m: 50 + i * 20 },
    })),
  ],

  "deep-blue": [
    // 15 vessels + patrol boats
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `db-vessel-${i + 1}`,
      scenarioSlug: "deep-blue",
      deviceType: "ais_transponder" as DeviceType,
      entityType: "vessel" as EntityType,
      entityId: `MMSI-${(211000000 + i * 1000).toString()}`,
      name: `Vessel ${i + 1}`,
      pattern: "route" as MovementPattern,
      status: (i < 12 ? "friendly" : "neutral") as SimulatedDevice["status"],
      metadata: {
        vesselName: ["SS Aberdeen", "MV Highland Star", "FV Sea Spray", "MV Thistle", "FV North Wind",
          "SS Granite City", "MV Silver Darling", "FV Bon Accord", "MV Dee Runner", "FV Torry Quine",
          "SS Castlegate", "MV Don Lass", "FV Dark Stranger", "MV Shadow", "FV Ghost"][i],
        vesselType: i < 5 ? "cargo" : i < 10 ? "fishing" : i < 12 ? "tanker" : "unknown",
        destination: ["Aberdeen", "Peterhead", "Fraserburgh", "Lerwick", "Inverness"][i % 5],
      },
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `db-patrol-${i + 1}`,
      scenarioSlug: "deep-blue",
      deviceType: "gps_tracker" as DeviceType,
      entityType: "vessel" as EntityType,
      entityId: `PATROL-${String(i + 1).padStart(2, "0")}`,
      name: `Patrol Boat ${i + 1}`,
      pattern: "patrol" as MovementPattern,
      status: "friendly" as const,
      metadata: { callsign: `Harbour-${i + 1}`, armed: i === 0 },
    })),
  ],

  "wild-pulse": [
    // 8 elephants + 6 rhinos + rangers
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `wp-elephant-${i + 1}`,
      scenarioSlug: "wild-pulse",
      deviceType: "wildlife_collar" as DeviceType,
      entityType: "animal" as EntityType,
      entityId: `ELE-${String(i + 1).padStart(3, "0")}`,
      name: `Elephant ${["Mara", "Simba", "Tembo", "Nyota", "Kibo", "Amani", "Tamu", "Kiboko"][i]}`,
      pattern: "random_walk" as MovementPattern,
      status: "friendly" as const,
      metadata: { species: "African Elephant", age: 12 + i * 3, sex: i < 4 ? "male" : "female" },
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `wp-rhino-${i + 1}`,
      scenarioSlug: "wild-pulse",
      deviceType: "wildlife_collar" as DeviceType,
      entityType: "animal" as EntityType,
      entityId: `RHI-${String(i + 1).padStart(3, "0")}`,
      name: `Rhino ${["Kifaru", "Faru", "Pembe", "Jabali", "Mzee", "Ndovu"][i]}`,
      pattern: "random_walk" as MovementPattern,
      status: "friendly" as const,
      metadata: { species: "Black Rhino", age: 8 + i * 2, sex: i < 3 ? "male" : "female" },
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `wp-ranger-${i + 1}`,
      scenarioSlug: "wild-pulse",
      deviceType: "biometric_wearable" as DeviceType,
      entityType: "person" as EntityType,
      entityId: `RNG-${String(i + 1).padStart(3, "0")}`,
      name: `Ranger ${i + 1}`,
      pattern: "patrol" as MovementPattern,
      status: "friendly" as const,
      metadata: { unit: `Anti-Poaching Team ${Math.floor(i / 2) + 1}`, armed: true },
    })),
  ],

  "black-gold": [
    // 20 pipeline sensors + patrol vehicles
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `bg-pipeline-${i + 1}`,
      scenarioSlug: "black-gold",
      deviceType: "pipeline_sensor" as DeviceType,
      entityType: "infrastructure" as EntityType,
      entityId: `PIPE-${String(i + 1).padStart(3, "0")}`,
      name: `Sensor Node ${i + 1}`,
      pattern: "stationary" as MovementPattern,
      status: (i === 12 ? "alert" : "friendly") as SimulatedDevice["status"],
      metadata: { segment: `S${Math.floor(i / 5) + 1}`, pipelineDiameter_mm: 914, depth_m: 1.5 + (i % 3) * 0.5 },
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `bg-patrol-${i + 1}`,
      scenarioSlug: "black-gold",
      deviceType: "gps_tracker" as DeviceType,
      entityType: "vehicle" as EntityType,
      entityId: `MAINT-${String(i + 1).padStart(2, "0")}`,
      name: `Patrol Vehicle ${i + 1}`,
      pattern: "route" as MovementPattern,
      status: "friendly" as const,
      metadata: { vehicleType: "Land Rover", crew: 2 },
    })),
  ],
};

export class SimulationEngine {
  private devices: Map<string, SimulatedDevice> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private listeners: Map<string, Set<(reading: IoTReading) => void>> = new Map();

  initScenario(scenarioSlug: string): SimulatedDevice[] {
    const scenarioConfig = SCENARIOS.find((s) => s.slug === scenarioSlug);
    if (!scenarioConfig) throw new Error(`Unknown scenario: ${scenarioSlug}`);

    const deviceConfigs = SCENARIO_DEVICES[scenarioSlug] || [];
    const centerLng = scenarioConfig.center[0];
    const centerLat = scenarioConfig.center[1];
    const spread = 0.01; // ~1km spread

    const devices: SimulatedDevice[] = deviceConfigs.map((config, i) => {
      const angle = (i / deviceConfigs.length) * Math.PI * 2;
      const dist = (0.3 + Math.random() * 0.7) * spread;
      const device: SimulatedDevice = {
        ...config,
        lng: centerLng + Math.cos(angle) * dist,
        lat: centerLat + Math.sin(angle) * dist,
        heading: Math.random() * 360,
        speed: config.pattern === "stationary" ? 0 : 1 + Math.random() * 5,
      };
      this.devices.set(device.id, device);
      return device;
    });

    return devices;
  }

  startStreaming(scenarioSlug: string, intervalMs = 2000): void {
    if (this.timers.has(scenarioSlug)) return;

    const timer = setInterval(() => {
      const devices = Array.from(this.devices.values()).filter(
        (d) => d.scenarioSlug === scenarioSlug
      );

      for (const device of devices) {
        // Update position
        const newPos = generateMovement(device);
        device.lng = newPos.lng;
        device.lat = newPos.lat;
        device.heading = newPos.heading;
        device.speed = newPos.speed;

        // Generate reading
        const reading: IoTReading = {
          id: crypto.randomUUID(),
          device_id: device.id,
          scenario_id: scenarioSlug,
          timestamp: new Date().toISOString(),
          lng: device.lng,
          lat: device.lat,
          heading: device.heading,
          speed: device.speed,
          payload: generatePayload(device.deviceType, device),
          confidence: 0.85 + Math.random() * 0.15,
        };

        // Notify listeners
        const listeners = this.listeners.get(scenarioSlug);
        if (listeners) {
          for (const listener of listeners) {
            listener(reading);
          }
        }
      }
    }, intervalMs);

    this.timers.set(scenarioSlug, timer);
  }

  stopStreaming(scenarioSlug: string): void {
    const timer = this.timers.get(scenarioSlug);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(scenarioSlug);
    }
  }

  subscribe(
    scenarioSlug: string,
    callback: (reading: IoTReading) => void
  ): () => void {
    if (!this.listeners.has(scenarioSlug)) {
      this.listeners.set(scenarioSlug, new Set());
    }
    this.listeners.get(scenarioSlug)!.add(callback);
    return () => this.listeners.get(scenarioSlug)?.delete(callback);
  }

  getDevices(scenarioSlug?: string): SimulatedDevice[] {
    const all = Array.from(this.devices.values());
    return scenarioSlug ? all.filter((d) => d.scenarioSlug === scenarioSlug) : all;
  }

  getDevice(deviceId: string): SimulatedDevice | undefined {
    return this.devices.get(deviceId);
  }

  destroy(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.devices.clear();
    this.listeners.clear();
  }
}

// Singleton for server-side usage
let _serverEngine: SimulationEngine | null = null;
export function getServerSimEngine(): SimulationEngine {
  if (!_serverEngine) {
    _serverEngine = new SimulationEngine();
  }
  return _serverEngine;
}
