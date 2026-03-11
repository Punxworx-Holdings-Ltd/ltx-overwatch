"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { SCENARIOS } from "@/lib/utils/constants";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Radio, Shield } from "lucide-react";
import Link from "next/link";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-halo-pulse" />
        <span className="font-mono text-sm text-text-muted">
          LOADING SATELLITE IMAGERY...
        </span>
      </div>
    </div>
  ),
});

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const scenario = SCENARIOS.find((s) => s.slug === slug);

  if (!scenario) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scenario header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <Link
          href="/scenarios"
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-dim" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground tracking-wide">
              {scenario.name}
            </span>
            <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
          </div>
          <span className="font-mono text-[10px] text-text-dim">
            {scenario.sector}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-4 font-mono text-[10px] text-text-dim">
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-accent" />
            IoT STREAM ACTIVE
          </div>
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-intel" />
            OPTICAL
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-friendly" />
            GEOFENCES ON
          </div>
        </div>
      </div>

      {/* Map with fusion overlay */}
      <div className="flex-1 relative">
        <MapContainer
          center={scenario.center as [number, number]}
          zoom={scenario.zoom}
          pitch={45}
          bearing={-15}
        />

        {/* Scenario info overlay */}
        <div className="absolute top-4 left-4 max-w-xs p-4 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
          <h3 className="font-mono text-xs font-bold text-foreground tracking-wide mb-1">
            {scenario.name}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            {scenario.description}
          </p>
          <div className="font-mono text-[10px] text-text-dim">
            {scenario.center[1].toFixed(6)}°N,{" "}
            {Math.abs(scenario.center[0]).toFixed(6)}°
            {scenario.center[0] >= 0 ? "E" : "W"} &middot; Z{scenario.zoom}
          </div>
        </div>

        {/* IoT data panel placeholder */}
        <div className="absolute top-4 right-4 w-64 p-4 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
          <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
            Live IoT Feed
          </h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded bg-surface border border-border"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    i === 1
                      ? "bg-accent"
                      : i === 2
                        ? "bg-intel"
                        : "bg-warning"
                  } animate-halo-pulse`}
                />
                <div className="flex-1">
                  <div className="font-mono text-[10px] text-foreground">
                    {i === 1
                      ? "ALPHA-01"
                      : i === 2
                        ? "BRAVO-03"
                        : "SENSOR-12"}
                  </div>
                  <div className="font-mono text-[10px] text-text-dim">
                    {i === 1
                      ? "HR: 72 | Temp: 36.8°C"
                      : i === 2
                        ? "Speed: 45 km/h | Heading: 127°"
                        : "Moisture: 34% | pH: 6.5"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-accent mt-3">
            FUSION ENGINE: Phase 5 will render IoT data WITHIN satellite imagery
          </p>
        </div>
      </div>
    </div>
  );
}
