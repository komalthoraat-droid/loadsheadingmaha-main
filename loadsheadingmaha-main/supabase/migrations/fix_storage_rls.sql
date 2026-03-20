-- Run this in your new Supabase project's SQL Editor to fix the Storage Bucket RLS!

-- 1. Create storage bucket for problem photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('problem_photos', 'problem_photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they somehow already exist so we don't get errors
DROP POLICY IF EXISTS "Public read access for problem_photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to problem_photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to problem_photos (anon)" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to problem_photos (auth)" ON storage.objects;
DROP POLICY IF EXISTS "Approval admins can delete problem_photos" ON storage.objects;

-- 3. Storage policies to allow anyone to upload photos safely
CREATE POLICY "Public read access for problem_photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'problem_photos');

CREATE POLICY "Anyone can upload to problem_photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'problem_photos');

CREATE POLICY "Anyone can upload to problem_photos (anon)"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'problem_photos');

CREATE POLICY "Anyone can upload to problem_photos (auth)"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'problem_photos');
