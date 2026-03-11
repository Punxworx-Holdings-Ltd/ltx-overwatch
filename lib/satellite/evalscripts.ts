// Sentinel Hub Evalscripts — spectral processing definitions
// Each evalscript tells Sentinel Hub how to combine satellite bands
// into a rendered output (true colour, vegetation index, radar, etc.)
//
// Format normalisation: 20+ satellite formats → one universal standard
// (Patent claim: format normalisation across satellite sources)

export interface EvalscriptConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  bands: string[];
  script: string;
  satellite: "sentinel-2" | "sentinel-1" | "landsat-8" | "any";
  category: "optical" | "radar" | "vegetation" | "thermal" | "custom";
}

// ============================================================
// TRUE COLOUR (RGB) — Natural appearance
// ============================================================
export const TRUE_COLOR: EvalscriptConfig = {
  id: "true-color",
  name: "True Colour (RGB)",
  shortName: "RGB",
  description: "Natural colour composite using red, green, blue bands. Standard optical view.",
  bands: ["B04", "B03", "B02"],
  satellite: "sentinel-2",
  category: "optical",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B03", "B02"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  return [3.5 * sample.B04 / 10000, 3.5 * sample.B03 / 10000, 3.5 * sample.B02 / 10000];
}`,
};

// ============================================================
// NDVI — Normalised Difference Vegetation Index
// ============================================================
export const NDVI: EvalscriptConfig = {
  id: "ndvi",
  name: "NDVI (Vegetation Health)",
  shortName: "NDVI",
  description: "Vegetation health index. Green = healthy, red = stressed/bare. Critical for agriculture.",
  bands: ["B08", "B04"],
  satellite: "sentinel-2",
  category: "vegetation",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B08", "B04"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (ndvi < -0.2) return [0.05, 0.05, 0.05];
  if (ndvi < 0.0)  return [0.75, 0.75, 0.75];
  if (ndvi < 0.1)  return [0.86, 0.72, 0.53];
  if (ndvi < 0.2)  return [0.92, 0.87, 0.12];
  if (ndvi < 0.3)  return [0.70, 0.88, 0.10];
  if (ndvi < 0.4)  return [0.48, 0.80, 0.08];
  if (ndvi < 0.5)  return [0.30, 0.72, 0.06];
  if (ndvi < 0.6)  return [0.15, 0.65, 0.04];
  if (ndvi < 0.7)  return [0.08, 0.55, 0.03];
  return [0.0, 0.42, 0.02];
}`,
};

// ============================================================
// FALSE COLOUR INFRARED — Near-infrared composite
// ============================================================
export const FALSE_COLOR_IR: EvalscriptConfig = {
  id: "false-color-ir",
  name: "False Colour Infrared",
  shortName: "IR",
  description: "Near-infrared composite. Vegetation appears red, urban areas cyan/grey. Reveals hidden detail.",
  bands: ["B08", "B04", "B03"],
  satellite: "sentinel-2",
  category: "optical",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B08", "B04", "B03"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  return [3.5 * sample.B08 / 10000, 3.5 * sample.B04 / 10000, 3.5 * sample.B03 / 10000];
}`,
};

// ============================================================
// SAR (Synthetic Aperture Radar) — Sentinel-1
// ============================================================
export const SAR: EvalscriptConfig = {
  id: "sar",
  name: "SAR (Radar)",
  shortName: "SAR",
  description: "Synthetic Aperture Radar. Penetrates clouds and darkness. Critical for maritime and defence.",
  bands: ["VV", "VH"],
  satellite: "sentinel-1",
  category: "radar",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["VV", "VH"], units: "LINEAR_POWER" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  let vv = Math.sqrt(sample.VV);
  let vh = Math.sqrt(sample.VH);
  let ratio = vh / (vv + 0.001);
  return [vv * 3.0, vh * 5.0, ratio * 3.0];
}`,
};

// ============================================================
// MOISTURE INDEX — Soil/vegetation moisture
// ============================================================
export const MOISTURE: EvalscriptConfig = {
  id: "moisture",
  name: "Moisture Index",
  shortName: "MSI",
  description: "Normalised Moisture Index using SWIR. Blue = wet, red = dry. Critical for agriculture and wildfire.",
  bands: ["B8A", "B11"],
  satellite: "sentinel-2",
  category: "vegetation",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B8A", "B11"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  let ndmi = (sample.B8A - sample.B11) / (sample.B8A + sample.B11);
  if (ndmi < -0.2) return [0.8, 0.1, 0.1];
  if (ndmi < 0.0)  return [0.9, 0.5, 0.2];
  if (ndmi < 0.1)  return [0.95, 0.85, 0.4];
  if (ndmi < 0.2)  return [0.7, 0.9, 0.5];
  if (ndmi < 0.35) return [0.3, 0.7, 0.8];
  return [0.1, 0.3, 0.9];
}`,
};

// ============================================================
// SWIR — Short-Wave Infrared (thermal anomaly detection)
// ============================================================
export const SWIR: EvalscriptConfig = {
  id: "swir",
  name: "SWIR (Thermal)",
  shortName: "SWIR",
  description: "Short-wave infrared for thermal anomaly detection. Reveals fires, industrial heat, pipeline leaks.",
  bands: ["B12", "B8A", "B04"],
  satellite: "sentinel-2",
  category: "thermal",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B12", "B8A", "B04"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  return [3.5 * sample.B12 / 10000, 3.5 * sample.B8A / 10000, 3.5 * sample.B04 / 10000];
}`,
};

// ============================================================
// BATHYMETRIC — Water depth estimation (maritime)
// ============================================================
export const BATHYMETRIC: EvalscriptConfig = {
  id: "bathymetric",
  name: "Bathymetric (Water Depth)",
  shortName: "BATH",
  description: "Estimates water depth from optical bands. Lighter = shallow, darker = deep. Maritime intelligence.",
  bands: ["B02", "B03", "B04"],
  satellite: "sentinel-2",
  category: "custom",
  script: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B03", "B04"], units: "DN" }],
    output: { bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  let ratio = Math.log(1000.0 * sample.B02 / 10000 + 1) / Math.log(1000.0 * sample.B03 / 10000 + 1);
  let depth = Math.max(0, Math.min(1, (ratio - 0.8) * 3));
  return [0.05 + depth * 0.1, 0.15 + depth * 0.4, 0.3 + depth * 0.6];
}`,
};

// ============================================================
// ALL EVALSCRIPTS — indexed collection
// ============================================================
export const EVALSCRIPTS: Record<string, EvalscriptConfig> = {
  "true-color": TRUE_COLOR,
  ndvi: NDVI,
  "false-color-ir": FALSE_COLOR_IR,
  sar: SAR,
  moisture: MOISTURE,
  swir: SWIR,
  bathymetric: BATHYMETRIC,
};

export const EVALSCRIPT_LIST = Object.values(EVALSCRIPTS);

/**
 * Get the optimal evalscript for a given scenario
 */
export function getScenarioEvalscripts(scenarioSlug: string): EvalscriptConfig[] {
  switch (scenarioSlug) {
    case "iron-curtain":
      return [TRUE_COLOR, FALSE_COLOR_IR, SAR];
    case "green-canopy":
      return [TRUE_COLOR, NDVI, MOISTURE, FALSE_COLOR_IR];
    case "first-light":
      return [TRUE_COLOR, SAR, SWIR];
    case "deep-blue":
      return [TRUE_COLOR, SAR, BATHYMETRIC];
    case "wild-pulse":
      return [TRUE_COLOR, NDVI, FALSE_COLOR_IR, MOISTURE];
    case "black-gold":
      return [TRUE_COLOR, SWIR, SAR, FALSE_COLOR_IR];
    default:
      return [TRUE_COLOR, NDVI, SAR];
  }
}
