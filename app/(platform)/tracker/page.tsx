"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Smartphone,
  MapPin,
  Crosshair,
  Zap,
  Copy,
  Check,
  Radio,
  Navigation,
  Watch,
  Shield,
  Gauge,
  Activity,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  VisualModeSelector,
  VisualModeOverlay,
  type VisualMode,
} from "@/components/map/visual-modes";
import { HudOverlay } from "@/components/map/hud-overlay";
import { PATENT } from "@/lib/utils/constants";

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-halo-pulse" />
        <span className="font-mono text-sm text-text-muted">
          AWAITING DEVICE LOCATION...
        </span>
      </div>
    </div>
  ),
});

interface TrackingState {
  status: "idle" | "requesting" | "tracking" | "error";
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  history: { lat: number; lng: number; timestamp: number }[];
  error?: string;
}

export default function TrackerPage() {
  const [tracking, setTracking] = useState<TrackingState>({
    status: "idle",
    lat: 0,
    lng: 0,
    accuracy: 0,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: 0,
    history: [],
  });
  const [visualMode, setVisualMode] = useState<VisualMode>("standard");
  const [viewState, setViewState] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    zoom: 3,
    pitch: 45,
    bearing: 0,
  });
  const [followMode, setFollowMode] = useState(true);
  const [readingCount, setReadingCount] = useState(0);
  const [deviceId] = useState(
    () => `DEVICE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  );
  const [copied, setCopied] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"closed" | "peek" | "full">(
    "peek"
  );
  const watchIdRef = useRef<number | null>(null);

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

  // Start geolocation tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setTracking((prev) => ({
        ...prev,
        status: "error",
        error: "Geolocation not supported by your browser",
      }));
      return;
    }

    setTracking((prev) => ({ ...prev, status: "requesting" }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } =
          position.coords;

        setTracking((prev) => {
          const newHistory = [
            ...prev.history,
            { lat: latitude, lng: longitude, timestamp: Date.now() },
          ].slice(-200);

          return {
            status: "tracking",
            lat: latitude,
            lng: longitude,
            accuracy,
            altitude,
            heading,
            speed,
            timestamp: Date.now(),
            history: newHistory,
          };
        });

        setReadingCount((c) => c + 1);

        fetch("/api/iot/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: "demo_live_tracker",
            device_id: deviceId,
            device_type: "gps_tracker",
            entity_type: "person",
            entity_id: deviceId,
            lng: longitude,
            lat: latitude,
            payload: {
              accuracy_m: accuracy,
              altitude_m: altitude,
              heading_deg: heading,
              speed_ms: speed,
              source: "browser_geolocation",
              user_agent: navigator.userAgent,
            },
          }),
        }).catch(() => {});
      },
      (error) => {
        setTracking((prev) => ({
          ...prev,
          status: "error",
          error:
            error.code === 1
              ? "Location permission denied. Please allow location access."
              : error.code === 2
                ? "Location unavailable. Check GPS settings."
                : "Location request timed out.",
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }, [deviceId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking((prev) => ({ ...prev, status: "idle" }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tracking.status === "tracking" && followMode) {
      setViewState((prev) => ({
        ...prev,
        latitude: tracking.lat,
        longitude: tracking.lng,
        zoom: Math.max(prev.zoom, 16),
      }));
    }
  }, [tracking.lat, tracking.lng, tracking.status, followMode]);

  const copyDeviceId = useCallback(() => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [deviceId]);

  const curlCommand = `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://ltx-overwatch.vercel.app"}/api/iot/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "${deviceId}",
    "device_type": "gps_tracker",
    "entity_type": "person",
    "lng": ${tracking.lng.toFixed(6)},
    "lat": ${tracking.lat.toFixed(6)},
    "payload": { "source": "manual" }
  }'`;

  // Shared panel content — used in both desktop sidebar and mobile bottom sheet
  const PanelContent = () => (
    <div className="p-4">
      {/* Track My Device button */}
      <div className="mb-6">
        <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-accent" />
          Track My Device
        </h3>

        {tracking.status === "idle" && (
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-text-dim leading-relaxed">
              Share your device&apos;s GPS location to see yourself fused INTO
              real satellite imagery in real-time. This is the patent in action
              with YOUR data.
            </p>
            <button
              onClick={startTracking}
              className="w-full py-3 px-4 rounded-lg bg-accent text-background font-mono text-xs font-bold tracking-wider hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              START LIVE TRACKING
            </button>
            <p className="font-mono text-[9px] text-text-dim/60 text-center">
              Requires location permission. Works on mobile, tablet & desktop.
            </p>
          </div>
        )}

        {tracking.status === "requesting" && (
          <div className="text-center py-6">
            <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin mx-auto mb-3" />
            <p className="font-mono text-[10px] text-text-dim">
              Requesting location permission...
            </p>
          </div>
        )}

        {tracking.status === "error" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-threat/30 bg-threat/10">
              <p className="font-mono text-[10px] text-threat">
                {tracking.error}
              </p>
            </div>
            <button
              onClick={startTracking}
              className="w-full py-2.5 px-4 rounded-lg border border-accent/30 text-accent font-mono text-[10px] font-bold tracking-wider hover:bg-accent/5 transition-colors active:scale-95"
            >
              RETRY
            </button>
          </div>
        )}

        {tracking.status === "tracking" && (
          <div className="space-y-3">
            <button
              onClick={stopTracking}
              className="w-full py-2.5 px-4 rounded-lg border border-threat/30 text-threat font-mono text-[10px] font-bold tracking-wider hover:bg-threat/5 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              STOP TRACKING
            </button>
            <button
              onClick={() => setFollowMode(!followMode)}
              className={`w-full py-2 px-4 rounded-lg border font-mono text-[10px] tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                followMode
                  ? "border-accent/30 text-accent bg-accent/5"
                  : "border-border text-text-dim hover:border-accent/20"
              }`}
            >
              <Navigation className="w-3 h-3" />
              {followMode ? "FOLLOW MODE ON" : "FOLLOW MODE OFF"}
            </button>
          </div>
        )}
      </div>

      {/* Live telemetry */}
      {tracking.status === "tracking" && (
        <>
          <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-intel" />
            Live Telemetry
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 mb-6">
            {[
              {
                label: "LAT",
                value: `${tracking.lat >= 0 ? "N" : "S"}${Math.abs(tracking.lat).toFixed(6)}°`,
                icon: MapPin,
                color: "text-accent",
              },
              {
                label: "LNG",
                value: `${tracking.lng >= 0 ? "E" : "W"}${Math.abs(tracking.lng).toFixed(6)}°`,
                icon: MapPin,
                color: "text-accent",
              },
              {
                label: "ACCURACY",
                value: `±${tracking.accuracy.toFixed(1)}m`,
                icon: Crosshair,
                color:
                  tracking.accuracy < 10
                    ? "text-friendly"
                    : tracking.accuracy < 30
                      ? "text-warning"
                      : "text-threat",
              },
              {
                label: "ALT",
                value: tracking.altitude
                  ? `${tracking.altitude.toFixed(1)}m`
                  : "—",
                icon: Activity,
                color: "text-intel",
              },
              {
                label: "SPEED",
                value: tracking.speed
                  ? `${(tracking.speed * 3.6).toFixed(1)} km/h`
                  : "0 km/h",
                icon: Gauge,
                color: "text-intel",
              },
              {
                label: "HEADING",
                value: tracking.heading
                  ? `${tracking.heading.toFixed(0)}°`
                  : "—",
                icon: Navigation,
                color: "text-intel",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2 rounded bg-elevated"
              >
                <div className="flex items-center gap-1.5">
                  <item.icon className="w-3 h-3 text-text-dim" />
                  <span className="font-mono text-[9px] text-text-dim tracking-wider">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10px] font-bold tabular-nums ${item.color}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Device ID */}
      <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3 flex items-center gap-2">
        <Watch className="w-3.5 h-3.5 text-warning" />
        Device Identity
      </h3>
      <div className="p-3 rounded-lg border border-border bg-elevated mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] text-text-dim">DEVICE ID</span>
          <button
            onClick={copyDeviceId}
            className="p-1 rounded hover:bg-background transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-accent" />
            ) : (
              <Copy className="w-3 h-3 text-text-dim" />
            )}
          </button>
        </div>
        <span className="font-mono text-xs text-accent font-bold break-all">
          {deviceId}
        </span>
      </div>

      {/* API Panel Toggle */}
      <button
        onClick={() => setShowApiPanel(!showApiPanel)}
        className="w-full mb-4 py-2 px-3 rounded-lg border border-border text-text-dim font-mono text-[10px] tracking-wider hover:border-accent/20 hover:text-accent transition-colors"
      >
        {showApiPanel ? "HIDE" : "SHOW"} API COMMAND
      </button>

      {showApiPanel && tracking.status === "tracking" && (
        <div className="mb-6 p-3 rounded-lg bg-[#0D1117] border border-border overflow-x-auto">
          <pre className="font-mono text-[9px] text-text-dim whitespace-pre-wrap break-all leading-relaxed">
            {curlCommand}
          </pre>
        </div>
      )}

      {/* Visual Modes — hidden on mobile (in header instead) */}
      <div className="hidden md:block">
        <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
          Display Mode
        </h3>
        <div className="mb-6">
          <VisualModeSelector
            activeMode={visualMode}
            onModeChange={setVisualMode}
          />
        </div>
      </div>

      {/* How it works */}
      <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[10px] text-accent font-bold">
            HOW THIS WORKS
          </span>
        </div>
        <div className="space-y-2 font-mono text-[10px] text-text-dim leading-relaxed">
          <p>
            1. Your device shares its GPS coordinates via the browser
            Geolocation API
          </p>
          <p>
            2. Coordinates are sent to our IoT ingest endpoint every update
            cycle
          </p>
          <p>
            3. Our patented GPS-to-pixel converter maps your position to the
            exact pixel within the satellite tile
          </p>
          <p>
            4. You appear IN the satellite imagery — not as a pin on a map, but
            fused into the image itself
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-accent/20">
          <div className="font-mono text-[10px] text-accent">
            {PATENT.number}
          </div>
          <div className="font-mono text-[9px] text-text-dim">
            GPS-to-pixel compositing — protected globally
          </div>
        </div>
      </div>

      {/* Additional devices */}
      <div className="mt-6 p-3 rounded-lg border border-border bg-elevated">
        <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-2">
          Connect More Devices
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed mb-3">
          Open this page on your phone, tablet, or smartwatch to track multiple
          devices simultaneously.
        </p>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-text-dim" />
          <Watch className="w-4 h-4 text-text-dim" />
          <span className="font-mono text-[9px] text-accent">
            Phone · Tablet · Watch
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header — responsive */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-[10px] sm:text-xs tracking-widest text-text-dim uppercase flex items-center gap-2 min-w-0">
          <Crosshair className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="hidden sm:inline">LIVE TRACKER — See Yourself From Space</span>
          <span className="sm:hidden">TRACKER</span>
        </span>
        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="hidden sm:block">
          <VisualModeSelector
            activeMode={visualMode}
            onModeChange={setVisualMode}
            compact
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {tracking.status === "tracking" && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
                <span className="font-mono text-[10px] text-accent">LIVE</span>
              </div>
              <span className="font-mono text-[10px] text-text-dim tabular-nums hidden sm:block">
                {readingCount} readings
              </span>
            </>
          )}

          {/* Mobile: start tracking button in header if idle */}
          {tracking.status === "idle" && (
            <button
              onClick={startTracking}
              className="md:hidden py-1.5 px-3 rounded-lg bg-accent text-background font-mono text-[10px] font-bold tracking-wider active:scale-95"
            >
              START
            </button>
          )}
        </div>
      </div>

      {/* Main content — desktop: side by side, mobile: stacked */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Map — takes full space, panel overlays on mobile */}
        <div className="flex-1 relative min-h-[300px]">
          <VisualModeOverlay mode={visualMode}>
            <MapContainer
              center={[viewState.longitude, viewState.latitude]}
              zoom={viewState.zoom}
              pitch={45}
              bearing={0}
              terrain
              onViewStateChange={handleViewStateChange}
            />
          </VisualModeOverlay>

          <HudOverlay
            lat={viewState.latitude}
            lng={viewState.longitude}
            zoom={viewState.zoom}
            bearing={viewState.bearing}
            pitch={viewState.pitch}
            entityCount={tracking.status === "tracking" ? 1 : 0}
            mode={`tracker + ${visualMode}`}
          />

          {/* GPS accuracy indicator */}
          {tracking.status === "tracking" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
              <div
                className="rounded-full border-2 border-accent/40 animate-ping absolute"
                style={{
                  width: `${Math.min(120, Math.max(24, tracking.accuracy))}px`,
                  height: `${Math.min(120, Math.max(24, tracking.accuracy))}px`,
                  top: `${-Math.min(60, Math.max(12, tracking.accuracy / 2))}px`,
                  left: `${-Math.min(60, Math.max(12, tracking.accuracy / 2))}px`,
                }}
              />
              <div className="w-4 h-4 rounded-full bg-accent shadow-lg shadow-accent/50 -ml-2 -mt-2 relative">
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />
              </div>
            </div>
          )}

          {/* Device badge — repositioned on mobile */}
          {tracking.status === "tracking" && (
            <div className="absolute top-14 left-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/30 z-30">
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                <Smartphone className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-accent" />
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-accent">
                  YOUR DEVICE
                </span>
              </div>
              <div className="font-mono text-[9px] sm:text-[10px] text-text-dim">
                ID: {deviceId}
              </div>
            </div>
          )}

          {/* Patent callout — hidden on mobile to save space */}
          <div className="hidden sm:block absolute bottom-14 left-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/20 max-w-xs z-30">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] text-accent font-bold">
                PATENT IN ACTION — LIVE
              </span>
            </div>
            <div className="font-mono text-[10px] text-text-dim leading-relaxed">
              Your device&apos;s GPS coordinates are being converted to exact
              pixel positions within the satellite imagery.
            </div>
          </div>

          {/* Mobile bottom sheet toggle */}
          <button
            onClick={() =>
              setMobilePanel((p) =>
                p === "closed" ? "peek" : p === "peek" ? "full" : "closed"
              )
            }
            className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center gap-2 active:scale-95"
          >
            {mobilePanel === "full" ? (
              <ChevronDown className="w-4 h-4 text-accent" />
            ) : (
              <ChevronUp className="w-4 h-4 text-accent" />
            )}
            <span className="font-mono text-[10px] text-text-dim">
              {tracking.status === "idle" ? "CONTROLS" : "TELEMETRY"}
            </span>
          </button>
        </div>

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block w-80 border-l border-border bg-surface overflow-y-auto">
          <PanelContent />
        </div>

        {/* Mobile bottom sheet — visible only on mobile */}
        <div
          className={`md:hidden absolute bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-2xl z-30 transition-transform duration-300 ease-out overflow-y-auto ${
            mobilePanel === "closed"
              ? "translate-y-full"
              : mobilePanel === "peek"
                ? "translate-y-0 max-h-[40vh]"
                : "translate-y-0 max-h-[85vh]"
          }`}
        >
          {/* Drag handle */}
          <div className="flex justify-center py-2 sticky top-0 bg-surface z-10">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <PanelContent />
        </div>
      </div>
    </div>
  );
}
