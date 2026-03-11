"use client";

import { useState, useCallback, useMemo } from "react";
import MapGL, { NavigationControl } from "react-map-gl/mapbox";
import { DeckGLOverlay } from "./deckgl-overlay";
import { useFusionEngine } from "@/hooks/use-fusion-engine";
import { createFusionHaloLayer, createFusionCoreLayer } from "@/lib/layers/fusion-halo-layer";
import { createEntityLabelLayer } from "@/lib/layers/entity-icon-layer";
import { createTrailPathLayer } from "@/lib/layers/trail-path-layer";
import { createGoogle3DTilesLayer } from "@/lib/layers/google-3d-tiles-layer";
import { MAP_DEFAULTS } from "@/lib/utils/constants";
import type { FusionEntity } from "@/types";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface FusionViewportProps {
  scenario: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  onEntitySelect?: (entity: FusionEntity) => void;
  children?: React.ReactNode;
  show3DTiles?: boolean;
}

export default function FusionViewport({
  scenario,
  center,
  zoom = 14,
  pitch = 45,
  bearing = 0,
  onEntitySelect,
  children,
  show3DTiles = false,
}: FusionViewportProps) {
  const [viewState, setViewState] = useState({
    longitude: center?.[0] ?? MAP_DEFAULTS.center[0],
    latitude: center?.[1] ?? MAP_DEFAULTS.center[1],
    zoom: zoom,
    pitch: pitch,
    bearing: bearing,
  });

  const { entities, stats, connected, readingCount, error } = useFusionEngine({
    scenario,
    enabled: true,
  });

  const onMove = useCallback(
    (evt: { viewState: typeof viewState }) => setViewState(evt.viewState),
    []
  );

  // Build deck.gl layers
  const layers = useMemo(() => {
    const lyrs = [];

    // Google Photorealistic 3D Tiles (absolute bottom — replaces flat satellite tiles)
    const tiles3D = createGoogle3DTilesLayer(show3DTiles);
    if (tiles3D) lyrs.push(tiles3D);

    // Trail paths (bottom layer — rendered first)
    const trailLayer = createTrailPathLayer(entities, {
      zoom: viewState.zoom,
    });
    if (trailLayer) lyrs.push(trailLayer);

    // Fusion halos (mid layer — glow effect)
    lyrs.push(createFusionHaloLayer(entities));

    // Entity cores (top layer — bright dots)
    lyrs.push(createFusionCoreLayer(entities));

    // Entity labels (topmost — text readouts)
    const labelLayer = createEntityLabelLayer(entities, {
      zoom: viewState.zoom,
    });
    if (labelLayer) lyrs.push(labelLayer);

    return lyrs;
  }, [entities, viewState.zoom, show3DTiles]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-text-muted mb-2">
            MAPBOX TOKEN REQUIRED
          </p>
          <p className="font-mono text-xs text-text-dim">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapGL
        {...viewState}
        onMove={onMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_DEFAULTS.style}
        style={{ width: "100%", height: "100%" }}
        maxZoom={MAP_DEFAULTS.maxZoom}
        minZoom={MAP_DEFAULTS.minZoom}
      >
        <DeckGLOverlay layers={layers} />
        <NavigationControl position="top-right" showCompass showZoom />
        {children}
      </MapGL>

      {/* Status bar */}
      <div className="absolute top-3 left-3 flex items-center gap-3">
        {/* Connection status */}
        <div className="px-3 py-1.5 rounded bg-background/80 backdrop-blur-sm border border-border flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-accent animate-halo-pulse" : "bg-threat"
            }`}
          />
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            {connected ? "LIVE FEED" : error || "CONNECTING..."}
          </span>
        </div>

        {/* Entity count */}
        {stats.totalEntities > 0 && (
          <div className="px-3 py-1.5 rounded bg-background/80 backdrop-blur-sm border border-border">
            <span className="data-readout text-text-dim">
              {stats.totalEntities} ENTITIES{" "}
              <span className="text-accent">{stats.friendly}F</span>{" "}
              {stats.threat > 0 && (
                <span className="text-threat">{stats.threat}T</span>
              )}{" "}
              {stats.alert > 0 && (
                <span className="text-warning">{stats.alert}A</span>
              )}
            </span>
          </div>
        )}

        {/* Readings counter */}
        {readingCount > 0 && (
          <div className="px-3 py-1.5 rounded bg-background/80 backdrop-blur-sm border border-border">
            <span className="data-readout text-text-dim">
              {readingCount} READINGS | {stats.readingsPerSecond}/s
            </span>
          </div>
        )}
      </div>

      {/* Coordinate readout */}
      <div className="absolute bottom-2 left-2 px-3 py-1.5 rounded bg-background/80 backdrop-blur-sm border border-border">
        <span className="data-readout text-text-dim">
          {viewState.latitude.toFixed(6)}°N {viewState.longitude.toFixed(6)}°E Z
          {viewState.zoom.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
