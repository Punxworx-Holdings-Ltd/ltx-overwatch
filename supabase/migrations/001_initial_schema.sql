-- LTx OVERWATCH — Initial Schema
-- PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCENARIOS
-- ============================================================
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  codename TEXT NOT NULL,
  description TEXT,
  location TEXT,
  center_lng DOUBLE PRECISION NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  default_zoom DOUBLE PRECISION DEFAULT 14,
  imagery_mode TEXT DEFAULT 'true-color',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- IOT DEVICES
-- ============================================================
CREATE TABLE iot_devices (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  device_type TEXT NOT NULL,         -- gps_tracker, soil_sensor, ais_transponder, etc.
  entity_type TEXT NOT NULL,         -- person, vehicle, vessel, sensor, animal
  entity_id TEXT NOT NULL,           -- callsign / display name
  status TEXT DEFAULT 'active',      -- active, inactive, alert
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_iot_devices_scenario ON iot_devices(scenario_id);

-- ============================================================
-- IOT READINGS (time-series, spatial indexed)
-- ============================================================
CREATE TABLE iot_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES iot_devices(id),
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  lng DOUBLE PRECISION NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326),
  payload JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_iot_readings_device ON iot_readings(device_id, recorded_at DESC);
CREATE INDEX idx_iot_readings_scenario ON iot_readings(scenario_id, recorded_at DESC);
CREATE INDEX idx_iot_readings_location ON iot_readings USING GIST(location);
CREATE INDEX idx_iot_readings_time ON iot_readings(recorded_at DESC);

-- Auto-populate geography column
CREATE OR REPLACE FUNCTION set_reading_geography()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reading_geography
  BEFORE INSERT ON iot_readings
  FOR EACH ROW EXECUTE FUNCTION set_reading_geography();

-- ============================================================
-- GEOFENCES
-- ============================================================
CREATE TABLE geofences (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  name TEXT NOT NULL,
  fence_type TEXT DEFAULT 'alert',     -- exclusion, alert, safe_zone
  severity TEXT DEFAULT 'medium',      -- critical, high, medium, low
  geometry GEOGRAPHY(Polygon, 4326) NOT NULL,
  center_lng DOUBLE PRECISION,
  center_lat DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  alert_on_entry BOOLEAN DEFAULT true,
  alert_on_exit BOOLEAN DEFAULT false,
  authorized_entities TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_geofences_scenario ON geofences(scenario_id);
CREATE INDEX idx_geofences_geometry ON geofences USING GIST(geometry);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  severity TEXT NOT NULL,              -- critical, high, medium, low
  alert_type TEXT NOT NULL,            -- geofence_breach, threshold, anomaly, identification
  title TEXT NOT NULL,
  description TEXT,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  status TEXT DEFAULT 'active',        -- active, acknowledged, resolved
  entity_id TEXT,
  device_id TEXT,
  geofence_id TEXT REFERENCES geofences(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_scenario ON alerts(scenario_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity, status);
CREATE INDEX idx_alerts_time ON alerts(created_at DESC);

-- ============================================================
-- SATELLITE TASKS
-- ============================================================
CREATE TABLE satellite_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scenario_id TEXT REFERENCES scenarios(id),
  satellite_name TEXT NOT NULL,
  target_lng DOUBLE PRECISION NOT NULL,
  target_lat DOUBLE PRECISION NOT NULL,
  bbox DOUBLE PRECISION[4],           -- [west, south, east, north]
  requested_window_start TIMESTAMPTZ,
  requested_window_end TIMESTAMPTZ,
  predicted_pass TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',       -- pending, scheduled, capturing, complete, failed
  resolution_m DOUBLE PRECISION,
  imagery_mode TEXT DEFAULT 'true-color',
  priority TEXT DEFAULT 'normal',      -- urgent, high, normal, low
  result_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_satellite_tasks_status ON satellite_tasks(status);
CREATE INDEX idx_satellite_tasks_scenario ON satellite_tasks(scenario_id);

-- ============================================================
-- IMAGERY CACHE
-- ============================================================
CREATE TABLE imagery_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tile_key TEXT UNIQUE NOT NULL,       -- "z/x/y" or bbox hash
  source TEXT NOT NULL,                -- sentinel-hub, mapbox
  imagery_mode TEXT DEFAULT 'true-color',
  bbox DOUBLE PRECISION[4],
  zoom_level INTEGER,
  storage_path TEXT,                   -- Supabase Storage path
  file_size_bytes INTEGER,
  captured_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_imagery_cache_key ON imagery_cache(tile_key);
CREATE INDEX idx_imagery_cache_expires ON imagery_cache(expires_at);

-- ============================================================
-- FUSION SESSIONS
-- ============================================================
CREATE TABLE fusion_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scenario_id TEXT REFERENCES scenarios(id),
  user_id UUID,
  viewport_center_lng DOUBLE PRECISION,
  viewport_center_lat DOUBLE PRECISION,
  viewport_zoom DOUBLE PRECISION,
  active_layers TEXT[] DEFAULT '{}',
  entity_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagery_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE fusion_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for demo mode
CREATE POLICY "public_read_scenarios" ON scenarios FOR SELECT USING (true);
CREATE POLICY "public_read_devices" ON iot_devices FOR SELECT USING (true);
CREATE POLICY "public_read_readings" ON iot_readings FOR SELECT USING (true);
CREATE POLICY "public_read_geofences" ON geofences FOR SELECT USING (true);
CREATE POLICY "public_read_alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "public_read_tasks" ON satellite_tasks FOR SELECT USING (true);
CREATE POLICY "public_read_imagery" ON imagery_cache FOR SELECT USING (true);
CREATE POLICY "public_read_sessions" ON fusion_sessions FOR SELECT USING (true);

-- Write policies (authenticated or service role)
CREATE POLICY "service_write_readings" ON iot_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "service_write_alerts" ON alerts FOR ALL USING (true);
CREATE POLICY "service_write_tasks" ON satellite_tasks FOR ALL USING (true);
CREATE POLICY "service_write_geofences" ON geofences FOR ALL USING (true);
CREATE POLICY "service_write_sessions" ON fusion_sessions FOR ALL USING (true);
