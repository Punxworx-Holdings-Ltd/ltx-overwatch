"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Layers, Eye, Zap } from "lucide-react";
import { SCENARIOS } from "@/lib/utils/constants";
import {
  VisualModeSelector,
  VisualModeOverlay,
  type VisualMode,
} from "@/components/map/visual-modes";
import { HudOverlay } from "@/components/map/hud-overlay";

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

interface SpectralBand {
  name: string;
  key: string;
  description: string;
  color: string;
  evalscript: string;
  cssFilter: string;
  overlayColor: string;
  patentNote: string;
}

const bands: SpectralBand[] = [
  {
    name: "TRUE COLOUR",
    key: "optical",
    description: "RGB visible light composite from Sentinel-2 L2A",
    color: "bg-blue-500",
    evalscript: "B04, B03, B02",
    cssFilter: "none",
    overlayColor: "transparent",
    patentNote:
      "Tier 1 base layer — natural imagery. IoT data fuses directly into this view.",
  },
  {
    name: "NDVI",
    key: "ndvi",
    description: "Normalised Difference Vegetation Index — crop health",
    color: "bg-green-500",
    evalscript: "(B08 - B04) / (B08 + B04)",
    cssFilter:
      "saturate(0) brightness(1.1) contrast(1.4) sepia(0.8) hue-rotate(60deg) saturate(3)",
    overlayColor: "rgba(34,197,94,0.08)",
    patentNote:
      "Vegetation health detection. IoT soil sensors fuse INTO this view to show above + below ground data.",
  },
  {
    name: "SAR",
    key: "sar",
    description: "Synthetic Aperture Radar — sees through cloud and darkness",
    color: "bg-purple-500",
    evalscript: "VV, VH polarisation",
    cssFilter:
      "saturate(0) contrast(2) brightness(0.7) sepia(0.3) hue-rotate(220deg) saturate(1.5)",
    overlayColor: "rgba(139,92,246,0.06)",
    patentNote:
      "Radar penetrates cloud, smoke, darkness. IoT data still fuses at exact pixel coordinates — day or night.",
  },
  {
    name: "INFRARED",
    key: "infrared",
    description: "Short-wave infrared — moisture, fire detection",
    color: "bg-red-500",
    evalscript: "B12, B11, B04",
    cssFilter:
      "saturate(0) contrast(1.5) brightness(0.85) sepia(1) hue-rotate(-20deg) saturate(2.5)",
    overlayColor: "rgba(239,68,68,0.06)",
    patentNote:
      "Thermal detection — fire, heat plumes, engine exhaust. IoT temp sensors validate satellite thermal signatures.",
  },
  {
    name: "HYPERSPECTRAL",
    key: "hyperspectral",
    description: "Red-edge and NIR bands — detailed mineral/soil analysis",
    color: "bg-amber-500",
    evalscript: "B8A, B06, B05",
    cssFilter:
      "saturate(0) contrast(1.3) brightness(1.1) sepia(0.6) hue-rotate(15deg) saturate(2)",
    overlayColor: "rgba(245,158,11,0.06)",
    patentNote:
      "Multi-spectral mineral detection. IoT geological sensors confirm anomalies detected from orbit.",
  },
];

const locations = SCENARIOS.map((s) => ({
  name: s.name,
  slug: s.slug,
  sector: s.sector,
  center: s.center,
  zoom: s.zoom,
}));

export default function SpectrumPage() {
  const [activeBand, setActiveBand] = useState("optical");
  const [activeLocation, setActiveLocation] = useState(locations[1]);
  const [visualMode, setVisualMode] = useState<VisualMode>("standard");
  const [viewState, setViewState] = useState({
    latitude: activeLocation.center[1] as number,
    longitude: activeLocation.center[0] as number,
    zoom: activeLocation.zoom as number,
    pitch: 45,
    bearing: 0,
  });

  const currentBand = bands.find((b) => b.key === activeBand) ?? bands[0];

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
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          SPECTRUM — Multi-Source Intelligence
        </span>
        <div className="h-4 w-px bg-border" />

        {/* Visual mode selector */}
        <VisualModeSelector
          activeMode={visualMode}
          onModeChange={setVisualMode}
          compact
        />

        <div className="ml-auto flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-intel" />
          <span className="font-mono text-[10px] text-intel uppercase">
            {currentBand.name}
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map viewer with spectral filter + visual mode */}
        <div className="flex-1 relative">
          <VisualModeOverlay mode={visualMode}>
            {/* Spectral band CSS filter */}
            <div
              className="w-full h-full"
              style={{ filter: currentBand.cssFilter }}
            >
              <MapContainer
                center={activeLocation.center as [number, number]}
                zoom={activeLocation.zoom}
                pitch={45}
                bearing={0}
                terrain
                onViewStateChange={handleViewStateChange}
              />
            </div>
            {/* Spectral colour overlay tint */}
            {currentBand.overlayColor !== "transparent" && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: currentBand.overlayColor }}
              />
            )}
          </VisualModeOverlay>

          {/* HUD overlay */}
          <HudOverlay
            lat={viewState.latitude}
            lng={viewState.longitude}
            zoom={viewState.zoom}
            bearing={viewState.bearing}
            pitch={viewState.pitch}
            mode={`${currentBand.key} + ${visualMode}`}
          />

          {/* Band indicator overlay — now enhanced */}
          <div className="absolute top-14 left-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border z-30">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${currentBand.color} animate-pulse`}
              />
              <span className="font-mono text-xs font-bold text-foreground">
                {currentBand.name}
              </span>
            </div>
            <div className="font-mono text-[10px] text-text-dim">
              Evalscript: {currentBand.evalscript}
            </div>
          </div>

          {/* Patent note — contextual to band */}
          <div className="absolute bottom-14 right-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/20 max-w-xs z-30">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] text-accent font-bold">
                PATENT IN ACTION
              </span>
            </div>
            <div className="font-mono text-[10px] text-text-dim leading-relaxed">
              {currentBand.patentNote}
            </div>
          </div>
        </div>

        {/* Controls panel */}
        <div className="w-72 border-l border-border bg-surface overflow-y-auto">
          <div className="p-4">
            {/* Spectral bands */}
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
              Spectral Bands
            </h3>
            <div className="space-y-2 mb-6">
              {bands.map((band) => (
                <button
                  key={band.key}
                  onClick={() => setActiveBand(band.key)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    activeBand === band.key
                      ? "border-accent/50 bg-accent/10"
                      : "border-border bg-elevated hover:border-accent/20 hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${band.color} ${activeBand === band.key ? "animate-pulse" : ""}`}
                    />
                    <span className="font-mono text-[10px] font-bold text-foreground tracking-wide">
                      {band.name}
                    </span>
                    {activeBand === band.key && (
                      <span className="ml-auto font-mono text-[9px] text-accent">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-dim pl-4">
                    {band.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Visual Modes section */}
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
              Display Mode
            </h3>
            <div className="mb-6">
              <VisualModeSelector
                activeMode={visualMode}
                onModeChange={setVisualMode}
              />
            </div>

            {/* Location selector */}
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
              Location
            </h3>
            <div className="space-y-1 mb-6">
              {locations.map((loc) => (
                <button
                  key={loc.slug}
                  onClick={() => setActiveLocation(loc)}
                  className={`w-full px-3 py-2 rounded text-left transition-all font-mono text-[10px] ${
                    activeLocation.slug === loc.slug
                      ? "text-accent bg-accent/10"
                      : "text-text-dim hover:text-foreground hover:bg-elevated"
                  }`}
                >
                  <div>{loc.name}</div>
                  <div className="text-[9px] text-text-dim/60">{loc.sector}</div>
                </button>
              ))}
            </div>

            {/* Info card */}
            <div className="p-3 rounded-lg border border-border bg-elevated">
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-2">
                Format Normalisation
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                The patent covers normalisation of 20+ satellite image formats
                (Sentinel-2, Landsat, Planet, SPOT, WorldView, etc.) to one
                universal standard. IoT data fuses identically regardless of
                source imagery format or spectral band.
              </p>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="font-mono text-[10px] text-accent">
                  US 10,951,814 B2
                </div>
                <div className="font-mono text-[10px] text-text-dim mt-0.5">
                  Protected across US, CN, JP, KR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
