-- Create engineers table
CREATE TABLE IF NOT EXISTS public.engineers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  assigned_substation_id UUID NOT NULL REFERENCES public.substations(id) ON DELETE CASCADE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;

-- Engineers: can read their own profile
CREATE POLICY "Engineers can read own profile"
ON public.engineers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Engineers: can insert their own profile during signup
CREATE POLICY "Users can insert their own engineer profile"
ON public.engineers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins: can read all engineers
CREATE POLICY "Admins can view all engineers"
ON public.engineers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'approval_admin')
  )
);

-- Admins: can update all engineers (approve/reject)
CREATE POLICY "Admins can update all engineers"
ON public.engineers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'approval_admin')
  )
);

-- Admins: can delete all engineers
CREATE POLICY "Admins can delete all engineers"
ON public.engineers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'approval_admin')
  )
);
