// Supabase client for LTx OVERWATCH
// Provides browser, server, and admin clients for DB access

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser client — for client components
export function createBrowserSupabase() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Server client — for server components and API routes (uses anon key + RLS)
export function createServerSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

// Admin client — bypasses RLS, lazy-loaded singleton
let adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  }
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

// Realtime channel helper for IoT streaming
export function createRealtimeChannel(channelName: string) {
  const client = createBrowserSupabase();
  return client.channel(channelName);
}

// Type-safe table helpers
export type Tables = {
  scenarios: {
    id: string;
    slug: string;
    name: string;
    sector: string;
    description: string;
    center_lng: number;
    center_lat: number;
    zoom_level: number;
    is_active: boolean;
    created_at: string;
  };
  iot_devices: {
    id: string;
    scenario_id: string;
    device_type: string;
    entity_type: string;
    entity_id: string;
    name: string;
    metadata: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
  };
  iot_readings: {
    id: string;
    device_id: string;
    scenario_id: string;
    lng: number;
    lat: number;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
    payload: Record<string, unknown>;
    confidence: number;
    timestamp: string;
  };
  geofences: {
    id: string;
    scenario_id: string;
    name: string;
    geometry: GeoJSON.Polygon;
    fence_type: "exclusion" | "inclusion" | "alert";
    severity: string;
    alert_on_entry: boolean;
    alert_on_exit: boolean;
    authorized_entities: string[];
    is_active: boolean;
    created_at: string;
  };
  alerts: {
    id: string;
    scenario_id: string;
    geofence_id: string | null;
    device_id: string | null;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    lng: number;
    lat: number;
    status: string;
    payload: Record<string, unknown>;
    created_at: string;
  };
  satellite_tasks: {
    id: string;
    scenario_id: string;
    imagery_type: string;
    target_bbox: [number, number, number, number];
    requested_time_start: string;
    requested_time_end: string;
    status: string;
    satellite_id: string | null;
    cloud_cover_max: number;
    resolution_m: number;
    delivered_at: string | null;
    image_url: string | null;
    created_at: string;
  };
};
