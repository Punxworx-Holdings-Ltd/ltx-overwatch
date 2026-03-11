"use client";

import { use, useState } from "react";
import dynamic from "next/dynamic";
import { SCENARIOS } from "@/lib/utils/constants";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Radio, Shield, ChevronDown, ChevronUp, Camera } from "lucide-react";
import Link from "next/link";
import type { FusionEntity } from "@/types";
import { CCTVOverlay } from "@/components/map/cctv-overlay";

const FusionViewport = dynamic(
  () => import("@/components/map/fusion-viewport"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-halo-pulse" />
          <span className="font-mono text-sm text-text-muted">
            INITIALISING FUSION ENGINE...
          </span>
        </div>
      </div>
    ),
  }
);

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const scenario = SCENARIOS.find((s) => s.slug === slug);
  const [selectedEntity, setSelectedEntity] = useState<FusionEntity | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [showCCTV, setShowCCTV] = useState(true);

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
            SATELLITE + IoT FUSION
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-friendly" />
            US 10,951,814 B2
          </div>
          <button
            onClick={() => setShowCCTV(!showCCTV)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              showCCTV
                ? "text-accent bg-accent/10"
                : "text-text-dim hover:text-foreground"
            }`}
          >
            <Camera className="w-3 h-3" />
            <span className="font-mono text-[10px]">CCTV</span>
          </button>
        </div>
      </div>

      {/* Map with live fusion rendering */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <FusionViewport
            scenario={scenario.slug}
            center={scenario.center as [number, number]}
            zoom={scenario.zoom}
            pitch={45}
            bearing={-15}
            onEntitySelect={setSelectedEntity}
          />

          {/* CCTV Overlay */}
          <CCTVOverlay scenario={scenario.slug} enabled={showCCTV} />

          {/* Scenario info overlay */}
          <div className="absolute bottom-14 left-2 max-w-xs p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border z-30">
            <h3 className="font-mono text-[10px] font-bold text-foreground tracking-wide mb-1">
              {scenario.name}
            </h3>
            <p className="text-[10px] text-text-muted leading-relaxed">
              {scenario.description}
            </p>
          </div>
        </div>

        {/* Entity data panel */}
        {showPanel && (
          <div className="w-72 border-l border-border bg-surface overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase">
                Live IoT Feed
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 rounded hover:bg-elevated transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5 text-text-dim" />
              </button>
            </div>
            <div className="flex-1 p-3">
              <div className="font-mono text-[10px] text-text-dim mb-3">
                IoT data rendered WITHIN satellite imagery via patented GPS-to-pixel
                compositing. Entities appear at exact pixel positions — not as map pins.
              </div>
              <div className="p-3 rounded border border-accent/20 bg-accent/5 mb-3">
                <div className="font-mono text-[10px] text-accent font-bold mb-1">
                  PATENT ACTIVE
                </div>
                <div className="font-mono text-[10px] text-text-dim">
                  US 10,951,814 B2 — GPS-to-pixel coordinate conversion compositing
                  IoT data INTO satellite imagery in real-time.
                </div>
              </div>
              {selectedEntity && (
                <EntityDetail entity={selectedEntity} />
              )}
            </div>
          </div>
        )}

        {!showPanel && (
          <button
            onClick={() => setShowPanel(true)}
            className="absolute top-16 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-elevated transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-text-dim" />
          </button>
        )}
      </div>
    </div>
  );
}

function EntityDetail({ entity }: { entity: FusionEntity }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-elevated">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            entity.status === "friendly"
              ? "bg-accent"
              : entity.status === "threat"
                ? "bg-threat"
                : entity.status === "alert"
                  ? "bg-warning"
                  : "bg-neutral"
          } animate-halo-pulse`}
        />
        <span className="font-mono text-xs font-bold text-foreground">
          {entity.entityId}
        </span>
      </div>
      <div className="space-y-1 font-mono text-[10px] text-text-dim">
        <div>Type: {entity.entityType}</div>
        <div>Device: {entity.deviceType}</div>
        <div>
          Pos: {entity.currentPosition[1].toFixed(6)}°N,{" "}
          {entity.currentPosition[0].toFixed(6)}°E
        </div>
        <div>Heading: {entity.heading.toFixed(0)}° | Speed: {entity.speed.toFixed(1)}</div>
        <div>Confidence: {(entity.confidence * 100).toFixed(0)}%</div>
      </div>
      {Object.keys(entity.latestPayload).length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-1">
            Sensor Data
          </div>
          <div className="space-y-0.5 font-mono text-[10px]">
            {Object.entries(entity.latestPayload)
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-text-dim">{key.replace(/_/g, " ")}</span>
                  <span className="text-foreground">{String(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
