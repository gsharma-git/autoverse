-- ============================================================
-- Phase 1: Reseed services table with all 15 AutoVerse services
-- ============================================================

-- Clear old 10-service seed (by slug prefix that doesn't match new IDs)
DELETE FROM public.dealer_services WHERE service_id NOT IN (
  'new-alloys','alloyment-balancing','tyre-service','car-washing',
  'detailing-nitrogen','car-battery','car-accessories','spare-parts',
  'ev-vehicles','used-tyres-alloys','insurance','ev-charging',
  'tractor-tyre','bajaj-card','highway-hotels'
);

DELETE FROM public.services WHERE id NOT IN (
  'new-alloys','alloyment-balancing','tyre-service','car-washing',
  'detailing-nitrogen','car-battery','car-accessories','spare-parts',
  'ev-vehicles','used-tyres-alloys','insurance','ev-charging',
  'tractor-tyre','bajaj-card','highway-hotels'
);

-- Insert / update all 15 AutoVerse services
INSERT INTO public.services (id, slug, name, description, applicable_vehicles, icon, price_from_text) VALUES
  ('new-alloys',        'new-alloys',        'New Alloys & Tyres',
   'Browse and enquire on the widest range of new alloy wheels and tyres — car, bike, and tractor fitments available.',
   ARRAY['All'], 'circle', 'Quoted per fitment'),

  ('alloyment-balancing', 'alloyment-balancing', 'Alloyment & Balancing',
   'Precise hub-centric alloy fitment plus dynamic on-car balancing. Eliminates vibration and protects your new rims.',
   ARRAY['All'], 'settings', 'From ₹500/wheel'),

  ('tyre-service',      'tyre-service',      'Tyre Service',
   'Full-service tyre care: rotation, pressure check, puncture repair, replacement and nitrogen filling in one stop.',
   ARRAY['All'], 'wrench', 'From ₹149'),

  ('car-washing',       'car-washing',       'Car Washing',
   'Exterior wash, interior vacuum, tyre dressing and glass cleaning. Choose from basic, premium or foam wash packages.',
   ARRAY['Hatchback','Sedan','SUV','MUV','Luxury'], 'droplets', 'From ₹299'),

  ('detailing-nitrogen','detailing-nitrogen','Detailing & Nitrogen Filling',
   'Detailer-grade paint correction, ceramic coat prep, and nitrogen tyre inflation for longer pressure retention.',
   ARRAY['All'], 'sparkles', 'From ₹99'),

  ('car-battery',       'car-battery',       'Car Battery',
   'Free battery health check plus same-day replacement with top brands. Old battery buyback available.',
   ARRAY['Hatchback','Sedan','SUV','MUV','Luxury','Commercial Vehicle'], 'battery-charging', 'From ₹1,999'),

  ('car-accessories',   'car-accessories',   'Car & Bike Accessories',
   'Seat covers, floor mats, dashcams, alloy locks, bike accessories and more — fitted at the dealer.',
   ARRAY['All'], 'package', 'Quoted per item'),

  ('spare-parts',       'spare-parts',       'Spare Parts',
   'Genuine and OEM-compatible spare parts sourced and fitted by verified dealers. Quick turnaround on common models.',
   ARRAY['All'], 'cog', 'Quoted per part'),

  ('ev-vehicles',       'ev-vehicles',       'E-Rickshaw & E-Scooty',
   'EV two-wheeler and three-wheeler sales, tyre fitment and battery servicing at AutoVerse partner dealers.',
   ARRAY['E-Rickshaw','E-Scooty'], 'zap', 'Quoted on enquiry'),

  ('used-tyres-alloys', 'used-tyres-alloys', 'Used Tyres & Alloys',
   'Quality-checked second-hand tyres and alloy wheels. Significant savings for budget-conscious buyers.',
   ARRAY['All'], 'refresh-cw', 'From ₹499'),

  ('insurance',         'insurance',         'Vehicle Insurance',
   'Compare and buy motor insurance via AutoVerse partner dealers. Comprehensive, third-party, and add-on covers.',
   ARRAY['All'], 'shield-check', 'Quoted on enquiry'),

  ('ev-charging',       'ev-charging',       'EV Charging Point Locator',
   'Find verified EV charging stations near you through the AutoVerse dealer network.',
   ARRAY['Electric Vehicles'], 'plug-zap', 'Free to locate'),

  ('tractor-tyre',      'tractor-tyre',      'Tractor & EV Tyres',
   'Specialist fitment for tractor tyres, agricultural tyres, and EV-specific tyre variants from verified dealers.',
   ARRAY['Tractor','Electric Vehicles'], 'tractor', 'Quoted per fitment'),

  ('bajaj-card',        'bajaj-card',        'Bajaj Finserv EMI Card',
   'Buy tyres and alloys on easy EMI through the Bajaj Finserv card, accepted at AutoVerse partner dealers.',
   ARRAY['All'], 'credit-card', '0% EMI available'),

  ('highway-hotels',    'highway-hotels',    'Highway Hotels',
   'Rest stops and highway hospitality partners near AutoVerse dealers. Useful for long-haul drivers.',
   ARRAY['All'], 'building-2', 'Quoted on enquiry')

ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  applicable_vehicles = EXCLUDED.applicable_vehicles,
  icon            = EXCLUDED.icon,
  price_from_text = EXCLUDED.price_from_text;
