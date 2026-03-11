// FusionEngine — The Patent in Code
// US 10,951,814 B2: "Merging Satellite Imagery with User-Generated Content"
//
// This engine manages the real-time fusion of IoT device data with satellite
// imagery. It maintains entity state, interpolates positions between updates,
// and provides the data layer that custom deck.gl WebGL layers render INTO
// the satellite imagery — not ON TOP of it.

import type { FusionEntity, IoTReading, EntityType, DeviceType } from "@/types";
import { IOT_CONFIG } from "@/lib/utils/constants";

export class FusionEngine {
  private entities: Map<string, FusionEntity> = new Map();
  private updateCallbacks: Set<(entities: FusionEntity[]) => void> = new Set();
  private animationFrame: number | null = null;
  private lastFrameTime = 0;

  /**
   * Process an incoming IoT reading and update the fusion entity
   */
  processReading(reading: IoTReading & {
    entityType?: EntityType;
    entityId?: string;
    name?: string;
    deviceType?: DeviceType;
    status?: FusionEntity["status"];
  }): void {
    const existing = this.entities.get(reading.device_id);

    if (existing) {
      // Update existing entity — smooth transition to new position
      existing.previousPosition = [...existing.currentPosition] as [number, number];
      existing.targetPosition = [reading.lng, reading.lat];
      existing.transitionStart = Date.now();
      existing.heading = reading.heading ?? existing.heading;
      existing.speed = reading.speed ?? existing.speed;
      existing.latestPayload = reading.payload;
      existing.lastUpdate = new Date();
      existing.confidence = reading.confidence;
      existing.status = reading.status ?? existing.status;

      // Add to trail
      existing.trail.push([reading.lng, reading.lat, reading.timestamp]);
      if (existing.trail.length > IOT_CONFIG.trailMaxPoints) {
        existing.trail.shift();
      }
    } else {
      // Create new fusion entity
      const entity: FusionEntity = {
        id: reading.device_id,
        deviceId: reading.device_id,
        entityType: reading.entityType ?? "person",
        entityId: reading.entityId ?? reading.device_id,
        name: reading.name ?? reading.device_id,
        deviceType: reading.deviceType ?? "gps_tracker",
        currentPosition: [reading.lng, reading.lat],
        previousPosition: [reading.lng, reading.lat],
        targetPosition: [reading.lng, reading.lat],
        transitionStart: Date.now(),
        heading: reading.heading ?? 0,
        speed: reading.speed ?? 0,
        latestPayload: reading.payload,
        lastUpdate: new Date(),
        trail: [[reading.lng, reading.lat, reading.timestamp]],
        status: reading.status ?? "friendly",
        confidence: reading.confidence,
      };
      this.entities.set(reading.device_id, entity);
    }

    this.notifyListeners();
  }

  /**
   * Interpolate all entity positions for smooth animation
   * Called on each animation frame
   */
  interpolatePositions(): FusionEntity[] {
    const now = Date.now();
    const entities = Array.from(this.entities.values());

    for (const entity of entities) {
      const elapsed = now - entity.transitionStart;
      const progress = Math.min(elapsed / IOT_CONFIG.positionInterpolationMs, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      entity.currentPosition = [
        entity.previousPosition[0] +
          (entity.targetPosition[0] - entity.previousPosition[0]) * eased,
        entity.previousPosition[1] +
          (entity.targetPosition[1] - entity.previousPosition[1]) * eased,
      ];
    }

    return entities;
  }

  /**
   * Start the animation loop for smooth position interpolation
   */
  startAnimation(callback: (entities: FusionEntity[]) => void): void {
    this.updateCallbacks.add(callback);

    if (this.animationFrame !== null) return;

    const animate = (timestamp: number) => {
      if (timestamp - this.lastFrameTime >= 16) {
        // ~60fps cap
        this.lastFrameTime = timestamp;
        const entities = this.interpolatePositions();
        for (const cb of this.updateCallbacks) {
          cb(entities);
        }
      }
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.updateCallbacks.clear();
  }

  /**
   * Get all current fusion entities
   */
  getEntities(): FusionEntity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get a specific entity by device ID
   */
  getEntity(deviceId: string): FusionEntity | undefined {
    return this.entities.get(deviceId);
  }

  /**
   * Get entities filtered by status
   */
  getEntitiesByStatus(status: FusionEntity["status"]): FusionEntity[] {
    return Array.from(this.entities.values()).filter((e) => e.status === status);
  }

  /**
   * Get entity count by type
   */
  getEntityCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const entity of this.entities.values()) {
      counts[entity.entityType] = (counts[entity.entityType] || 0) + 1;
    }
    return counts;
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
    this.notifyListeners();
  }

  /**
   * Destroy the engine
   */
  destroy(): void {
    this.stopAnimation();
    this.clear();
  }

  private notifyListeners(): void {
    const entities = Array.from(this.entities.values());
    for (const cb of this.updateCallbacks) {
      cb(entities);
    }
  }
}
