"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Satellite,
  Radio,
  Shield,
  Activity,
  AlertTriangle,
  Globe2,
  Zap,
  Eye,
  Clock,
  ChevronRight,
  Cpu,
  Plane,
  TrendingUp,
} from "lucide-react";
import { SCENARIOS, PATENT } from "@/lib/utils/constants";
import Link from "next/link";
import {
  VisualModeSelector,
  VisualModeOverlay,
  type VisualMode,
} from "@/components/map/visual-modes";
import { HudOverlay } from "@/components/map/hud-overlay";
import { SatelliteOrbitOverlay, SatelliteConstellationPanel } from "@/components/map/satellite-orbits";
import { LiveFlightOverlay } from "@/components/map/live-flights";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-halo-pulse" />
        <span className="font-mono text-sm text-text-muted">
          INITIALISING GLOBAL VIEW...
        </span>
      </div>
    </div>
  ),
});

// Live clock component
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

// Simulated live metrics that tick
function useTickingMetrics() {
  const [metrics, setMetrics] = useState({
    devices: 128,
    readings: 14847,
    alerts: 5,
    uptime: 99.97,
    satellites: 8,
    tiles: 2847,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        readings: prev.readings + Math.floor(Math.random() * 4) + 1,
        tiles: prev.tiles + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return metrics;
}

// Recent alert data
const recentAlerts = [
  {
    id: "ALT-001",
    severity: "critical" as const,
    title: "Unauthorised entity in EXCLUSION ZONE Alpha",
    scenario: "IRON CURTAIN",
    time: "45s ago",
  },
  {
    id: "ALT-002",
    severity: "critical" as const,
    title: "Pipeline pressure anomaly — Segment S3",
    scenario: "BLACK GOLD",
    time: "2m ago",
  },
  {
    id: "ALT-003",
    severity: "high" as const,
    title: "Elevated heart rate — Survivor CIV-026",
    scenario: "FIRST LIGHT",
    time: "3m ago",
  },
  {
    id: "ALT-004",
    severity: "high" as const,
    title: "Unidentified vessel entering restricted zone",
    scenario: "DEEP BLUE",
    time: "5m ago",
  },
  {
    id: "ALT-005",
    severity: "medium" as const,
    title: "Rhino RHI-003 near park boundary",
    scenario: "WILD PULSE",
    time: "7m ago",
  },
];

const severityColors = {
  critical: "text-threat",
  high: "text-warning",
  medium: "text-intel",
  low: "text-text-dim",
};

const severityBg = {
  critical: "bg-threat/20",
  high: "bg-warning/20",
  medium: "bg-intel/20",
  low: "bg-text-dim/20",
};

// Scenario device counts
const scenarioDevices: Record<string, number> = {
  "iron-curtain": 20,
  "green-canopy": 30,
  "first-light": 42,
  "deep-blue": 18,
  "wild-pulse": 20,
  "black-gold": 24,
};

export default function CommandPage() {
  const metrics = useTickingMetrics();
  const [visualMode, setVisualMode] = useState<VisualMode>("standard");
  const [showSatellites, setShowSatellites] = useState(true);
  const [showFlights, setShowFlights] = useState(true);
  const [viewState, setViewState] = useState({
    latitude: 25,
    longitude: 20,
    zoom: 2.2,
    pitch: 0,
    bearing: 0,
  });

  const handleViewStateChange = useCallback(
    (vs: {
      latitude: number;
      longitude: number;
      zoom: number;
      pitch: number;
      bearing: number;
    }) => {
      setViewState(vs);
    },
    []
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-accent" />
          OVERWATCH COMMAND
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim">
          Global situational awareness — all sectors
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setShowSatellites(!showSatellites)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-mono text-[10px] ${
              showSatellites
                ? "text-warning bg-warning/10"
                : "text-text-dim hover:text-foreground"
            }`}
          >
            <Satellite className="w-3 h-3" />
            SAT
          </button>
          <button
            onClick={() => setShowFlights(!showFlights)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-mono text-[10px] ${
              showFlights
                ? "text-intel bg-intel/10"
                : "text-text-dim hover:text-foreground"
            }`}
          >
            <Plane className="w-3 h-3" />
            ADS-B
          </button>
          <VisualModeSelector
            activeMode={visualMode}
            onModeChange={setVisualMode}
            compact
          />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
            <span className="font-mono text-[10px] text-accent">LIVE</span>
          </div>
          <div className="font-mono text-[10px] text-text-dim flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <LiveClock /> UTC
          </div>
        </div>
      </div>

      {/* Metrics bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface/30">
        {[
          {
            label: "ACTIVE MISSIONS",
            value: "6",
            icon: Shield,
            color: "text-accent",
          },
          {
            label: "IoT DEVICES",
            value: metrics.devices.toString(),
            icon: Radio,
            color: "text-intel",
          },
          {
            label: "READINGS",
            value: metrics.readings.toLocaleString(),
            icon: Activity,
            color: "text-accent",
          },
          {
            label: "SATELLITES",
            value: metrics.satellites.toString(),
            icon: Satellite,
            color: "text-warning",
          },
          {
            label: "ALERTS",
            value: metrics.alerts.toString(),
            icon: AlertTriangle,
            color: "text-threat",
          },
          {
            label: "UPTIME",
            value: `${metrics.uptime}%`,
            icon: TrendingUp,
            color: "text-friendly",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated/50"
          >
            <stat.icon className={`w-3 h-3 ${stat.color}`} />
            <span className="font-mono text-xs font-bold text-foreground tabular-nums">
              {stat.value}
            </span>
            <span className="font-mono text-[9px] text-text-dim tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Globe / map view */}
        <div className="flex-1 relative">
          <VisualModeOverlay mode={visualMode}>
            <MapContainer
              center={[20, 25]}
              zoom={2.2}
              pitch={0}
              bearing={0}
              onViewStateChange={handleViewStateChange}
            >
              {/* Live satellite constellation */}
              <SatelliteOrbitOverlay enabled={showSatellites} />
              {/* Live ADS-B flight tracking */}
              <LiveFlightOverlay
                bbox={[-30, -10, 60, 65]}
                enabled={showFlights}
              />
            </MapContainer>
          </VisualModeOverlay>
          <HudOverlay
            lat={viewState.latitude}
            lng={viewState.longitude}
            zoom={viewState.zoom}
            bearing={viewState.bearing}
            pitch={viewState.pitch}
            entityCount={metrics.devices}
            mode={visualMode}
          />

          {/* Mission zone markers overlaid on globe */}
          {SCENARIOS.map((s, i) => {
            // Convert scenario coords to rough viewport percentage for overlay markers
            // These are decorative — real interaction is via the sidebar
            const positions = [
              { top: "38%", left: "55%" }, // IRON CURTAIN (Baghdad)
              { top: "22%", left: "48%" }, // GREEN CANOPY (East Anglia)
              { top: "38%", left: "54%" }, // FIRST LIGHT (Turkey)
              { top: "20%", left: "47%" }, // DEEP BLUE (Aberdeen)
              { top: "55%", left: "55%" }, // WILD PULSE (Kenya)
              { top: "20%", left: "47%" }, // BLACK GOLD (North Sea)
            ];
            return (
              <Link
                key={s.slug}
                href={`/scenarios/${s.slug}`}
                className="absolute group"
                style={{ top: positions[i].top, left: positions[i].left }}
              >
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-accent/40 animate-halo-pulse flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="px-2 py-1 rounded bg-background/90 border border-border">
                      <span className="font-mono text-[10px] text-accent">
                        {s.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Patent callout */}
          <div className="absolute bottom-12 left-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/20 max-w-xs">
            <div className="font-mono text-[10px] text-accent font-bold mb-0.5">
              PATENT {PATENT.number}
            </div>
            <div className="font-mono text-[10px] text-text-dim">
              IoT data fused INTO satellite imagery — not ON a map.
              Protected across US, CN, JP, KR.
            </div>
          </div>
        </div>

        {/* Right panel — missions + alerts */}
        <div className="w-80 border-l border-border bg-surface overflow-y-auto">
          {/* Mission status */}
          <div className="p-4 border-b border-border">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Active Missions
            </h3>
            <div className="space-y-2">
              {SCENARIOS.map((scenario) => (
                <Link
                  key={scenario.slug}
                  href={`/scenarios/${scenario.slug}`}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[11px] font-bold text-foreground tracking-wide">
                        {scenario.name}
                      </span>
                      <ChevronRight className="w-3 h-3 text-text-dim group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-text-dim">
                        {scenario.sector}
                      </span>
                      <span className="font-mono text-[9px] text-accent">
                        {scenarioDevices[scenario.slug]} devices
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-threat" />
                Recent Alerts
              </h3>
              <Link
                href="/alerts"
                className="font-mono text-[10px] text-accent hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2.5 rounded-lg border border-border bg-elevated hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase ${severityBg[alert.severity]} ${severityColors[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[9px] text-text-dim">
                      {alert.scenario}
                    </span>
                    <span className="font-mono text-[9px] text-text-dim ml-auto">
                      {alert.time}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground leading-relaxed">
                    {alert.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Satellite Constellation */}
          {showSatellites && (
            <div className="p-4 border-b border-border">
              <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
                <Satellite className="w-3.5 h-3.5 text-warning" />
                Satellite Constellation
              </h3>
              <SatelliteConstellationPanel compact />
            </div>
          )}

          {/* System status */}
          <div className="p-4">
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-intel" />
              System Status
            </h3>
            <div className="space-y-2 font-mono text-[10px]">
              {[
                {
                  label: "Fusion Engine",
                  status: "NOMINAL",
                  color: "text-accent",
                },
                {
                  label: "IoT Stream",
                  status: "ACTIVE",
                  color: "text-accent",
                },
                {
                  label: "Sentinel Hub",
                  status: "CONNECTED",
                  color: "text-accent",
                },
                {
                  label: "LTM Model",
                  status: "READY",
                  color: "text-accent",
                },
                {
                  label: "Satellite Tasking",
                  status: "STANDBY",
                  color: "text-warning",
                },
                {
                  label: "Geofence Engine",
                  status: "ACTIVE",
                  color: "text-accent",
                },
              ].map((sys) => (
                <div
                  key={sys.label}
                  className="flex items-center justify-between p-2 rounded bg-elevated"
                >
                  <span className="text-text-dim">{sys.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${sys.color === "text-accent" ? "bg-accent" : "bg-warning"}`}
                    />
                    <span className={sys.color}>{sys.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tiles processed */}
            <div className="mt-4 p-3 rounded-lg border border-accent/20 bg-accent/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-dim font-mono">
                  TILES PROCESSED
                </span>
                <span className="text-xs font-bold text-accent font-mono tabular-nums">
                  {metrics.tiles.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-dim font-mono">
                  IoT READINGS/SEC
                </span>
                <span className="text-xs font-bold text-intel font-mono">
                  64
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-dim font-mono">
                  FUSION LATENCY
                </span>
                <span className="text-xs font-bold text-accent font-mono">
                  23ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
