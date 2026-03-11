// LTx OVERWATCH Design System Constants

export const BRAND = {
  name: "LTx OVERWATCH",
  company: "Space Aye",
  tagline: "Seeing Earth is Easy. Identifying everything on it... is power.",
  subtagline: "AI classifies. Space Aye identifies.",
  classification: "DEMO // UNCLASSIFIED",
} as const;

export const COLORS = {
  bg: "#0A0A0A",
  bgSurface: "#111111",
  bgElevated: "#1A1A1A",
  bgHover: "#222222",
  border: "#2A2A2A",
  borderHover: "#3A3A3A",
  text: "#EDEDED",
  textMuted: "#888888",
  textDim: "#555555",
  accent: "#00E5A0", // electric teal-green — live data
  accentDim: "#00B37D",
  intel: "#3B82F6", // intel blue — secondary
  intelDim: "#2563EB",
  threat: "#EF4444", // threat red — anomalies
  threatDim: "#DC2626",
  warning: "#F59E0B", // amber — caution
  warningDim: "#D97706",
  friendly: "#22C55E", // green — authorised
  neutral: "#6B7280", // grey — unknown
} as const;

export const MAP_DEFAULTS = {
  style: "mapbox://styles/mapbox/satellite-v9",
  center: [0, 20] as [number, number],
  zoom: 2,
  pitch: 0,
  bearing: 0,
  maxZoom: 20,
  minZoom: 1,
} as const;

export const IOT_CONFIG = {
  streamIntervalMs: 2000,
  trailMaxPoints: 50,
  positionInterpolationMs: 2000,
  haloOuterRadius: 40,
  haloInnerRadius: 8,
  pulseSpeedMs: 1500,
} as const;

export const PATENT = {
  number: "US 10,951,814 B2",
  title: "Merging Satellite Imagery with User-Generated Content",
  grantDate: "2021-03-16",
  expiryDate: "2039-03-01",
  assignee: "Spelfie Ltd",
  inventor: "Chris Newlands",
  jurisdictions: {
    granted: ["US", "CN", "JP", "KR"],
    pending: ["EU", "CA"],
    international: ["WIPO"],
  },
} as const;

export const SCENARIOS = [
  {
    slug: "iron-curtain",
    name: "IRON CURTAIN",
    sector: "Defence & Security",
    icon: "Shield",
    description: "Forward operating base perimeter monitoring with personnel tracking and biometric data fusion.",
    center: [44.3, 33.3] as [number, number],
    zoom: 15,
  },
  {
    slug: "green-canopy",
    name: "GREEN CANOPY",
    sector: "Agriculture",
    icon: "Leaf",
    description: "Precision crop health monitoring with IoT soil sensors and NDVI satellite analysis.",
    center: [0.5, 52.5] as [number, number],
    zoom: 14,
  },
  {
    slug: "first-light",
    name: "FIRST LIGHT",
    sector: "Disaster Response",
    icon: "Siren",
    description: "Post-earthquake survivor detection with biometric wearables and first responder coordination.",
    center: [37.2, 37.0] as [number, number],
    zoom: 15,
  },
  {
    slug: "deep-blue",
    name: "DEEP BLUE",
    sector: "Maritime",
    icon: "Anchor",
    description: "Port surveillance with AIS vessel identification fused into satellite imagery.",
    center: [-2.07, 57.14] as [number, number],
    zoom: 14,
  },
  {
    slug: "wild-pulse",
    name: "WILD PULSE",
    sector: "Wildlife Conservation",
    icon: "PawPrint",
    description: "Endangered species tracking with collar biometrics and anti-poaching perimeter alerts.",
    center: [35.0, -1.5] as [number, number],
    zoom: 13,
  },
  {
    slug: "black-gold",
    name: "BLACK GOLD",
    sector: "Oil & Gas",
    icon: "Droplets",
    description: "Pipeline pressure monitoring with leak detection and patrol vehicle coordination.",
    center: [-1.8, 57.5] as [number, number],
    zoom: 13,
  },
] as const;
