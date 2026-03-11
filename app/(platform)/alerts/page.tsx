"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, AlertTriangle, Activity, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

interface SimAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  type: "geofence_breach" | "anomaly" | "threshold" | "identification";
  title: string;
  description: string;
  scenario: string;
  entityId: string;
  time: string;
  lng: number;
  lat: number;
  status: "active" | "acknowledged" | "resolved";
}

function generateAlerts(): SimAlert[] {
  const now = new Date();
  return [
    {
      id: "ALT-001",
      severity: "critical",
      type: "geofence_breach",
      title: "Unauthorised entity in EXCLUSION ZONE Alpha",
      description: "Unknown entity entered the exclusion perimeter at high speed. No matching IoT device signature. Potential intruder.",
      scenario: "IRON CURTAIN",
      entityId: "UNKNOWN-1",
      time: new Date(now.getTime() - 45000).toISOString(),
      lng: 44.31,
      lat: 33.31,
      status: "active",
    },
    {
      id: "ALT-002",
      severity: "critical",
      type: "threshold",
      title: "Pipeline pressure anomaly — Segment S3",
      description: "Pressure drop of 27bar detected at PIPE-013. Leak probability: 82%. Automated shutdown initiated.",
      scenario: "BLACK GOLD",
      entityId: "PIPE-013",
      time: new Date(now.getTime() - 120000).toISOString(),
      lng: -1.78,
      lat: 57.51,
      status: "active",
    },
    {
      id: "ALT-003",
      severity: "high",
      type: "anomaly",
      title: "Elevated heart rate — Survivor CIV-026",
      description: "Heart rate spike to 142bpm, SpO2 dropped to 88%. Trapped survivor showing signs of acute distress.",
      scenario: "FIRST LIGHT",
      entityId: "CIV-026",
      time: new Date(now.getTime() - 180000).toISOString(),
      lng: 37.21,
      lat: 37.01,
      status: "active",
    },
    {
      id: "ALT-004",
      severity: "high",
      type: "geofence_breach",
      title: "Unidentified vessel entering restricted zone",
      description: "Vessel MMSI-211013000 ('FV Dark Stranger') entered port restricted zone without AIS transponder response to hailing.",
      scenario: "DEEP BLUE",
      entityId: "MMSI-211013000",
      time: new Date(now.getTime() - 300000).toISOString(),
      lng: -2.06,
      lat: 57.15,
      status: "acknowledged",
    },
    {
      id: "ALT-005",
      severity: "medium",
      type: "identification",
      title: "Proximity alert — Rhino RHI-003 near boundary",
      description: "Rhino 'Pembe' moving towards park boundary at elevated speed. Anti-poaching team RNG-002 alerted.",
      scenario: "WILD PULSE",
      entityId: "RHI-003",
      time: new Date(now.getTime() - 420000).toISOString(),
      lng: 35.01,
      lat: -1.49,
      status: "active",
    },
    {
      id: "ALT-006",
      severity: "medium",
      type: "threshold",
      title: "Soil moisture critical — Field F2",
      description: "6 sensors reporting moisture below 18% threshold. Irrigation recommended within 12 hours.",
      scenario: "GREEN CANOPY",
      entityId: "SOIL-007",
      time: new Date(now.getTime() - 600000).toISOString(),
      lng: 0.52,
      lat: 52.51,
      status: "active",
    },
    {
      id: "ALT-007",
      severity: "low",
      type: "anomaly",
      title: "Drone UAV-02 low battery — 18%",
      description: "Search drone reporting low battery. Auto-return initiated. Estimated 6 minutes to landing.",
      scenario: "FIRST LIGHT",
      entityId: "UAV-02",
      time: new Date(now.getTime() - 900000).toISOString(),
      lng: 37.2,
      lat: 37.0,
      status: "resolved",
    },
  ];
}

const typeIcons = {
  geofence_breach: Shield,
  anomaly: Activity,
  threshold: AlertTriangle,
  identification: MapPin,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SimAlert[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "critical">("all");

  useEffect(() => {
    setAlerts(generateAlerts());
  }, []);

  const filtered = alerts.filter((a) => {
    if (filter === "active") return a.status === "active";
    if (filter === "critical") return a.severity === "critical";
    return true;
  });

  const counts = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === "active").length,
    critical: alerts.filter((a) => a.severity === "critical").length,
  };

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " UTC";
  }

  function timeAgo(iso: string) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Bell className="w-4 h-4 text-threat" />
          SENTINEL — Alert Console
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="text-threat">{counts.critical} CRITICAL</span>
          <span className="text-warning">{counts.active} ACTIVE</span>
          <span className="text-text-dim">{counts.total} TOTAL</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(["all", "active", "critical"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded font-mono text-[10px] uppercase transition-colors ${
                filter === f
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-dim hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 max-w-4xl">
          {filtered.map((alert) => {
            const Icon = typeIcons[alert.type];
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  alert.severity === "critical"
                    ? "border-threat/40 bg-threat/5"
                    : alert.severity === "high"
                      ? "border-warning/40 bg-warning/5"
                      : alert.status === "resolved"
                        ? "border-border/50 bg-elevated/50 opacity-60"
                        : "border-border bg-elevated"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon
                      className={`w-4 h-4 ${
                        alert.severity === "critical"
                          ? "text-threat"
                          : alert.severity === "high"
                            ? "text-warning"
                            : "text-text-muted"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          alert.severity === "critical"
                            ? "bg-threat/20 text-threat"
                            : alert.severity === "high"
                              ? "bg-warning/20 text-warning"
                              : alert.severity === "medium"
                                ? "bg-intel/20 text-intel"
                                : "bg-text-dim/20 text-text-dim"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono text-[10px] text-text-dim">
                        {alert.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] text-text-dim">
                        •
                      </span>
                      <span className="font-mono text-[10px] text-text-dim">
                        {alert.scenario}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        {alert.status === "active" && (
                          <div className="w-2 h-2 rounded-full bg-threat animate-halo-pulse" />
                        )}
                        {alert.status === "acknowledged" && (
                          <CheckCircle className="w-3 h-3 text-warning" />
                        )}
                        {alert.status === "resolved" && (
                          <XCircle className="w-3 h-3 text-text-dim" />
                        )}
                        <span className="font-mono text-[10px] text-text-dim uppercase">
                          {alert.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      {alert.title}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-text-dim">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.time)} ({timeAgo(alert.time)})
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.lat.toFixed(4)}°N, {Math.abs(alert.lng).toFixed(4)}°{alert.lng >= 0 ? "E" : "W"}
                      </div>
                      <div>
                        Entity: <span className="text-foreground">{alert.entityId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
