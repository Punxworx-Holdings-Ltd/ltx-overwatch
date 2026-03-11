// Sentinel Hub API client for Copernicus satellite imagery
// Uses the Copernicus Data Space Ecosystem (CDSE) Processing API

import type { BoundingBox, ImageryType } from "@/types";

const SH_BASE_URL =
  process.env.SENTINEL_HUB_BASE_URL ||
  "https://sh.dataspace.copernicus.eu/api/v1";

const SH_AUTH_URL =
  process.env.SENTINEL_HUB_AUTH_URL ||
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Sentinel Hub credentials not configured");
  }

  if (cachedToken && Date.now() < cachedToken.expires - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(SH_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Sentinel Hub auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// Evalscripts for different spectral bands
export const EVALSCRIPTS: Record<ImageryType, string> = {
  optical: `
//VERSION=3
function setup() {
  return { input: ["B04", "B03", "B02"], output: { bands: 3 } };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}`,

  ndvi: `
//VERSION=3
function setup() {
  return { input: ["B04", "B08"], output: { bands: 3 } };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (ndvi < -0.2) return [0.05, 0.05, 0.05];
  if (ndvi < 0) return [0.75, 0.75, 0.75];
  if (ndvi < 0.1) return [0.86, 0.78, 0.55];
  if (ndvi < 0.2) return [0.92, 0.87, 0.47];
  if (ndvi < 0.3) return [0.75, 0.84, 0.27];
  if (ndvi < 0.4) return [0.55, 0.76, 0.22];
  if (ndvi < 0.5) return [0.37, 0.68, 0.17];
  if (ndvi < 0.6) return [0.19, 0.6, 0.12];
  if (ndvi < 0.7) return [0.07, 0.52, 0.07];
  return [0.0, 0.41, 0.02];
}`,

  sar: `
//VERSION=3
function setup() {
  return { input: [{ datasource: "S1GRD", bands: ["VV", "VH"] }], output: { bands: 3 } };
}
function evaluatePixel(samples) {
  let s = samples.S1GRD[0];
  let vv = Math.max(0, Math.log(s.VV) * 0.21714724095 + 1);
  let vh = Math.max(0, Math.log(s.VH) * 0.21714724095 + 1);
  return [vv, vh, vv / 4 + vh];
}`,

  infrared: `
//VERSION=3
function setup() {
  return { input: ["B12", "B11", "B04"], output: { bands: 3 } };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B12, 2.5 * sample.B11, 2.5 * sample.B04];
}`,

  hyperspectral: `
//VERSION=3
function setup() {
  return { input: ["B05", "B06", "B07", "B8A"], output: { bands: 3 } };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B8A, 2.5 * sample.B06, 2.5 * sample.B05];
}`,
};

export interface TileRequest {
  bbox: BoundingBox;
  width: number;
  height: number;
  imageryType: ImageryType;
  timeFrom?: string;
  timeTo?: string;
}

export async function fetchSentinelTile(req: TileRequest): Promise<Buffer> {
  const token = await getAccessToken();
  const timeFrom = req.timeFrom || getDefaultTimeFrom();
  const timeTo = req.timeTo || new Date().toISOString().split("T")[0];

  const body = {
    input: {
      bounds: {
        bbox: [req.bbox.west, req.bbox.south, req.bbox.east, req.bbox.north],
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type:
            req.imageryType === "sar"
              ? "sentinel-1-grd"
              : "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: `${timeFrom}T00:00:00Z`, to: `${timeTo}T23:59:59Z` },
            maxCloudCoverage: req.imageryType === "sar" ? 100 : 30,
          },
        },
      ],
    },
    output: {
      width: req.width,
      height: req.height,
      responses: [{ identifier: "default", format: { type: "image/png" } }],
    },
    evalscript: EVALSCRIPTS[req.imageryType],
  };

  const res = await fetch(`${SH_BASE_URL}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sentinel Hub request failed: ${res.status} — ${errText}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function getDefaultTimeFrom(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().split("T")[0];
}

export async function searchCatalog(bbox: BoundingBox, timeFrom: string, timeTo: string) {
  const token = await getAccessToken();

  const body = {
    bbox: [bbox.west, bbox.south, bbox.east, bbox.north],
    datetime: `${timeFrom}T00:00:00Z/${timeTo}T23:59:59Z`,
    collections: ["sentinel-2-l2a"],
    limit: 10,
    filter: "eo:cloud_cover < 30",
  };

  const res = await fetch(`${SH_BASE_URL}/catalog/1.0.0/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Catalog search failed: ${res.status}`);
  }

  return res.json();
}
