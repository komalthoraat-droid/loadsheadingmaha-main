-- Create light_problems table
CREATE TABLE public.light_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  substation_id UUID NOT NULL REFERENCES public.substations(id) ON DELETE CASCADE,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.light_problems ENABLE ROW LEVEL SECURITY;

-- Polices for light_problems
-- Anyone can insert a report
CREATE POLICY "Anyone can report a light problem"
ON public.light_problems FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can insert a report (authenticated)
CREATE POLICY "Authenticated users can report"
ON public.light_problems FOR INSERT
TO authenticated
WITH CHECK (true);

-- Anyone can insert a report (anon)
CREATE POLICY "Anon users can report"
ON public.light_problems FOR INSERT
TO anon
WITH CHECK (true);

-- Approval admins can view all reports
CREATE POLICY "Approval admins can view reports"
ON public.light_problems FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'approval_admin'
  )
);

-- Approval admins can update reports
CREATE POLICY "Approval admins can update reports"
ON public.light_problems FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'approval_admin'
  )
);

-- Trigger for update_at
CREATE TRIGGER update_light_problems_updated_at
BEFORE UPDATE ON public.light_problems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for problem photos if it doesn't exist.
-- Assuming we use Supabase SQL to create bucket if possible, or we will insert it.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('problem_photos', 'problem_photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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

CREATE POLICY "Approval admins can delete problem_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'problem_photos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'approval_admin'
  )
);
