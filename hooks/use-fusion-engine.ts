"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FusionEngine } from "@/lib/fusion/engine";
import { useIoTStream } from "./use-iot-stream";
import type { FusionEntity } from "@/types";

interface UseFusionEngineOptions {
  scenario: string;
  enabled?: boolean;
}

export function useFusionEngine({ scenario, enabled = true }: UseFusionEngineOptions) {
  const [entities, setEntities] = useState<FusionEntity[]>([]);
  const [stats, setStats] = useState({
    totalEntities: 0,
    friendly: 0,
    threat: 0,
    alert: 0,
    readingsPerSecond: 0,
  });
  const engineRef = useRef<FusionEngine | null>(null);
  const readingTimestamps = useRef<number[]>([]);

  // Create engine
  useEffect(() => {
    const engine = new FusionEngine();
    engineRef.current = engine;

    // Start animation loop for smooth position interpolation
    engine.startAnimation((interpolated) => {
      setEntities([...interpolated]);
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [scenario]);

  // Handle incoming IoT readings
  const onReading = useCallback(
    (reading: Parameters<NonNullable<Parameters<typeof useIoTStream>[0]["onReading"]>>[0]) => {
      if (!engineRef.current) return;
      engineRef.current.processReading({
        ...reading,
        status: (reading.status as FusionEntity["status"]) ?? undefined,
      });

      // Track readings per second
      const now = Date.now();
      readingTimestamps.current.push(now);
      readingTimestamps.current = readingTimestamps.current.filter(
        (t) => now - t < 5000
      );
    },
    []
  );

  // Handle init (seed initial positions)
  const onInit = useCallback(
    (data: Parameters<NonNullable<Parameters<typeof useIoTStream>[0]["onInit"]>>[0]) => {
      if (!engineRef.current) return;
      engineRef.current.clear();

      for (const device of data.devices) {
        engineRef.current.processReading({
          id: crypto.randomUUID(),
          device_id: device.id,
          scenario_id: data.scenario,
          timestamp: data.timestamp,
          lng: device.lng,
          lat: device.lat,
          heading: device.heading,
          speed: device.speed,
          payload: {},
          confidence: 1.0,
          entityType: device.entityType,
          entityId: device.entityId,
          name: device.name,
          deviceType: device.deviceType,
          status: device.status as FusionEntity["status"],
        });
      }
    },
    []
  );

  const { connected, readingCount, error } = useIoTStream({
    scenario,
    enabled,
    onReading,
    onInit,
  });

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!engineRef.current) return;
      const allEntities = engineRef.current.getEntities();
      const now = Date.now();
      const recentReadings = readingTimestamps.current.filter(
        (t) => now - t < 5000
      );

      setStats({
        totalEntities: allEntities.length,
        friendly: allEntities.filter((e) => e.status === "friendly").length,
        threat: allEntities.filter((e) => e.status === "threat").length,
        alert: allEntities.filter((e) => e.status === "alert").length,
        readingsPerSecond: Math.round(recentReadings.length / 5),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    entities,
    stats,
    connected,
    readingCount,
    error,
    engine: engineRef.current,
  };
}
