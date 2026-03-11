"use client";

import { Bell, Shield, AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Alert Console
        </h1>
        <p className="text-sm text-text-muted">
          Geofence breach detection, anomaly alerts, and threshold monitoring.
        </p>
      </div>

      <div className="space-y-3">
        {/* Sample alerts */}
        {[
          {
            severity: "critical",
            type: "Geofence Breach",
            title: "Unauthorised entity detected in SECTOR-7",
            time: "12:34:21 UTC",
            icon: Shield,
          },
          {
            severity: "high",
            type: "Anomaly",
            title: "Elevated heart rate detected — ALPHA-03",
            time: "12:33:45 UTC",
            icon: AlertTriangle,
          },
          {
            severity: "medium",
            type: "Threshold",
            title: "Soil moisture below threshold — SENSOR-12",
            time: "12:31:02 UTC",
            icon: AlertTriangle,
          },
        ].map((alert, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border ${
              alert.severity === "critical"
                ? "border-threat/40 bg-threat/5"
                : alert.severity === "high"
                  ? "border-warning/40 bg-warning/5"
                  : "border-border bg-elevated"
            }`}
          >
            <div className="flex items-center gap-3">
              <alert.icon
                className={`w-4 h-4 ${
                  alert.severity === "critical"
                    ? "text-threat"
                    : alert.severity === "high"
                      ? "text-warning"
                      : "text-text-muted"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.severity === "critical"
                        ? "bg-threat/20 text-threat"
                        : alert.severity === "high"
                          ? "bg-warning/20 text-warning"
                          : "bg-text-dim/20 text-text-dim"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-mono text-[10px] text-text-dim">
                    {alert.type}
                  </span>
                </div>
                <p className="text-sm text-foreground">{alert.title}</p>
              </div>
              <span className="font-mono text-[10px] text-text-dim">
                {alert.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[10px] text-text-dim mt-6 text-center">
        LIVE ALERT STREAM — Phase 6 (Geofence + PostGIS)
      </p>
    </div>
  );
}
