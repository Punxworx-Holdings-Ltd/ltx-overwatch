// Satellite orbit calculator — predicts pass times and coverage windows
// Used by the TASKING page for scheduling captures

export interface SatelliteOrbit {
  id: string;
  name: string;
  orbitType: "SSO" | "LEO" | "GEO";
  altitude: number;        // km
  inclination: number;     // degrees
  period: number;          // minutes
  revisitDays: number;
  swathWidth: number;      // km
  resolution: number;      // metres
  status: "active" | "standby" | "maintenance";
}

export interface PassPrediction {
  satelliteId: string;
  satelliteName: string;
  startTime: Date;
  endTime: Date;
  maxElevation: number;   // degrees
  direction: "ascending" | "descending";
  coverageOverlap: number; // 0-1, how much of target bbox is covered
}

// Constellation data for common EO satellites
export const CONSTELLATION: SatelliteOrbit[] = [
  { id: "S2A", name: "Sentinel-2A", orbitType: "SSO", altitude: 786, inclination: 98.62, period: 100.6, revisitDays: 5, swathWidth: 290, resolution: 10, status: "active" },
  { id: "S2B", name: "Sentinel-2B", orbitType: "SSO", altitude: 786, inclination: 98.62, period: 100.6, revisitDays: 5, swathWidth: 290, resolution: 10, status: "active" },
  { id: "S1A", name: "Sentinel-1A", orbitType: "SSO", altitude: 693, inclination: 98.18, period: 98.6, revisitDays: 6, swathWidth: 250, resolution: 5, status: "active" },
  { id: "L9", name: "Landsat-9", orbitType: "SSO", altitude: 705, inclination: 98.2, period: 99.0, revisitDays: 16, swathWidth: 185, resolution: 30, status: "active" },
  { id: "PS", name: "PlanetScope", orbitType: "SSO", altitude: 475, inclination: 97.4, period: 94.0, revisitDays: 1, swathWidth: 24, resolution: 3, status: "active" },
  { id: "WV3", name: "WorldView-3", orbitType: "SSO", altitude: 617, inclination: 97.9, period: 97.0, revisitDays: 1, swathWidth: 13.1, resolution: 0.31, status: "active" },
  { id: "SKY", name: "SkySat", orbitType: "SSO", altitude: 500, inclination: 97.5, period: 94.6, revisitDays: 1, swathWidth: 6.6, resolution: 0.5, status: "active" },
  { id: "SP6", name: "SPOT-6", orbitType: "SSO", altitude: 694, inclination: 98.2, period: 98.8, revisitDays: 1, swathWidth: 60, resolution: 1.5, status: "standby" },
];

/**
 * Calculate orbital period from altitude (simplified circular orbit)
 */
export function orbitalPeriod(altitudeKm: number): number {
  const R_EARTH = 6371;
  const MU = 398600.4418; // km³/s²
  const r = R_EARTH + altitudeKm;
  return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU) / 60; // minutes
}

/**
 * Calculate ground track velocity
 */
export function groundTrackVelocity(altitudeKm: number): number {
  const R_EARTH = 6371;
  const MU = 398600.4418;
  const r = R_EARTH + altitudeKm;
  const orbitalVelocity = Math.sqrt(MU / r); // km/s
  return orbitalVelocity * (R_EARTH / r); // ground projection
}

/**
 * Predict next pass times for a given location
 * Simplified model — real prediction would use TLE/SGP4
 */
export function predictPasses(
  lat: number,
  lng: number,
  satellite: SatelliteOrbit,
  hoursAhead = 72
): PassPrediction[] {
  const passes: PassPrediction[] = [];
  const now = new Date();

  // Simplified: generate passes based on revisit period and orbital mechanics
  const passesPerDay = (24 * 60) / satellite.period;
  const totalPasses = Math.ceil((hoursAhead / 24) * passesPerDay);

  // Deterministic seed from satellite ID and location
  const seed = (satellite.id.charCodeAt(0) * 7 + lat * 13 + lng * 17) % 100;

  for (let i = 0; i < totalPasses; i++) {
    const passOffsetMinutes = (i * satellite.period) + (seed % satellite.period);
    const startTime = new Date(now.getTime() + passOffsetMinutes * 60 * 1000);

    // Only include if latitude is within orbital coverage
    if (Math.abs(lat) <= satellite.inclination) {
      const duration = 4 + Math.random() * 6; // 4-10 minute pass
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      passes.push({
        satelliteId: satellite.id,
        satelliteName: satellite.name,
        startTime,
        endTime,
        maxElevation: 15 + Math.random() * 75,
        direction: i % 2 === 0 ? "ascending" : "descending",
        coverageOverlap: 0.5 + Math.random() * 0.5,
      });
    }
  }

  // Sort by time and limit
  return passes
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 20);
}

/**
 * Find the next available capture window across all active satellites
 */
export function nextCaptureWindow(
  lat: number,
  lng: number
): PassPrediction | null {
  const activeSats = CONSTELLATION.filter((s) => s.status === "active");
  const allPasses = activeSats.flatMap((sat) =>
    predictPasses(lat, lng, sat, 48)
  );

  allPasses.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const now = Date.now();

  return allPasses.find((p) => p.startTime.getTime() > now) ?? null;
}
