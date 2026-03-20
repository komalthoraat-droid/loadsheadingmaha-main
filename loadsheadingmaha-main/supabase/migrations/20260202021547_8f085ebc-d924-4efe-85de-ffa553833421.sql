-- Add latitude and longitude columns to villages table for weather API lookups
ALTER TABLE public.villages 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Update existing villages with coordinates (Pune district villages)
UPDATE public.villages SET latitude = 18.9833, longitude = 74.0333 WHERE LOWER(name) LIKE '%nighoj%';
UPDATE public.villages SET latitude = 18.9647, longitude = 73.9442 WHERE LOWER(name) LIKE '%manchar%';
UPDATE public.villages SET latitude = 18.8263, longitude = 74.3792 WHERE LOWER(name) LIKE '%shirur%';
UPDATE public.villages SET latitude = 18.9214, longitude = 74.5833 WHERE LOWER(name) LIKE '%ralegan%';
UPDATE public.villages SET latitude = 18.8667, longitude = 74.0833 WHERE LOWER(name) LIKE '%supa%';

-- Add comment for documentation
COMMENT ON COLUMN public.villages.latitude IS 'Village latitude coordinate for weather API';
COMMENT ON COLUMN public.villages.longitude IS 'Village longitude coordinate for weather API';