// Alert engine — processes breach events and manages alert lifecycle
// Works with both simulated and live IoT data

import type { BreachEvent, GeofenceZone } from "./detector";
import { checkGeofences } from "./detector";

export interface Alert {
  id: string;
  scenarioId: string;
  geofenceId: string | null;
  deviceId: string | null;
  alertType: "geofence_breach" | "anomaly" | "threshold" | "identification";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  lng: number;
  lat: number;
  status: "active" | "acknowledged" | "resolved";
  payload: Record<string, unknown>;
  createdAt: Date;
}

type AlertCallback = (alert: Alert) => void;

let alertCounter = 0;

function generateAlertId(): string {
  alertCounter++;
  return `ALT-${String(alertCounter).padStart(4, "0")}`;
}

export class AlertEngine {
  private alerts: Alert[] = [];
  private subscribers: Set<AlertCallback> = new Set();
  private geofences: GeofenceZone[] = [];
  private scenarioId: string;

  constructor(scenarioId: string) {
    this.scenarioId = scenarioId;
  }

  /**
   * Set active geofences for monitoring
   */
  setGeofences(geofences: GeofenceZone[]) {
    this.geofences = geofences;
  }

  /**
   * Process an IoT reading against all geofences
   */
  processReading(reading: {
    deviceId: string;
    entityId: string;
    lng: number;
    lat: number;
    payload: Record<string, unknown>;
  }): BreachEvent[] {
    const breaches = checkGeofences(
      reading.entityId,
      reading.deviceId,
      reading.lng,
      reading.lat,
      this.geofences
    );

    for (const breach of breaches) {
      const alert = this.createAlertFromBreach(breach);
      this.addAlert(alert);
    }

    // Also check payload-based thresholds
    this.checkThresholds(reading);

    return breaches;
  }

  /**
   * Create an alert from a geofence breach event
   */
  private createAlertFromBreach(breach: BreachEvent): Alert {
    return {
      id: generateAlertId(),
      scenarioId: this.scenarioId,
      geofenceId: breach.geofenceId,
      deviceId: breach.deviceId,
      alertType: "geofence_breach",
      severity: breach.severity,
      title: `${breach.breachType === "entry" ? "Unauthorised entry" : "Exit detected"} — ${breach.geofenceName}`,
      description: `Entity ${breach.entityId} ${breach.breachType === "entry" ? "entered" : "exited"} ${breach.geofenceName} at ${breach.position[1].toFixed(4)}°N, ${Math.abs(breach.position[0]).toFixed(4)}°${breach.position[0] >= 0 ? "E" : "W"}`,
      lng: breach.position[0],
      lat: breach.position[1],
      status: "active",
      payload: { entityId: breach.entityId, breachType: breach.breachType },
      createdAt: breach.timestamp,
    };
  }

  /**
   * Check payload values against thresholds
   */
  private checkThresholds(reading: {
    deviceId: string;
    entityId: string;
    lng: number;
    lat: number;
    payload: Record<string, unknown>;
  }) {
    const p = reading.payload;

    // Pipeline pressure anomaly
    if (typeof p.pressure_bar === "number" && p.pressure_bar < 30) {
      this.addAlert({
        id: generateAlertId(),
        scenarioId: this.scenarioId,
        geofenceId: null,
        deviceId: reading.deviceId,
        alertType: "threshold",
        severity: "critical",
        title: `Pipeline pressure anomaly — ${reading.entityId}`,
        description: `Pressure drop to ${p.pressure_bar}bar detected. Leak probability elevated.`,
        lng: reading.lng,
        lat: reading.lat,
        status: "active",
        payload: reading.payload,
        createdAt: new Date(),
      });
    }

    // Heart rate critical
    if (typeof p.heart_rate === "number" && p.heart_rate > 140) {
      this.addAlert({
        id: generateAlertId(),
        scenarioId: this.scenarioId,
        geofenceId: null,
        deviceId: reading.deviceId,
        alertType: "anomaly",
        severity: "high",
        title: `Elevated heart rate — ${reading.entityId}`,
        description: `Heart rate spike to ${p.heart_rate}bpm. Entity may be in distress.`,
        lng: reading.lng,
        lat: reading.lat,
        status: "active",
        payload: reading.payload,
        createdAt: new Date(),
      });
    }

    // Soil moisture critical
    if (typeof p.moisture_pct === "number" && p.moisture_pct < 15) {
      this.addAlert({
        id: generateAlertId(),
        scenarioId: this.scenarioId,
        geofenceId: null,
        deviceId: reading.deviceId,
        alertType: "threshold",
        severity: "medium",
        title: `Soil moisture critical — ${reading.entityId}`,
        description: `Moisture at ${p.moisture_pct}%. Irrigation recommended.`,
        lng: reading.lng,
        lat: reading.lat,
        status: "active",
        payload: reading.payload,
        createdAt: new Date(),
      });
    }
  }

  private addAlert(alert: Alert) {
    this.alerts.unshift(alert);
    // Keep max 100 alerts
    if (this.alerts.length > 100) this.alerts.pop();
    // Notify subscribers
    for (const cb of this.subscribers) {
      cb(alert);
    }
  }

  subscribe(callback: AlertCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getAlerts(filter?: { severity?: string; status?: string }): Alert[] {
    let result = this.alerts;
    if (filter?.severity) result = result.filter((a) => a.severity === filter.severity);
    if (filter?.status) result = result.filter((a) => a.status === filter.status);
    return result;
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) alert.status = "acknowledged";
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) alert.status = "resolved";
  }

  getActiveCount(): number {
    return this.alerts.filter((a) => a.status === "active").length;
  }

  getCriticalCount(): number {
    return this.alerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  }

  destroy() {
    this.subscribers.clear();
    this.alerts = [];
  }
}
