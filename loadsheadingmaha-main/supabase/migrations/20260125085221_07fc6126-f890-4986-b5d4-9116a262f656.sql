-- Add DELETE policy for approval admins on engineers table
CREATE POLICY "Approval admins can delete engineers"
ON public.engineers FOR DELETE
USING (public.has_role(auth.uid(), 'approval_admin'));

-- Add DELETE policy for approval admins on user_roles table
CREATE POLICY "Approval admins can delete user roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'approval_admin'));

-- Add UPDATE policy for approval admins on user_roles table
CREATE POLICY "Approval admins can update user roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'approval_admin'));