-- LTx OVERWATCH — Seed Geofences (all 6 scenarios)

-- IRON CURTAIN — Exclusion zone around compound
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit, authorized_entities) VALUES
  ('GF-001', 'iron-curtain', 'EXCLUSION ZONE Alpha', 'exclusion', 'critical',
   44.3, 33.3, 0.5,
   ST_GeogFromText('POLYGON((44.2955 33.2955, 44.3045 33.2955, 44.3045 33.3045, 44.2955 33.3045, 44.2955 33.2955))'),
   true, false,
   ARRAY['PAT-01','PAT-02','PAT-03','PAT-04','VH-01','VH-02']),

  ('GF-002', 'iron-curtain', 'OUTER PERIMETER', 'alert', 'high',
   44.3, 33.3, 1.0,
   ST_GeogFromText('POLYGON((44.291 33.291, 44.309 33.291, 44.309 33.309, 44.291 33.309, 44.291 33.291))'),
   true, true,
   ARRAY['PAT-01','PAT-02','PAT-03','PAT-04','PAT-05','PAT-06','PAT-07','PAT-08','PAT-09','PAT-10','PAT-11','PAT-12','VH-01','VH-02','VH-03','VH-04']);

-- GREEN CANOPY — Farm boundaries
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit) VALUES
  ('GF-003', 'green-canopy', 'North Field Boundary', 'alert', 'low',
   1.1, 52.61, 0.8,
   ST_GeogFromText('POLYGON((1.092 52.603, 1.108 52.603, 1.108 52.617, 1.092 52.617, 1.092 52.603))'),
   false, true),

  ('GF-004', 'green-canopy', 'Irrigation Zone', 'alert', 'medium',
   1.1, 52.595, 0.3,
   ST_GeogFromText('POLYGON((1.097 52.593, 1.103 52.593, 1.103 52.597, 1.097 52.597, 1.097 52.593))'),
   true, false);

-- FIRST LIGHT — Disaster zones
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit) VALUES
  ('GF-005', 'first-light', 'Collapse Zone Alpha', 'exclusion', 'critical',
   37.21, 37.01, 0.2,
   ST_GeogFromText('POLYGON((37.208 37.008, 37.212 37.008, 37.212 37.012, 37.208 37.012, 37.208 37.008))'),
   true, true),

  ('GF-006', 'first-light', 'Triage Station', 'safe_zone', 'low',
   37.215, 37.005, 0.1,
   ST_GeogFromText('POLYGON((37.214 37.004, 37.216 37.004, 37.216 37.006, 37.214 37.006, 37.214 37.004))'),
   false, true);

-- DEEP BLUE — Port restricted zones
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit) VALUES
  ('GF-007', 'deep-blue', 'Port Restricted Zone', 'exclusion', 'high',
   -2.07, 57.14, 1.0,
   ST_GeogFromText('POLYGON((-2.08 57.131, -2.06 57.131, -2.06 57.149, -2.08 57.149, -2.08 57.131))'),
   true, true),

  ('GF-008', 'deep-blue', 'Shipping Lane Alpha', 'alert', 'medium',
   -2.05, 57.16, 2.0,
   ST_GeogFromText('POLYGON((-2.07 57.145, -2.03 57.145, -2.03 57.175, -2.07 57.175, -2.07 57.145))'),
   true, false);

-- WILD PULSE — Park boundary
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit) VALUES
  ('GF-009', 'wild-pulse', 'Park Boundary', 'alert', 'medium',
   35.0, -1.5, 5.0,
   ST_GeogFromText('POLYGON((34.955 -1.545, 35.045 -1.545, 35.045 -1.455, 34.955 -1.455, 34.955 -1.545))'),
   false, true),

  ('GF-010', 'wild-pulse', 'Anti-Poaching Zone', 'exclusion', 'critical',
   35.02, -1.48, 1.5,
   ST_GeogFromText('POLYGON((35.007 -1.493, 35.033 -1.493, 35.033 -1.467, 35.007 -1.467, 35.007 -1.493))'),
   true, true);

-- BLACK GOLD — Pipeline corridor
INSERT INTO geofences (id, scenario_id, name, fence_type, severity, center_lng, center_lat, radius_km, geometry, alert_on_entry, alert_on_exit) VALUES
  ('GF-011', 'black-gold', 'Pipeline Corridor', 'alert', 'high',
   -1.8, 57.5, 0.3,
   ST_GeogFromText('POLYGON((-1.803 57.497, -1.797 57.497, -1.797 57.503, -1.803 57.503, -1.803 57.497))'),
   true, false),

  ('GF-012', 'black-gold', 'Platform Exclusion Zone', 'exclusion', 'critical',
   -1.75, 57.52, 0.5,
   ST_GeogFromText('POLYGON((-1.755 57.515, -1.745 57.515, -1.745 57.525, -1.755 57.525, -1.755 57.515))'),
   true, true);
