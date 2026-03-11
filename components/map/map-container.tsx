"use client";

import { useState, useCallback } from "react";
import MapGL, { NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_DEFAULTS } from "@/lib/utils/constants";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  children?: React.ReactNode;
}

export default function MapContainer({
  center,
  zoom,
  pitch,
  bearing,
  children,
}: MapContainerProps) {
  const [viewState, setViewState] = useState({
    longitude: center?.[0] ?? MAP_DEFAULTS.center[0],
    latitude: center?.[1] ?? MAP_DEFAULTS.center[1],
    zoom: zoom ?? MAP_DEFAULTS.zoom,
    pitch: pitch ?? MAP_DEFAULTS.pitch,
    bearing: bearing ?? MAP_DEFAULTS.bearing,
  });

  const onMove = useCallback(
    (evt: { viewState: typeof viewState }) => setViewState(evt.viewState),
    []
  );

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
    <MapGL
      {...viewState}
      onMove={onMove}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_DEFAULTS.style}
      style={{ width: "100%", height: "100%" }}
      maxZoom={MAP_DEFAULTS.maxZoom}
      minZoom={MAP_DEFAULTS.minZoom}
    >
      <NavigationControl position="top-right" showCompass showZoom />
      {/* Coordinate readout */}
      <div className="absolute bottom-2 left-2 px-3 py-1.5 rounded bg-background/80 backdrop-blur-sm border border-border">
        <span className="data-readout text-text-dim">
          {viewState.latitude.toFixed(6)}°N {viewState.longitude.toFixed(6)}°E Z
          {viewState.zoom.toFixed(1)}
        </span>
      </div>
      {children}
    </MapGL>
  );
}
