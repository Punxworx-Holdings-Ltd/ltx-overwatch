"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Satellite, Clock, MapPin, Orbit, ChevronRight, Zap, Eye, Cloud } from "lucide-react";
import { SCENARIOS } from "@/lib/utils/constants";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <span className="font-mono text-sm text-text-muted">LOADING...</span>
    </div>
  ),
});

// Simulated satellite constellation
const satellites = [
  { id: "S2A", name: "Sentinel-2A", orbit: "SSO", altitude: 786, revisit: "5 days", status: "active", nextPass: "14:23 UTC" },
  { id: "S2B", name: "Sentinel-2B", orbit: "SSO", altitude: 786, revisit: "5 days", status: "active", nextPass: "16:41 UTC" },
  { id: "S1A", name: "Sentinel-1A", orbit: "SSO", altitude: 693, revisit: "6 days", status: "active", nextPass: "03:12 UTC" },
  { id: "L9", name: "Landsat-9", orbit: "SSO", altitude: 705, revisit: "16 days", status: "active", nextPass: "11:07 UTC" },
  { id: "PS", name: "PlanetScope", orbit: "SSO", altitude: 475, revisit: "Daily", status: "active", nextPass: "09:55 UTC" },
  { id: "WV3", name: "WorldView-3", orbit: "SSO", altitude: 617, revisit: "< 1 day", status: "active", nextPass: "13:38 UTC" },
  { id: "SKY", name: "SkySat", orbit: "SSO", altitude: 500, revisit: "Daily", status: "active", nextPass: "10:22 UTC" },
  { id: "SP6", name: "SPOT-6", orbit: "SSO", altitude: 694, revisit: "1 day", status: "standby", nextPass: "15:50 UTC" },
];

// Simulated task queue
const taskQueue = [
  { id: "TSK-001", target: "IRON CURTAIN", status: "delivered", satellite: "S2A", requestedAt: "2026-03-11 08:00", deliveredAt: "2026-03-11 14:23", cloud: 12 },
  { id: "TSK-002", target: "GREEN CANOPY", status: "capturing", satellite: "S2B", requestedAt: "2026-03-11 09:15", deliveredAt: null, cloud: 8 },
  { id: "TSK-003", target: "DEEP BLUE", status: "scheduled", satellite: "L9", requestedAt: "2026-03-11 10:30", deliveredAt: null, cloud: null },
  { id: "TSK-004", target: "WILD PULSE", status: "pending", satellite: null, requestedAt: "2026-03-11 11:00", deliveredAt: null, cloud: null },
];

const statusColours: Record<string, string> = {
  delivered: "text-accent",
  capturing: "text-intel",
  scheduled: "text-warning",
  pending: "text-text-dim",
};

export default function TaskingPage() {
  const [selectedTarget, setSelectedTarget] = useState<(typeof SCENARIOS)[number]>(SCENARIOS[0]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Satellite className="w-4 h-4 text-accent" />
          TASKING — Satellite Capture Scheduling
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim">
          Schedule captures as easily as booking a rideshare
        </span>
        <div className="ml-auto font-mono text-[10px] text-accent">
          {satellites.filter((s) => s.status === "active").length} SATELLITES ACTIVE
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — booking + queue */}
        <div className="w-96 border-r border-border bg-surface overflow-y-auto">
          {/* Booking form */}
          <div className="p-4 border-b border-border">
            <h2 className="font-mono text-xs font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent" />
              BOOK A CAPTURE
            </h2>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                  Target Location
                </label>
                <select
                  value={selectedTarget.slug}
                  onChange={(e) => {
                    const s = SCENARIOS.find((sc) => sc.slug === e.target.value);
                    if (s) setSelectedTarget(s);
                  }}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border font-mono text-sm text-foreground"
                >
                  {SCENARIOS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} — {s.sector}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                    Latitude
                  </label>
                  <div className="px-3 py-2 rounded-md bg-background border border-border font-mono text-xs text-foreground">
                    {selectedTarget.center[1].toFixed(6)}°
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                    Longitude
                  </label>
                  <div className="px-3 py-2 rounded-md bg-background border border-border font-mono text-xs text-foreground">
                    {selectedTarget.center[0].toFixed(6)}°
                  </div>
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                  Capture Window
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border">
                  <Clock className="w-3.5 h-3.5 text-text-dim" />
                  <span className="font-mono text-xs text-accent">
                    Next available: Tomorrow 14:23 UTC (Sentinel-2A)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                    Imagery Type
                  </label>
                  <select className="w-full px-3 py-2 rounded-md bg-background border border-border font-mono text-xs text-foreground">
                    <option>Optical (RGB)</option>
                    <option>NDVI</option>
                    <option>SAR</option>
                    <option>Infrared</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                    Max Cloud %
                  </label>
                  <select className="w-full px-3 py-2 rounded-md bg-background border border-border font-mono text-xs text-foreground">
                    <option>30%</option>
                    <option>20%</option>
                    <option>10%</option>
                    <option>5%</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-3 bg-accent text-background font-mono text-xs font-bold rounded-lg hover:bg-accent-dim transition-colors uppercase tracking-wider">
                Request Capture
              </button>
            </div>
          </div>

          {/* Task queue */}
          <div className="p-4">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
              Capture Queue
            </h3>
            <div className="space-y-2">
              {taskQueue.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border bg-elevated hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-text-dim">{task.id}</span>
                    <span className={`font-mono text-[10px] uppercase ${statusColours[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-foreground mb-1">
                    {task.target}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-text-dim">
                    {task.satellite && (
                      <span className="flex items-center gap-1">
                        <Satellite className="w-3 h-3" /> {task.satellite}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.requestedAt.split(" ")[1]}
                    </span>
                    {task.cloud !== null && (
                      <span className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" /> {task.cloud}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center — map */}
        <div className="flex-1 relative">
          <MapContainer
            center={selectedTarget.center as [number, number]}
            zoom={selectedTarget.zoom - 2}
          />
          {/* Target marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-16 h-16 border-2 border-accent/60 rounded-full flex items-center justify-center animate-halo-pulse">
              <div className="w-2 h-2 bg-accent rounded-full" />
            </div>
          </div>
          <div className="absolute top-3 left-3 px-3 py-2 rounded bg-background/80 backdrop-blur-sm border border-border">
            <div className="font-mono text-[10px] text-accent">TARGET: {selectedTarget.name}</div>
            <div className="font-mono text-[10px] text-text-dim">
              {selectedTarget.center[1].toFixed(4)}°N, {Math.abs(selectedTarget.center[0]).toFixed(4)}°{selectedTarget.center[0] >= 0 ? "E" : "W"}
            </div>
          </div>
        </div>

        {/* Right panel — constellation */}
        <div className="w-72 border-l border-border bg-surface overflow-y-auto">
          <div className="p-4">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
              <Orbit className="w-3.5 h-3.5 text-intel" />
              Constellation
            </h3>
            <div className="space-y-2">
              {satellites.map((sat) => (
                <div
                  key={sat.id}
                  className="p-3 rounded-lg border border-border bg-elevated"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {sat.name}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${sat.status === "active" ? "bg-accent" : "bg-warning"}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 font-mono text-[10px] text-text-dim">
                    <div>Alt: {sat.altitude}km</div>
                    <div>Revisit: {sat.revisit}</div>
                    <div>Orbit: {sat.orbit}</div>
                    <div className="text-accent">Next: {sat.nextPass}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Patent note */}
            <div className="mt-4 p-3 rounded-lg border border-accent/20 bg-accent/5">
              <div className="font-mono text-[10px] text-accent font-bold mb-1">
                AUTOMATED TASKING
              </div>
              <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                Patent claim: &quot;Automated satellite tasking coordinated with ground
                IoT devices&quot; — end-to-end control from satellite to sensor to screen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
