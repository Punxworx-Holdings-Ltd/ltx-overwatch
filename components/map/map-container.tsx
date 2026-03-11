"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import MapGL, { NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_DEFAULTS } from "@/lib/utils/constants";
import type { MapRef } from "react-map-gl/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  terrain?: boolean;
  children?: React.ReactNode;
  onViewStateChange?: (vs: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  }) => void;
}

export default function MapContainer({
  center,
  zoom,
  pitch,
  bearing,
  terrain = false,
  children,
  onViewStateChange,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: center?.[0] ?? MAP_DEFAULTS.center[0],
    latitude: center?.[1] ?? MAP_DEFAULTS.center[1],
    zoom: zoom ?? MAP_DEFAULTS.zoom,
    pitch: pitch ?? MAP_DEFAULTS.pitch,
    bearing: bearing ?? MAP_DEFAULTS.bearing,
  });

  const onMove = useCallback(
    (evt: { viewState: typeof viewState }) => {
      setViewState(evt.viewState);
      onViewStateChange?.(evt.viewState);
    },
    [onViewStateChange]
  );

  // Enable 3D terrain when map loads
  useEffect(() => {
    if (!terrain) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const enableTerrain = () => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // Add 3D building extrusion if not present
      const layers = map.getStyle()?.layers;
      if (layers && !map.getLayer("3d-buildings")) {
        const labelLayer = layers.find(
          (l) => l.type === "symbol" && (l.layout as Record<string, unknown>)?.["text-field"]
        );
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": "#1a1a2e",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.7,
            },
          },
          labelLayer?.id
        );
      }
    };

    if (map.isStyleLoaded()) {
      enableTerrain();
    } else {
      map.on("style.load", enableTerrain);
    }
  }, [terrain]);

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
      ref={mapRef}
      {...viewState}
      onMove={onMove}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_DEFAULTS.style}
      style={{ width: "100%", height: "100%" }}
      maxZoom={MAP_DEFAULTS.maxZoom}
      minZoom={MAP_DEFAULTS.minZoom}
    >
      <NavigationControl position="top-right" showCompass showZoom />
      {children}
    </MapGL>
  );
}
