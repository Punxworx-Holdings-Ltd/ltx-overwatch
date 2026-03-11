"use client";

import { useState } from "react";
import { Brain, Eye, GitCompare, Clock, Layers, Target, BarChart3, Cpu, Scan, Crosshair } from "lucide-react";

const detectionResults = [
  { class: "Vehicle", count: 47, confidence: 0.94, change: "+3" },
  { class: "Building", count: 312, confidence: 0.97, change: "0" },
  { class: "Person", count: 23, confidence: 0.82, change: "+8" },
  { class: "Vessel", count: 18, confidence: 0.91, change: "-2" },
  { class: "Aircraft", count: 4, confidence: 0.88, change: "+1" },
  { class: "Infrastructure", count: 156, confidence: 0.96, change: "0" },
  { class: "Vegetation change", count: 89, confidence: 0.85, change: "+12" },
  { class: "Water body", count: 34, confidence: 0.93, change: "0" },
];

const changeEvents = [
  {
    id: "CHG-001",
    type: "Construction",
    location: "33.301°N, 44.302°E",
    scenario: "IRON CURTAIN",
    detected: "2026-03-10",
    confidence: 0.91,
    description: "New structure detected — 45m² footprint, not present in previous capture",
  },
  {
    id: "CHG-002",
    type: "Vegetation Loss",
    location: "52.498°N, 0.512°E",
    scenario: "GREEN CANOPY",
    detected: "2026-03-09",
    confidence: 0.87,
    description: "NDVI drop of 0.3 in Field F4 — potential crop disease or drought stress",
  },
  {
    id: "CHG-003",
    type: "Maritime Activity",
    location: "57.147°N, 2.068°W",
    scenario: "DEEP BLUE",
    detected: "2026-03-11",
    confidence: 0.83,
    description: "Unusual vessel clustering — 5 vessels in 200m radius, atypical for this area",
  },
  {
    id: "CHG-004",
    type: "Pipeline Anomaly",
    location: "57.510°N, 1.790°W",
    scenario: "BLACK GOLD",
    detected: "2026-03-11",
    confidence: 0.79,
    description: "Thermal signature anomaly along pipeline segment S3 — potential surface leak",
  },
];

export default function LtmPage() {
  const [activeTab, setActiveTab] = useState<"detection" | "change" | "temporal">("detection");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          LTM — Large Terrestrial Model
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim">
          AI-powered analysis combining satellite + IoT for decision intelligence
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[10px] text-accent">MODEL ACTIVE</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface/30">
        {[
          { key: "detection", label: "Object Detection", icon: Eye },
          { key: "change", label: "Change Detection", icon: GitCompare },
          { key: "temporal", label: "Temporal Analysis", icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-colors ${
              activeTab === key
                ? "bg-accent/10 text-accent border border-accent/30"
                : "text-text-dim hover:text-foreground hover:bg-elevated"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "detection" && (
          <div className="max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detection stats */}
              <div className="lg:col-span-2">
                <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-4 flex items-center gap-2">
                  <Scan className="w-3.5 h-3.5 text-accent" />
                  Detection Results — Latest Capture
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {detectionResults.map((item) => (
                    <div
                      key={item.class}
                      className="p-3 rounded-lg border border-border bg-elevated"
                    >
                      <div className="font-mono text-[10px] text-text-dim uppercase mb-1">
                        {item.class}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xl font-bold text-foreground">
                          {item.count}
                        </span>
                        <span
                          className={`font-mono text-[10px] ${
                            item.change.startsWith("+")
                              ? "text-accent"
                              : item.change.startsWith("-")
                                ? "text-threat"
                                : "text-text-dim"
                          }`}
                        >
                          {item.change}
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <div className="font-mono text-[9px] text-text-dim mt-0.5">
                          {(item.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detection image placeholder */}
                <div className="h-64 rounded-lg border border-border bg-background flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-intel/5" />
                  <div className="text-center relative z-10">
                    <Crosshair className="w-8 h-8 text-accent/30 mx-auto mb-2" />
                    <p className="font-mono text-xs text-text-dim">
                      AI OBJECT DETECTION OVERLAY
                    </p>
                    <p className="font-mono text-[10px] text-text-dim mt-1">
                      Bounding boxes rendered on satellite imagery
                    </p>
                  </div>
                </div>
              </div>

              {/* Model info panel */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-elevated">
                  <h4 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                    Model Info
                  </h4>
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-text-dim">Architecture</span>
                      <span className="text-foreground">YOLOv8-SAT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Parameters</span>
                      <span className="text-foreground">68M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Input Resolution</span>
                      <span className="text-foreground">1024×1024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Classes</span>
                      <span className="text-foreground">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">mAP@0.5</span>
                      <span className="text-accent">0.891</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Inference</span>
                      <span className="text-foreground">23ms/tile</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                  <div className="font-mono text-[10px] text-accent font-bold mb-1">
                    LTM vs COMPETITORS
                  </div>
                  <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                    AI classifies objects from satellite imagery alone. LTM
                    <span className="text-accent"> identifies</span> them by fusing
                    IoT data with AI detection. A vehicle isn&apos;t just &quot;vehicle&quot; —
                    it&apos;s &quot;HMWV-03, Bravo Team, 45km/h, engine temp 88°C&quot;.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-elevated">
                  <h4 className="font-mono text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-intel" />
                    Processing Stats
                  </h4>
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-text-dim">Tiles processed</span>
                      <span className="text-foreground">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Objects detected</span>
                      <span className="text-foreground">683</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">IoT matches</span>
                      <span className="text-accent">128 (100%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Unmatched objects</span>
                      <span className="text-warning">555</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "change" && (
          <div className="max-w-4xl">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-4 flex items-center gap-2">
              <GitCompare className="w-3.5 h-3.5 text-intel" />
              Change Events — Last 7 Days
            </h3>
            <div className="space-y-3">
              {changeEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-border bg-elevated hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] text-text-dim">{event.id}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-intel/20 text-intel uppercase">
                      {event.type}
                    </span>
                    <span className="font-mono text-[10px] text-text-dim">{event.scenario}</span>
                    <div className="ml-auto font-mono text-[10px] text-text-dim">
                      {(event.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 font-mono text-[10px] text-text-dim">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {event.detected}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "temporal" && (
          <div className="max-w-4xl">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-warning" />
              Temporal Playback
            </h3>
            <div className="p-6 rounded-lg border border-border bg-elevated mb-6">
              <div className="h-64 rounded-lg bg-background border border-border flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-intel/5 to-accent/5" />
                <div className="text-center relative z-10">
                  <Layers className="w-8 h-8 text-intel/30 mx-auto mb-2" />
                  <p className="font-mono text-xs text-text-dim">TEMPORAL SCRUBBER</p>
                  <p className="font-mono text-[10px] text-text-dim mt-1">
                    Scrub through satellite captures over time with IoT data overlay
                  </p>
                </div>
              </div>

              {/* Timeline scrubber */}
              <div className="mt-4">
                <div className="flex items-center justify-between font-mono text-[10px] text-text-dim mb-2">
                  <span>2026-02-11</span>
                  <span className="text-accent">2026-03-11 (Now)</span>
                </div>
                <div className="relative h-6 rounded-full bg-background border border-border overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-intel/20 to-accent/20" style={{ width: "100%" }} />
                  {/* Capture dots */}
                  {[15, 25, 35, 50, 65, 75, 85, 95].map((pos) => (
                    <div
                      key={pos}
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent/60"
                      style={{ left: `${pos}%` }}
                    />
                  ))}
                  {/* Playhead */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-accent"
                    style={{ left: "95%" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-[10px] text-text-dim">8 captures available</span>
                  <span className="font-mono text-[10px] text-accent">IoT data: 128 devices tracked</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
              <div className="font-mono text-[10px] text-accent font-bold mb-1">
                TEMPORAL + IoT = TRUTH
              </div>
              <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                Competitors scrub satellite images over time. LTx OVERWATCH scrubs satellite images
                with synchronised IoT data — see exactly where every tracked entity was at every point
                in time, verified by both space and ground data. Patent-protected fusion methodology.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
