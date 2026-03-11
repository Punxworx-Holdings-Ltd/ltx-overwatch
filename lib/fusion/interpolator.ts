// Position Interpolator — smooth entity animation between IoT readings
// Patent claim: "Real-time compositing of IoT data INTO satellite imagery"
//
// IoT readings arrive every 2 seconds. Without interpolation, entities would
// teleport between positions. The interpolator creates smooth 60fps movement
// by calculating intermediate positions using cubic easing.

import type { FusionEntity } from "@/types";

interface PositionSnapshot {
  lng: number;
  lat: number;
  heading: number;
  timestamp: number;
}

interface InterpolationState {
  entityId: string;
  previous: PositionSnapshot;
  target: PositionSnapshot;
  startTime: number;
  duration: number;
}

/**
 * FusionInterpolator — manages smooth position transitions for all entities
 *
 * On each IoT reading:
 *   1. Previous target becomes new "previous"
 *   2. New reading becomes new "target"
 *   3. Animation interpolates between them over the duration
 */
export class FusionInterpolator {
  private states = new Map<string, InterpolationState>();
  private defaultDuration: number;

  constructor(readingIntervalMs = 2000) {
    // Duration slightly longer than reading interval for overlap
    this.defaultDuration = readingIntervalMs * 1.1;
  }

  /**
   * Feed a new IoT reading for an entity
   */
  pushReading(entityId: string, lng: number, lat: number, heading: number) {
    const now = performance.now();
    const existing = this.states.get(entityId);

    if (existing) {
      // Capture current interpolated position as new "previous"
      const currentPos = this.getInterpolatedPosition(entityId, now);
      this.states.set(entityId, {
        entityId,
        previous: currentPos
          ? { lng: currentPos[0], lat: currentPos[1], heading: currentPos[2], timestamp: now }
          : existing.target,
        target: { lng, lat, heading, timestamp: now },
        startTime: now,
        duration: this.defaultDuration,
      });
    } else {
      // First reading — no interpolation needed
      const snapshot: PositionSnapshot = { lng, lat, heading, timestamp: now };
      this.states.set(entityId, {
        entityId,
        previous: snapshot,
        target: snapshot,
        startTime: now,
        duration: this.defaultDuration,
      });
    }
  }

  /**
   * Get the interpolated position at a given time
   * Returns [lng, lat, heading] or null if entity not tracked
   */
  getInterpolatedPosition(
    entityId: string,
    time = performance.now()
  ): [number, number, number] | null {
    const state = this.states.get(entityId);
    if (!state) return null;

    const elapsed = time - state.startTime;
    const t = Math.min(1, elapsed / state.duration);

    // Cubic ease-out for natural deceleration
    const eased = 1 - Math.pow(1 - t, 3);

    const lng = lerp(state.previous.lng, state.target.lng, eased);
    const lat = lerp(state.previous.lat, state.target.lat, eased);
    const heading = lerpAngle(state.previous.heading, state.target.heading, eased);

    return [lng, lat, heading];
  }

  /**
   * Batch update: apply interpolated positions to FusionEntity array
   * Called every animation frame (60fps) for smooth rendering
   */
  applyInterpolation(entities: FusionEntity[], time = performance.now()): FusionEntity[] {
    return entities.map((entity) => {
      const pos = this.getInterpolatedPosition(entity.id, time);
      if (!pos) return entity;

      return {
        ...entity,
        currentPosition: [pos[0], pos[1]] as [number, number],
        heading: pos[2],
      };
    });
  }

  /**
   * Calculate velocity (m/s) for an entity based on interpolation state
   */
  getVelocity(entityId: string): number {
    const state = this.states.get(entityId);
    if (!state) return 0;

    const dlng = state.target.lng - state.previous.lng;
    const dlat = state.target.lat - state.previous.lat;

    // Approximate distance in metres (equirectangular)
    const latRad = (state.target.lat * Math.PI) / 180;
    const dx = dlng * 111320 * Math.cos(latRad);
    const dy = dlat * 110540;
    const distanceM = Math.sqrt(dx * dx + dy * dy);

    const durationS = state.duration / 1000;
    return durationS > 0 ? distanceM / durationS : 0;
  }

  /**
   * Remove entity from interpolation tracking
   */
  removeEntity(entityId: string) {
    this.states.delete(entityId);
  }

  /**
   * Check if entity has active interpolation
   */
  isTracking(entityId: string): boolean {
    return this.states.has(entityId);
  }

  /**
   * Get number of actively tracked entities
   */
  get trackedCount(): number {
    return this.states.size;
  }

  /**
   * Clear all interpolation states
   */
  clear() {
    this.states.clear();
  }
}

// ============================================================
// Math helpers
// ============================================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate between two angles (in degrees), taking the shortest path
 */
function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

// Singleton for use across the fusion engine
let _interpolator: FusionInterpolator | null = null;

export function getFusionInterpolator(): FusionInterpolator {
  if (!_interpolator) {
    _interpolator = new FusionInterpolator();
  }
  return _interpolator;
}
