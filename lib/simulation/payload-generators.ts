// Payload generators for different IoT device types
// Generates realistic sensor data for simulation

import type { DeviceType } from "@/types";
import type { SimulatedDevice } from "./engine";

export function generatePayload(
  deviceType: DeviceType,
  device: SimulatedDevice
): Record<string, unknown> {
  switch (deviceType) {
    case "biometric_wearable":
      return generateBiometrics(device);
    case "soil_sensor":
      return generateSoilData(device);
    case "ais_transponder":
      return generateAISData(device);
    case "pipeline_sensor":
      return generatePipelineData(device);
    case "wildlife_collar":
      return generateWildlifeData(device);
    case "weather_station":
      return generateWeatherData();
    case "gps_tracker":
      return generateGPSPayload(device);
    case "camera":
      return generateCameraData();
    case "drone":
      return generateDroneData(device);
  }
}

function generateBiometrics(device: SimulatedDevice) {
  const isStressed = device.status === "alert" || device.status === "threat";
  const baseHR = isStressed ? 110 : 75;
  return {
    heart_rate: Math.round(baseHR + (Math.random() - 0.5) * 20),
    body_temp: +(36.2 + Math.random() * 1.5).toFixed(1),
    spo2: Math.round(isStressed ? 91 + Math.random() * 5 : 95 + Math.random() * 4),
    blood_pressure: `${Math.round(isStressed ? 140 : 120 + (Math.random() - 0.5) * 10)}/${Math.round(isStressed ? 95 : 80 + (Math.random() - 0.5) * 8)}`,
    stress_index: +(isStressed ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.4).toFixed(2),
    activity: isStressed
      ? ["running", "crawling", "distressed"][Math.floor(Math.random() * 3)]
      : ["walking", "standing", "sitting"][Math.floor(Math.random() * 3)],
    battery_pct: Math.round(20 + Math.random() * 70),
  };
}

function generateSoilData(device: SimulatedDevice) {
  const depth = (device.metadata.depth_cm as number) || 30;
  const baseMoisture = depth > 45 ? 38 : depth > 20 ? 30 : 22;
  return {
    moisture_pct: +(baseMoisture + (Math.random() - 0.5) * 8).toFixed(1),
    temperature_c: +(12 + Math.random() * 6).toFixed(1),
    ph: +(6.0 + Math.random() * 1.5).toFixed(1),
    nitrogen_ppm: Math.round(25 + Math.random() * 30),
    phosphorus_ppm: Math.round(15 + Math.random() * 20),
    potassium_ppm: Math.round(140 + Math.random() * 60),
    conductivity_ms: +(0.2 + Math.random() * 0.8).toFixed(2),
    depth_cm: depth,
    battery_pct: Math.round(50 + Math.random() * 45),
  };
}

function generateAISData(device: SimulatedDevice) {
  return {
    mmsi: device.metadata.vesselName ? device.entityId : `211${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
    vessel_name: device.metadata.vesselName || "Unknown",
    vessel_type: device.metadata.vesselType || "cargo",
    destination: device.metadata.destination || "Unknown",
    eta: new Date(Date.now() + Math.random() * 86400000 * 3).toISOString(),
    draught_m: +(3 + Math.random() * 9).toFixed(1),
    course_deg: Math.round(device.heading),
    speed_knots: +(device.speed * 0.54).toFixed(1),
    nav_status: device.speed > 1 ? "under_way" : "at_anchor",
    cargo_type: ["general", "bulk", "petroleum", "dangerous"][Math.floor(Math.random() * 4)],
  };
}

function generatePipelineData(device: SimulatedDevice) {
  const isAlert = device.status === "alert";
  const basePressure = isAlert ? 45 : 72;
  return {
    pressure_bar: +(basePressure + (Math.random() - 0.5) * 10).toFixed(1),
    flow_rate_m3h: +(isAlert ? 120 : 340 + (Math.random() - 0.5) * 40).toFixed(1),
    temperature_c: +(8 + Math.random() * 12).toFixed(1),
    vibration_hz: +(isAlert ? 45 : 12 + Math.random() * 8).toFixed(1),
    corrosion_mm: +(0.1 + Math.random() * 0.3).toFixed(2),
    leak_probability: +(isAlert ? 0.75 + Math.random() * 0.2 : Math.random() * 0.05).toFixed(3),
    wall_thickness_mm: +(14.3 - Math.random() * 0.5).toFixed(1),
    segment: device.metadata.segment,
    battery_pct: Math.round(60 + Math.random() * 35),
  };
}

function generateWildlifeData(device: SimulatedDevice) {
  return {
    species: device.metadata.species || "Unknown",
    body_temp_c: +(36.5 + Math.random() * 2).toFixed(1),
    heart_rate: Math.round(25 + Math.random() * 30),
    activity_level: (["resting", "walking", "feeding", "running"] as const)[
      Math.floor(Math.random() * 4)
    ],
    ambient_temp_c: +(22 + Math.random() * 12).toFixed(1),
    proximity_alert: Math.random() > 0.95,
    collar_battery_pct: Math.round(40 + Math.random() * 55),
    daily_distance_km: +(2 + Math.random() * 18).toFixed(1),
    group_size: Math.round(1 + Math.random() * 6),
  };
}

function generateWeatherData() {
  return {
    temperature_c: +(8 + Math.random() * 15).toFixed(1),
    humidity_pct: Math.round(50 + Math.random() * 40),
    wind_speed_kmh: +(5 + Math.random() * 30).toFixed(1),
    wind_direction_deg: Math.round(Math.random() * 360),
    pressure_hpa: +(1010 + (Math.random() - 0.5) * 20).toFixed(1),
    rainfall_mm: +(Math.random() * 5).toFixed(1),
    uv_index: Math.round(1 + Math.random() * 8),
    visibility_km: +(5 + Math.random() * 15).toFixed(1),
    solar_radiation_wm2: Math.round(100 + Math.random() * 700),
  };
}

function generateGPSPayload(device: SimulatedDevice) {
  return {
    speed_kmh: +(device.speed).toFixed(1),
    heading_deg: Math.round(device.heading),
    altitude_m: Math.round(10 + Math.random() * 50),
    hdop: +(0.5 + Math.random() * 1.5).toFixed(1),
    satellites_in_view: Math.round(6 + Math.random() * 8),
    fuel_pct: Math.round(30 + Math.random() * 60),
    engine_temp_c: Math.round(75 + Math.random() * 20),
    battery_v: +(12.2 + Math.random() * 1.5).toFixed(1),
    odometer_km: Math.round(10000 + Math.random() * 90000),
  };
}

function generateCameraData() {
  return {
    status: "recording",
    resolution: "1080p",
    fps: 30,
    night_mode: new Date().getHours() < 6 || new Date().getHours() > 18,
    motion_detected: Math.random() > 0.7,
    objects_detected: Math.round(Math.random() * 5),
    storage_used_pct: Math.round(20 + Math.random() * 60),
    uptime_hours: Math.round(24 + Math.random() * 720),
  };
}

function generateDroneData(device: SimulatedDevice) {
  return {
    altitude_m: (device.metadata.altitude_m as number) || 50 + Math.random() * 50,
    ground_speed_ms: +(device.speed * 0.278).toFixed(1),
    battery_pct: Math.round(30 + Math.random() * 60),
    payload_type: device.metadata.payload || "optical",
    gps_fix: "3D",
    satellites: Math.round(8 + Math.random() * 6),
    signal_strength_dbm: Math.round(-60 - Math.random() * 30),
    wind_speed_ms: +(2 + Math.random() * 8).toFixed(1),
    flight_time_min: Math.round(5 + Math.random() * 25),
    home_distance_m: Math.round(50 + Math.random() * 500),
  };
}
