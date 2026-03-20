-- Add latitude and longitude to villages table
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Update existing villages with coordinates
-- Nighoj Area
UPDATE public.villages SET latitude = 18.9833, longitude = 74.0333 WHERE name IN ('Nighoj', 'Tukai Mala', 'Dhawan Vasti', 'Shirsule');

-- Ralegan Area
UPDATE public.villages SET latitude = 18.9214, longitude = 74.5833 WHERE name IN ('Ralegan Therpal', 'Mazampur');

-- Shirur Area
UPDATE public.villages SET latitude = 18.8263, longitude = 74.3792 WHERE name IN ('Shirur City', 'Shirur');

-- Supa Area
UPDATE public.villages SET latitude = 18.8667, longitude = 74.0833 WHERE name IN ('Supa', 'Supa MIDC');

-- Manchar Area
UPDATE public.villages SET latitude = 18.9647, longitude = 73.9442 WHERE name IN ('Manchar', 'Avasari Khurd');

-- Default for others (Pune district center if not matched)
UPDATE public.villages SET latitude = 18.52, longitude = 73.85 WHERE latitude IS NULL OR longitude IS NULL;
