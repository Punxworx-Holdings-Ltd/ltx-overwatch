"use client";

import { useState, useEffect, useCallback } from "react";
import { Marker } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Radio } from "lucide-react";

interface Flight {
  icao24: string;
  callsign: string;
  lng: number;
  lat: number;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
  lastUpdate: number;
}

/**
 * Fetches live aircraft positions from OpenSky Network
 * Free API — no auth required, 10-second update interval
 */
async function fetchFlights(
  bbox: [number, number, number, number]
): Promise<Flight[]> {
  const [west, south, east, north] = bbox;
  const url = `https://opensky-network.org/api/states/all?lamin=${south}&lomin=${west}&lamax=${north}&lomax=${east}`;

  try {
    const res = await fetch(url, { next: { revalidate: 10 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.states) return [];

    return data.states
      .filter(
        (s: (string | number | boolean | null)[]) =>
          s[5] !== null && s[6] !== null
      )
      .slice(0, 50)
      .map((s: (string | number | boolean | null)[]) => ({
        icao24: s[0] as string,
        callsign: ((s[1] as string) || "").trim(),
        lng: s[5] as number,
        lat: s[6] as number,
        altitude: (s[7] as number) || 0,
        velocity: (s[9] as number) || 0,
        heading: (s[10] as number) || 0,
        onGround: s[8] as boolean,
        lastUpdate: s[4] as number,
      }));
  } catch {
    return [];
  }
}

/**
 * Live flight overlay — shows real aircraft positions on the map
 * Uses react-map-gl Markers for accurate geo-positioning
 * Powered by OpenSky Network free API
 */
export function LiveFlightOverlay({
  bbox,
  enabled = true,
}: {
  bbox?: [number, number, number, number];
  enabled?: boolean;
}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!bbox || !enabled) return;
    setLoading(true);
    const data = await fetchFlights(bbox);
    setFlights(data);
    setLoading(false);
  }, [bbox, enabled]);

  useEffect(() => {
    if (!enabled || !bbox) return;
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh, enabled, bbox]);

  if (!enabled || flights.length === 0) return null;

  const selected = selectedFlight
    ? flights.find((f) => f.icao24 === selectedFlight)
    : null;

  return (
    <>
      {/* Flight markers — geo-positioned via Mapbox Markers */}
      {flights.slice(0, 40).map((flight) => (
        <Marker
          key={flight.icao24}
          longitude={flight.lng}
          latitude={flight.lat}
          anchor="center"
        >
          <div
            className="cursor-pointer group relative"
            onClick={() =>
              setSelectedFlight(
                selectedFlight === flight.icao24 ? null : flight.icao24
              )
            }
          >
            {/* Aircraft icon rotated to heading */}
            <div
              style={{ transform: `rotate(${flight.heading}deg)` }}
            >
              <div
                className="w-2.5 h-2.5 bg-intel/80 rotate-45 border border-intel/50"
                style={{
                  boxShadow: "0 0 6px rgba(59,130,246,0.4)",
                }}
              />
            </div>
            {/* Callsign on hover */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <div className="px-1.5 py-0.5 rounded bg-background/90 border border-intel/30">
                <span className="font-mono text-[9px] text-intel">
                  {flight.callsign || flight.icao24}
                </span>
                <span className="font-mono text-[8px] text-text-dim ml-1">
                  {Math.round(flight.altitude)}m
                </span>
              </div>
            </div>
          </div>
        </Marker>
      ))}

      {/* Flight count badge */}
      <div className="absolute top-3 right-40 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-intel/30 flex items-center gap-2 z-30 pointer-events-none">
        <Plane className="w-3.5 h-3.5 text-intel" />
        <span className="font-mono text-[10px] text-intel">
          {flights.length} LIVE AIRCRAFT
        </span>
        {loading && (
          <Radio className="w-3 h-3 text-intel/50 animate-pulse" />
        )}
      </div>

      {/* Selected flight info */}
      {selected && (
        <div className="absolute bottom-14 right-3 w-64 rounded-lg bg-background/95 backdrop-blur-md border border-intel/30 shadow-2xl z-40 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Plane className="w-3.5 h-3.5 text-intel" />
            <span className="font-mono text-[10px] text-foreground font-bold flex-1">
              {selected.callsign || selected.icao24}
            </span>
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-intel/20 text-intel">
              LIVE
            </span>
          </div>
          <div className="p-3 space-y-1.5 font-mono text-[9px]">
            <div className="flex justify-between">
              <span className="text-text-dim">ICAO24</span>
              <span className="text-intel">{selected.icao24}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">ALTITUDE</span>
              <span className="text-intel">
                {Math.round(selected.altitude)}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">SPEED</span>
              <span className="text-intel">
                {Math.round(selected.velocity * 3.6)} km/h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">HEADING</span>
              <span className="text-intel">
                {Math.round(selected.heading)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">POSITION</span>
              <span className="text-intel tabular-nums">
                {selected.lat.toFixed(4)}° {selected.lng.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">STATUS</span>
              <span className={selected.onGround ? "text-warning" : "text-accent"}>
                {selected.onGround ? "ON GROUND" : "AIRBORNE"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Flight data panel — shows flight list in a sidebar-friendly format
 */
export function FlightDataPanel({
  flights,
}: {
  flights: Flight[];
}) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-4">
        <Plane className="w-6 h-6 text-text-dim mx-auto mb-2" />
        <p className="font-mono text-[10px] text-text-dim">
          No aircraft in view
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {flights.slice(0, 20).map((f) => (
        <div
          key={f.icao24}
          className="flex items-center gap-2 px-2 py-1.5 rounded bg-elevated hover:bg-intel/5 transition-colors"
        >
          <Plane className="w-3 h-3 text-intel flex-shrink-0" />
          <span className="font-mono text-[10px] text-foreground w-16 truncate">
            {f.callsign || f.icao24}
          </span>
          <span className="font-mono text-[9px] text-text-dim tabular-nums">
            {Math.round(f.altitude)}m
          </span>
          <span className="font-mono text-[9px] text-text-dim tabular-nums ml-auto">
            {Math.round(f.velocity * 3.6)}km/h
          </span>
        </div>
      ))}
    </div>
  );
}
