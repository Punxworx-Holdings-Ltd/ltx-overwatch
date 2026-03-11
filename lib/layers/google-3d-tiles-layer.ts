import { Tile3DLayer } from "@deck.gl/geo-layers";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Creates a deck.gl Tile3DLayer that renders Google Photorealistic 3D Tiles.
 * These replace flat satellite imagery with full 3D buildings, terrain,
 * and photorealistic textures from Google's aerial/satellite captures.
 *
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env var with Map Tiles API enabled.
 */
export function createGoogle3DTilesLayer(enabled: boolean = true) {
  if (!enabled || !GOOGLE_API_KEY) return null;

  return new Tile3DLayer({
    id: "google-3d-tiles",
    data: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_API_KEY}`,
    loadOptions: {
      fetch: {
        headers: {
          "X-GOOG-API-KEY": GOOGLE_API_KEY,
        },
      },
    },
    // Optimise for performance — higher = fewer tiles loaded = faster
    maximumScreenSpaceError: 8,
    opacity: 1,
  });
}
