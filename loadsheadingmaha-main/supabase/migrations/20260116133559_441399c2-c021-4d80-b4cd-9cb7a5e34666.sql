-- Allow authenticated users to insert their own engineer profile (for signup)
CREATE POLICY "Users can create their own engineer profile"
ON public.engineers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());