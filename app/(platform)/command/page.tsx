"use client";

import dynamic from "next/dynamic";
import { Satellite, Radio, Shield, Activity } from "lucide-react";
import { SCENARIOS } from "@/lib/utils/constants";
import Link from "next/link";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-halo-pulse" />
        <span className="font-mono text-sm text-text-muted">
          INITIALISING SATELLITE FEED...
        </span>
      </div>
    </div>
  ),
});

const stats = [
  { label: "Active Scenarios", value: "6", icon: Shield, color: "text-accent" },
  { label: "IoT Devices", value: "128", icon: Radio, color: "text-intel" },
  { label: "Satellites Tracked", value: "24", icon: Satellite, color: "text-warning" },
  { label: "Alerts Active", value: "3", icon: Activity, color: "text-threat" },
];

export default function CommandPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase">
          OVERWATCH COMMAND
        </span>
        <div className="h-4 w-px bg-border" />
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            <span className="font-mono text-xs text-foreground">
              {stat.value}
            </span>
            <span className="font-mono text-[10px] text-text-dim">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Map + scenario panel */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer />
        </div>

        {/* Scenario panel */}
        <div className="w-72 border-l border-border bg-surface overflow-y-auto">
          <div className="p-4">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-4">
              Active Missions
            </h3>
            <div className="space-y-2">
              {SCENARIOS.map((scenario) => (
                <Link
                  key={scenario.slug}
                  href={`/scenarios/${scenario.slug}`}
                  className="block p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-foreground tracking-wide">
                      {scenario.name}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
                  </div>
                  <span className="font-mono text-[10px] text-text-dim">
                    {scenario.sector}
                  </span>
                  <div className="font-mono text-[10px] text-text-dim mt-1">
                    {scenario.center[1].toFixed(4)}°N,{" "}
                    {Math.abs(scenario.center[0]).toFixed(4)}°
                    {scenario.center[0] >= 0 ? "E" : "W"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
