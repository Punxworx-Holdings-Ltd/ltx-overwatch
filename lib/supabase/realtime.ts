// Supabase Realtime — channel management for live IoT data
// Enables multi-user presence and real-time IoT reading broadcasts
//
// Architecture:
//   IoT device → POST /api/iot/ingest → Supabase Realtime broadcast → all connected clients
//   Each scenario has its own channel for scoped subscriptions

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserSupabase } from "./client";

type IoTPayload = {
  device_id: string;
  entity_id: string;
  lng: number;
  lat: number;
  heading: number;
  payload: Record<string, unknown>;
  timestamp: string;
};

type AlertPayload = {
  id: string;
  severity: string;
  title: string;
  scenario_id: string;
  entity_id: string;
  timestamp: string;
};

type PresenceState = {
  user_id: string;
  viewport_center: [number, number];
  viewport_zoom: number;
  scenario: string;
  online_at: string;
};

type ChannelSubscription = {
  channel: RealtimeChannel;
  scenarioId: string;
  createdAt: number;
};

// Active channel registry
const channels = new Map<string, ChannelSubscription>();

/**
 * Subscribe to real-time IoT readings for a scenario
 */
export function subscribeToIoTStream(
  scenarioId: string,
  onReading: (reading: IoTPayload) => void
): () => void {
  const channelKey = `iot:${scenarioId}`;

  // Reuse existing channel if already subscribed
  if (channels.has(channelKey)) {
    const existing = channels.get(channelKey)!;
    existing.channel.on("broadcast", { event: "iot_reading" }, ({ payload }) => {
      onReading(payload as IoTPayload);
    });
    return () => unsubscribe(channelKey);
  }

  const supabase = createBrowserSupabase();
  const channel = supabase.channel(channelKey, {
    config: { broadcast: { self: true } },
  });

  channel
    .on("broadcast", { event: "iot_reading" }, ({ payload }) => {
      onReading(payload as IoTPayload);
    })
    .subscribe();

  channels.set(channelKey, {
    channel,
    scenarioId,
    createdAt: Date.now(),
  });

  return () => unsubscribe(channelKey);
}

/**
 * Subscribe to real-time alerts (cross-scenario)
 */
export function subscribeToAlerts(
  onAlert: (alert: AlertPayload) => void
): () => void {
  const channelKey = "alerts:global";

  const supabase = createBrowserSupabase();
  const channel = supabase.channel(channelKey, {
    config: { broadcast: { self: true } },
  });

  channel
    .on("broadcast", { event: "new_alert" }, ({ payload }) => {
      onAlert(payload as AlertPayload);
    })
    .subscribe();

  channels.set(channelKey, {
    channel,
    scenarioId: "global",
    createdAt: Date.now(),
  });

  return () => unsubscribe(channelKey);
}

/**
 * Track operator presence — shows other users viewing the same scenario
 */
export function trackPresence(
  scenarioId: string,
  userId: string,
  onPresenceChange: (users: PresenceState[]) => void
): () => void {
  const channelKey = `presence:${scenarioId}`;
  const supabase = createBrowserSupabase();

  const channel = supabase.channel(channelKey);

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceState>();
      const users = Object.values(state).flat();
      onPresenceChange(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          viewport_center: [0, 0],
          viewport_zoom: 14,
          scenario: scenarioId,
          online_at: new Date().toISOString(),
        } satisfies PresenceState);
      }
    });

  channels.set(channelKey, {
    channel,
    scenarioId,
    createdAt: Date.now(),
  });

  return () => unsubscribe(channelKey);
}

/**
 * Broadcast an IoT reading to all connected clients (server-side)
 */
export async function broadcastReading(
  scenarioId: string,
  reading: IoTPayload
) {
  const supabase = createBrowserSupabase();
  const channel = supabase.channel(`iot:${scenarioId}`);
  await channel.send({
    type: "broadcast",
    event: "iot_reading",
    payload: reading,
  });
}

/**
 * Broadcast an alert to all connected clients
 */
export async function broadcastAlert(alert: AlertPayload) {
  const supabase = createBrowserSupabase();
  const channel = supabase.channel("alerts:global");
  await channel.send({
    type: "broadcast",
    event: "new_alert",
    payload: alert,
  });
}

/**
 * Unsubscribe from a channel
 */
function unsubscribe(channelKey: string) {
  const sub = channels.get(channelKey);
  if (sub) {
    const supabase = createBrowserSupabase();
    supabase.removeChannel(sub.channel);
    channels.delete(channelKey);
  }
}

/**
 * Unsubscribe from all channels (cleanup on unmount)
 */
export function unsubscribeAll() {
  const supabase = createBrowserSupabase();
  for (const [key, sub] of channels) {
    supabase.removeChannel(sub.channel);
    channels.delete(key);
  }
}

/**
 * Get count of active channels
 */
export function getActiveChannelCount(): number {
  return channels.size;
}
