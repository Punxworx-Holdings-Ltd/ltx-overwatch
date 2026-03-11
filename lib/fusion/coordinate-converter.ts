// GPS-to-Pixel Coordinate Converter
// Core patent implementation: US 10,951,814 B2
//
// Converts IoT device GPS coordinates to exact pixel positions
// within satellite imagery tile bounds using Web Mercator projection.
// This is the foundational technology that enables IoT data to be
// rendered WITHIN satellite imagery rather than ON TOP of maps.

import type { BoundingBox } from "@/types";

// Web Mercator constants
const TILE_SIZE = 512;
const MAX_LATITUDE = 85.05112878;

/**
 * Convert latitude/longitude to Web Mercator pixel coordinates
 * within a given viewport and zoom level.
 *
 * Patent claim: "Converting GPS coordinates to pixel positions
 * within satellite tiles"
 */
export function gpsToPixel(
  lng: number,
  lat: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
  centerLng: number,
  centerLat: number
): { x: number; y: number } {
  // Web Mercator projection
  const scale = Math.pow(2, zoom) * TILE_SIZE;

  const worldX = ((lng + 180) / 360) * scale;
  const worldY =
    ((1 -
      Math.log(
        Math.tan((clampLat(lat) * Math.PI) / 180) +
          1 / Math.cos((clampLat(lat) * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  const centerWorldX = ((centerLng + 180) / 360) * scale;
  const centerWorldY =
    ((1 -
      Math.log(
        Math.tan((clampLat(centerLat) * Math.PI) / 180) +
          1 / Math.cos((clampLat(centerLat) * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  const x = worldX - centerWorldX + viewportWidth / 2;
  const y = worldY - centerWorldY + viewportHeight / 2;

  return { x, y };
}

/**
 * Convert GPS coordinates to position within a bounding box
 * (normalised 0-1 coordinates within the tile)
 */
export function gpsToBboxPosition(
  lng: number,
  lat: number,
  bbox: BoundingBox
): { u: number; v: number } {
  const u = (lng - bbox.west) / (bbox.east - bbox.west);
  const v = 1 - (lat - bbox.south) / (bbox.north - bbox.south); // flip Y
  return { u, v };
}

/**
 * Convert a bounding box to pixel bounds at a given zoom level
 */
export function bboxToPixelBounds(
  bbox: BoundingBox,
  zoom: number
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  const scale = Math.pow(2, zoom) * TILE_SIZE;

  const minX = ((bbox.west + 180) / 360) * scale;
  const maxX = ((bbox.east + 180) / 360) * scale;

  const minY =
    ((1 -
      Math.log(
        Math.tan((clampLat(bbox.north) * Math.PI) / 180) +
          1 / Math.cos((clampLat(bbox.north) * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  const maxY =
    ((1 -
      Math.log(
        Math.tan((clampLat(bbox.south) * Math.PI) / 180) +
          1 / Math.cos((clampLat(bbox.south) * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculate the bounding box of the current viewport
 */
export function viewportToBbox(
  centerLng: number,
  centerLat: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number
): BoundingBox {
  const scale = Math.pow(2, zoom) * TILE_SIZE;

  const centerWorldX = ((centerLng + 180) / 360) * scale;
  const centerWorldY =
    ((1 -
      Math.log(
        Math.tan((clampLat(centerLat) * Math.PI) / 180) +
          1 / Math.cos((clampLat(centerLat) * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  const halfW = viewportWidth / 2;
  const halfH = viewportHeight / 2;

  const west = ((centerWorldX - halfW) / scale) * 360 - 180;
  const east = ((centerWorldX + halfW) / scale) * 360 - 180;

  const northWorldY = centerWorldY - halfH;
  const southWorldY = centerWorldY + halfH;

  const north =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * northWorldY) / scale))) * 180) /
    Math.PI;
  const south =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * southWorldY) / scale))) * 180) /
    Math.PI;

  return { west, south, east, north };
}

/**
 * Calculate meters per pixel at a given latitude and zoom level
 */
export function metersPerPixel(lat: number, zoom: number): number {
  return (
    (40075016.686 * Math.cos((lat * Math.PI) / 180)) /
    (Math.pow(2, zoom) * TILE_SIZE)
  );
}

function clampLat(lat: number): number {
  return Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
}
