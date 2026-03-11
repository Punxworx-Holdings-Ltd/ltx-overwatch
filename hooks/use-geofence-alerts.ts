// Hook for monitoring geofence alerts in real-time
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Alert } from "@/lib/geofence/alert-engine";
import { AlertEngine } from "@/lib/geofence/alert-engine";
import type { GeofenceZone } from "@/lib/geofence/detector";

interface UseGeofenceAlertsOptions {
  scenarioId: string;
  geofences: GeofenceZone[];
  enabled?: boolean;
}

interface GeofenceAlertState {
  alerts: Alert[];
  activeCount: number;
  criticalCount: number;
  latestAlert: Alert | null;
}

export function useGeofenceAlerts(options: UseGeofenceAlertsOptions) {
  const { scenarioId, geofences, enabled = true } = options;
  const engineRef = useRef<AlertEngine | null>(null);
  const [state, setState] = useState<GeofenceAlertState>({
    alerts: [],
    activeCount: 0,
    criticalCount: 0,
    latestAlert: null,
  });

  // Initialize engine
  useEffect(() => {
    if (!enabled) return;

    const engine = new AlertEngine(scenarioId);
    engine.setGeofences(geofences);
    engineRef.current = engine;

    const unsub = engine.subscribe((alert) => {
      setState({
        alerts: engine.getAlerts(),
        activeCount: engine.getActiveCount(),
        criticalCount: engine.getCriticalCount(),
        latestAlert: alert,
      });
    });

    return () => {
      unsub();
      engine.destroy();
      engineRef.current = null;
    };
  }, [scenarioId, geofences, enabled]);

  const processReading = useCallback(
    (reading: {
      deviceId: string;
      entityId: string;
      lng: number;
      lat: number;
      payload: Record<string, unknown>;
    }) => {
      engineRef.current?.processReading(reading);
    },
    []
  );

  const acknowledge = useCallback((alertId: string) => {
    engineRef.current?.acknowledgeAlert(alertId);
    if (engineRef.current) {
      setState({
        alerts: engineRef.current.getAlerts(),
        activeCount: engineRef.current.getActiveCount(),
        criticalCount: engineRef.current.getCriticalCount(),
        latestAlert: state.latestAlert,
      });
    }
  }, [state.latestAlert]);

  const resolve = useCallback((alertId: string) => {
    engineRef.current?.resolveAlert(alertId);
    if (engineRef.current) {
      setState({
        alerts: engineRef.current.getAlerts(),
        activeCount: engineRef.current.getActiveCount(),
        criticalCount: engineRef.current.getCriticalCount(),
        latestAlert: state.latestAlert,
      });
    }
  }, [state.latestAlert]);

  return {
    ...state,
    processReading,
    acknowledge,
    resolve,
  };
}
