// Hook for managing map viewport state with URL sync
"use client";

import { useState, useCallback, useMemo } from "react";
import type { ViewportState } from "@/types";

interface UseViewportOptions {
  initial?: Partial<ViewportState>;
}

const DEFAULT_VIEWPORT: ViewportState = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

export function useViewport(options: UseViewportOptions = {}) {
  const [viewport, setViewport] = useState<ViewportState>({
    ...DEFAULT_VIEWPORT,
    ...options.initial,
  });

  const flyTo = useCallback(
    (target: Partial<ViewportState>, duration = 2000) => {
      // For smooth transitions, we'd use deck.gl's FlyToInterpolator
      // This provides the state update; the map component handles animation
      setViewport((prev) => ({
        ...prev,
        ...target,
      }));
    },
    []
  );

  const resetView = useCallback(() => {
    setViewport({
      ...DEFAULT_VIEWPORT,
      ...options.initial,
    });
  }, [options.initial]);

  const zoomIn = useCallback(() => {
    setViewport((prev) => ({ ...prev, zoom: Math.min(20, prev.zoom + 1) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(1, prev.zoom - 1) }));
  }, []);

  const bbox = useMemo((): [number, number, number, number] => {
    const tileSize = 360 / Math.pow(2, viewport.zoom);
    const aspect = 16 / 9;
    return [
      viewport.longitude - (tileSize * aspect) / 2,
      viewport.latitude - tileSize / 2,
      viewport.longitude + (tileSize * aspect) / 2,
      viewport.latitude + tileSize / 2,
    ];
  }, [viewport.longitude, viewport.latitude, viewport.zoom]);

  return {
    viewport,
    setViewport,
    flyTo,
    resetView,
    zoomIn,
    zoomOut,
    bbox,
  };
}
