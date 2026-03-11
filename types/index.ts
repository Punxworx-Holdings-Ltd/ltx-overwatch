export type Sector = "defence" | "agriculture" | "disaster" | "maritime" | "wildlife" | "oil_gas";

export type DeviceType =
  | "gps_tracker"
  | "biometric_wearable"
  | "soil_sensor"
  | "ais_transponder"
  | "camera"
  | "weather_station"
  | "wildlife_collar"
  | "pipeline_sensor"
  | "drone";

export type EntityType = "person" | "vehicle" | "vessel" | "animal" | "infrastructure" | "drone";

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "false_positive";
export type AlertType = "geofence_breach" | "anomaly" | "threshold" | "identification";

export type FenceType = "exclusion" | "inclusion" | "alert";
export type TaskStatus = "pending" | "scheduled" | "capturing" | "processing" | "delivered" | "failed";
export type ImageryType = "optical" | "sar" | "infrared" | "hyperspectral" | "ndvi";

export interface Scenario {
  id: string;
  name: string;
  slug: string;
  sector: Sector;
  description: string;
  center_lng: number;
  center_lat: number;
  zoom_level: number;
  bbox: BoundingBox;
  imagery_config: ImageryConfig;
  is_active: boolean;
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface ImageryConfig {
  default_layer: ImageryType;
  available_layers: ImageryType[];
  time_range?: { from: string; to: string };
}

export interface IoTDevice {
  id: string;
  scenario_id: string;
  device_type: DeviceType;
  name: string;
  entity_type: EntityType;
  entity_id: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
}

export interface IoTReading {
  id: string;
  device_id: string;
  scenario_id: string;
  timestamp: string;
  lng: number;
  lat: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  payload: Record<string, unknown>;
  confidence: number;
}

export interface Geofence {
  id: string;
  scenario_id: string;
  name: string;
  geometry: GeoJSON.Polygon;
  fence_type: FenceType;
  severity: AlertSeverity;
  alert_on_entry: boolean;
  alert_on_exit: boolean;
  authorized_entities: string[];
  is_active: boolean;
}

export interface Alert {
  id: string;
  scenario_id: string;
  geofence_id?: string;
  device_id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  lng?: number;
  lat?: number;
  payload?: Record<string, unknown>;
  status: AlertStatus;
  created_at: string;
}

export interface SatelliteTask {
  id: string;
  scenario_id?: string;
  target_bbox: BoundingBox;
  requested_time_start: string;
  requested_time_end: string;
  satellite_id?: string;
  imagery_type: ImageryType;
  resolution_m?: number;
  cloud_cover_max: number;
  status: TaskStatus;
  delivered_at?: string;
  image_url?: string;
}

// Fusion engine types
export interface FusionEntity {
  id: string;
  deviceId: string;
  entityType: EntityType;
  entityId: string;
  name: string;
  deviceType: DeviceType;
  currentPosition: [number, number];
  previousPosition: [number, number];
  targetPosition: [number, number];
  transitionStart: number;
  heading: number;
  speed: number;
  latestPayload: Record<string, unknown>;
  lastUpdate: Date;
  trail: [number, number, string][];
  status: "friendly" | "neutral" | "threat" | "alert";
  confidence: number;
}

export interface ViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}
