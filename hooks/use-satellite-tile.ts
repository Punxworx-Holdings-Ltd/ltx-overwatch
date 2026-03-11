// Hook for fetching satellite imagery tiles from the API
"use client";

import { useState, useEffect, useCallback } from "react";

interface UseSatelliteTileOptions {
  bbox: [number, number, number, number] | null;
  type?: "optical" | "ndvi" | "sar" | "infrared" | "hyperspectral";
  width?: number;
  height?: number;
  enabled?: boolean;
}

interface TileState {
  url: string | null;
  loading: boolean;
  error: string | null;
}

export function useSatelliteTile(options: UseSatelliteTileOptions): TileState & { refresh: () => void } {
  const { bbox, type = "optical", width = 512, height = 512, enabled = true } = options;
  const [state, setState] = useState<TileState>({ url: null, loading: false, error: null });

  const fetchTile = useCallback(async () => {
    if (!bbox || !enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        bbox: bbox.join(","),
        type,
        width: width.toString(),
        height: height.toString(),
      });

      const res = await fetch(`/api/satellite/tile?${params}`);
      if (!res.ok) throw new Error(`Tile fetch failed: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setState((prev) => {
        // Revoke previous URL
        if (prev.url) URL.revokeObjectURL(prev.url);
        return { url, loading: false, error: null };
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [bbox?.join(","), type, width, height, enabled]);

  useEffect(() => {
    fetchTile();
    return () => {
      setState((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url);
        return prev;
      });
    };
  }, [fetchTile]);

  return { ...state, refresh: fetchTile };
}
