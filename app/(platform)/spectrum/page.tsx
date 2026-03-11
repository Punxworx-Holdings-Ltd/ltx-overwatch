"use client";

import { Layers } from "lucide-react";

const bands = [
  { name: "TRUE COLOUR", key: "optical", description: "RGB visible light composite" },
  { name: "NDVI", key: "ndvi", description: "Normalised Difference Vegetation Index" },
  { name: "SAR", key: "sar", description: "Synthetic Aperture Radar — sees through cloud" },
  { name: "INFRARED", key: "infrared", description: "Thermal and near-infrared bands" },
  { name: "HYPERSPECTRAL", key: "hyperspectral", description: "Detailed spectral analysis" },
];

export default function SpectrumPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Multi-Source Intelligence
        </h1>
        <p className="text-sm text-text-muted">
          Toggle between spectral bands. 20+ satellite image formats normalised
          to one universal standard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {bands.map((band) => (
          <button
            key={band.key}
            className="p-4 rounded-lg border border-border bg-elevated hover:border-accent/40 hover:bg-accent/5 transition-all text-left"
          >
            <span className="font-mono text-xs font-bold text-foreground tracking-wide">
              {band.name}
            </span>
            <p className="text-xs text-text-dim mt-1">{band.description}</p>
          </button>
        ))}
      </div>

      <div className="h-96 rounded-lg border border-border bg-background flex items-center justify-center">
        <span className="font-mono text-xs text-text-dim">
          SPECTRAL VIEWER — Phase 3 (Sentinel Hub evalscripts)
        </span>
      </div>
    </div>
  );
}
