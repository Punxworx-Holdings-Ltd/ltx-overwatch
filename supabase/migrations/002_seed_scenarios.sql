-- LTx OVERWATCH — Seed Scenarios
INSERT INTO scenarios (id, name, codename, description, location, center_lng, center_lat, default_zoom, imagery_mode) VALUES
  ('iron-curtain', 'Defence & Security', 'IRON CURTAIN',
   'Military compound perimeter security with patrol tracking, vehicle monitoring, and CCTV integration. Demonstrates geofence breach detection from space.',
   'Desert Compound', 44.3, 33.3, 15, 'true-color'),

  ('green-canopy', 'Precision Agriculture', 'GREEN CANOPY',
   'Smart farming with soil sensor networks, weather stations, and autonomous tractor tracking. NDVI vegetation health fused with IoT soil data.',
   'East Anglia, UK', 1.1, 52.6, 14, 'ndvi'),

  ('first-light', 'Disaster Response', 'FIRST LIGHT',
   'Urban earthquake response with survivor biometric tracking, responder coordination, and drone surveillance. Real-time triage from space.',
   'Earthquake Zone', 37.2, 37.0, 15, 'true-color'),

  ('deep-blue', 'Maritime Intelligence', 'DEEP BLUE',
   'Port security and vessel tracking with AIS transponder fusion. Identifies vessels within satellite imagery by MMSI, not just position.',
   'Aberdeen Port, UK', -2.07, 57.14, 13, 'true-color'),

  ('wild-pulse', 'Wildlife Conservation', 'WILD PULSE',
   'Anti-poaching operations with GPS-collared wildlife and ranger tracking. Animal health telemetry fused into satellite imagery of reserve.',
   'Masai Mara, Kenya', 35.0, -1.5, 13, 'true-color'),

  ('black-gold', 'Oil & Gas Infrastructure', 'BLACK GOLD',
   'Subsea pipeline monitoring with pressure sensor networks and patrol vessel tracking. Leak detection by spatial pressure interpolation.',
   'North Sea, UK', -1.8, 57.5, 12, 'true-color');
