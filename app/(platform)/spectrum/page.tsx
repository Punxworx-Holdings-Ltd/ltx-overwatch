"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Layers, Eye } from "lucide-react";
import { SCENARIOS } from "@/lib/utils/constants";

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

const bands = [
  {
    name: "TRUE COLOUR",
    key: "optical",
    description: "RGB visible light composite from Sentinel-2 L2A",
    color: "bg-blue-500",
    evalscript: "B04, B03, B02",
  },
  {
    name: "NDVI",
    key: "ndvi",
    description: "Normalised Difference Vegetation Index — crop health",
    color: "bg-green-500",
    evalscript: "(B08 - B04) / (B08 + B04)",
  },
  {
    name: "SAR",
    key: "sar",
    description: "Synthetic Aperture Radar — sees through cloud and darkness",
    color: "bg-purple-500",
    evalscript: "VV, VH polarisation",
  },
  {
    name: "INFRARED",
    key: "infrared",
    description: "Short-wave infrared — moisture, fire detection",
    color: "bg-red-500",
    evalscript: "B12, B11, B04",
  },
  {
    name: "HYPERSPECTRAL",
    key: "hyperspectral",
    description: "Red-edge and NIR bands — detailed mineral/soil analysis",
    color: "bg-amber-500",
    evalscript: "B8A, B06, B05",
  },
];

const locations = SCENARIOS.map((s) => ({
  name: s.name,
  slug: s.slug,
  center: s.center,
  zoom: s.zoom,
}));

export default function SpectrumPage() {
  const [activeBand, setActiveBand] = useState("optical");
  const [activeLocation, setActiveLocation] = useState(locations[1]); // GREEN CANOPY default

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/50">
        <span className="font-mono text-xs tracking-widest text-text-dim uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          SPECTRUM — Multi-Source Intelligence
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim">
          20+ satellite image formats normalised to one universal standard
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-intel" />
          <span className="font-mono text-[10px] text-intel uppercase">
            {bands.find((b) => b.key === activeBand)?.name}
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map viewer */}
        <div className="flex-1 relative">
          <MapContainer
            center={activeLocation.center as [number, number]}
            zoom={activeLocation.zoom}
          />

          {/* Band indicator overlay */}
          <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${bands.find((b) => b.key === activeBand)?.color}`} />
              <span className="font-mono text-xs font-bold text-foreground">
                {bands.find((b) => b.key === activeBand)?.name}
              </span>
            </div>
            <div className="font-mono text-[10px] text-text-dim">
              Evalscript: {bands.find((b) => b.key === activeBand)?.evalscript}
            </div>
          </div>

          {/* Patent note */}
          <div className="absolute bottom-12 right-3 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-accent/20">
            <div className="font-mono text-[10px] text-accent">
              FORMAT NORMALISATION — Patent covers 20+ satellite formats → one universal standard
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
                    <div className={`w-2 h-2 rounded-full ${band.color}`} />
                    <span className="font-mono text-[10px] font-bold text-foreground tracking-wide">
                      {band.name}
                    </span>
                    {activeBand === band.key && (
                      <span className="ml-auto font-mono text-[9px] text-accent">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-dim pl-4">{band.description}</p>
                </button>
              ))}
            </div>

            {/* Location selector */}
            <h3 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-3">
              Location
            </h3>
            <div className="space-y-1">
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
                  {loc.name}
                </button>
              ))}
            </div>

            {/* Info card */}
            <div className="mt-6 p-3 rounded-lg border border-border bg-elevated">
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-2">
                About SPECTRUM
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                The patent covers normalisation of 20+ satellite image formats
                (Sentinel-2, Landsat, Planet, SPOT, WorldView, etc.) to one
                universal standard. IoT data fuses identically regardless of
                source imagery format.
              </p>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="font-mono text-[10px] text-accent">
                  Sentinel Hub Processing API connected
                </div>
                <div className="font-mono text-[10px] text-text-dim mt-0.5">
                  Copernicus Data Space Ecosystem
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
