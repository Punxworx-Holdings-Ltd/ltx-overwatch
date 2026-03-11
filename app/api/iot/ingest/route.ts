import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["device_id", "device_type", "lng", "lat"];
    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate coordinates
    if (body.lng < -180 || body.lng > 180 || body.lat < -90 || body.lat > 90) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // In production: insert to Supabase iot_readings table
    // For now: echo back with fusion metadata
    const reading = {
      id: crypto.randomUUID(),
      device_id: body.device_id,
      device_type: body.device_type,
      entity_type: body.entity_type || "unknown",
      entity_id: body.entity_id || body.device_id,
      timestamp: new Date().toISOString(),
      lng: body.lng,
      lat: body.lat,
      payload: body.payload || {},
      confidence: 1.0,
      fusion_status: "queued",
      message:
        "IoT reading received. In production, this device would appear IN the satellite imagery at the specified coordinates via GPS-to-pixel compositing (US Patent 10,951,814 B2).",
    };

    return NextResponse.json(reading, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/iot/ingest",
    method: "POST",
    description:
      "Send IoT device data to appear IN satellite imagery via patented GPS-to-pixel compositing",
    required_fields: {
      device_id: "string — unique identifier for the IoT device",
      device_type:
        "string — gps_tracker | biometric_wearable | soil_sensor | ais_transponder | camera | weather_station | wildlife_collar | pipeline_sensor | drone",
      lng: "number — longitude (-180 to 180)",
      lat: "number — latitude (-90 to 90)",
    },
    optional_fields: {
      api_key: "string — authentication key",
      entity_type: "string — person | vehicle | vessel | animal | infrastructure | drone",
      entity_id: "string — human-readable identifier",
      payload: "object — sensor-specific data (heart_rate, speed, moisture, etc.)",
    },
    example: {
      api_key: "demo_public",
      device_id: "tracker-001",
      device_type: "gps_tracker",
      entity_type: "vehicle",
      entity_id: "Fleet Van #7",
      lng: -2.0975,
      lat: 57.1497,
      payload: { speed_kmh: 45, fuel_pct: 72 },
    },
    patent: "US 10,951,814 B2 — Merging Satellite Imagery with User-Generated Content",
  });
}
