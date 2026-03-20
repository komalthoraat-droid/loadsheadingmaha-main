-- Fix the light_problems policies to checking 'admin' instead of 'approval_admin'
-- This was preventing Approval Authority users from seeing and updating the reports.

-- 1. Drop old policies from light_problems
DROP POLICY IF EXISTS "Approval admins can view reports" ON public.light_problems;
DROP POLICY IF EXISTS "Approval admins can update reports" ON public.light_problems;

-- 2. Create new policies with 'admin' role
CREATE POLICY "Admins can view reports"
ON public.light_problems FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update reports"
ON public.light_problems FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 3. Fix storage policy (optional, to make sure admin can delete photos if needed)
DROP POLICY IF EXISTS "Approval admins can delete problem_photos" ON storage.objects;

CREATE POLICY "Admins can delete problem_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'problem_photos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
