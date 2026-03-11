"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { IoTReading, EntityType, DeviceType } from "@/types";

interface StreamDevice {
  id: string;
  deviceType: DeviceType;
  entityType: EntityType;
  entityId: string;
  name: string;
  lng: number;
  lat: number;
  heading: number;
  speed: number;
  status: string;
  metadata: Record<string, unknown>;
}

interface InitEvent {
  scenario: string;
  devices: StreamDevice[];
  timestamp: string;
}

interface ReadingEvent extends IoTReading {
  entityType?: EntityType;
  entityId?: string;
  name?: string;
  deviceType?: DeviceType;
  status?: string;
}

interface UseIoTStreamOptions {
  scenario: string;
  enabled?: boolean;
  onReading?: (reading: ReadingEvent) => void;
  onInit?: (data: InitEvent) => void;
}

export function useIoTStream({
  scenario,
  enabled = true,
  onReading,
  onInit,
}: UseIoTStreamOptions) {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<StreamDevice[]>([]);
  const [readingCount, setReadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onReadingRef = useRef(onReading);
  const onInitRef = useRef(onInit);

  // Keep callback refs current without triggering reconnect
  useEffect(() => {
    onReadingRef.current = onReading;
  }, [onReading]);

  useEffect(() => {
    onInitRef.current = onInit;
  }, [onInit]);

  useEffect(() => {
    if (!enabled || !scenario) return;

    const es = new EventSource(`/api/iot/stream?scenario=${scenario}`);
    eventSourceRef.current = es;

    es.addEventListener("init", (event) => {
      const data: InitEvent = JSON.parse(event.data);
      setDevices(data.devices);
      setConnected(true);
      setError(null);
      onInitRef.current?.(data);
    });

    es.addEventListener("reading", (event) => {
      const reading: ReadingEvent = JSON.parse(event.data);
      setReadingCount((c) => c + 1);
      onReadingRef.current?.(reading);
    });

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost — reconnecting...");
      // EventSource auto-reconnects
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [scenario, enabled]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnected(false);
  }, []);

  return {
    connected,
    devices,
    readingCount,
    error,
    disconnect,
  };
}
