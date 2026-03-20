-- ===============================
-- 1. Create role enum
-- ===============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'approval_admin', 'engineer');
  END IF;
END$$;

-- ===============================
-- 2. Create user_roles table
-- ===============================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===============================
-- 3. Engineers approval column
-- ===============================
ALTER TABLE public.engineers
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- ===============================
-- 4. Role check function
-- ===============================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ===============================
-- 5. Approved engineer check
-- ===============================
CREATE OR REPLACE FUNCTION public.is_approved_engineer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.engineers
    WHERE user_id = _user_id AND is_approved = true
  );
$$;

-- ===============================
-- 6. RLS policies for user_roles
-- ===============================
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'approval_admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'approval_admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.has_role(auth.uid(), 'approval_admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- ===============================
-- 7. RLS policies for engineers
-- ===============================
CREATE POLICY "Admins can approve engineers"
ON public.engineers
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'approval_admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Approved engineers can edit schedules"
ON public.engineers
FOR SELECT
USING (public.is_approved_engineer(auth.uid()));

-- ===============================
-- 8. Create SUPER ADMIN account role
-- (User must already exist in auth.users)
-- ===============================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'thoratatharva257@gmail.com'
ON CONFLICT DO NOTHING;
