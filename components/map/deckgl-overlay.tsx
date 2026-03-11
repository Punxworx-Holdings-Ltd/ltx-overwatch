"use client";

import { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";

interface DeckGLOverlayProps {
  layers: Layer[];
  interleaved?: boolean;
}

export function DeckGLOverlay({
  layers,
  interleaved = true,
}: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(
    () =>
      new MapboxOverlay({
        interleaved,
        layers: [],
      })
  );

  overlay.setProps({ layers });

  return null;
}
