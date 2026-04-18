DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE POLICY "Users view own profile or staff views all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'cashier'::app_role)
);