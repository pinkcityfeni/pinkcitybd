
-- 1. Drop the SECURITY DEFINER view (use the products table directly with RLS)
DROP VIEW IF EXISTS public.products_public;

-- 2. Tighten orders INSERT: validate type, restrict POS to staff
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create online orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  type = 'online'
  OR (type = 'pos' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)))
);

-- 3. Restrict notifications INSERT to staff (edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS "System inserts notifications" ON public.notifications;
CREATE POLICY "Staff inserts notifications"
ON public.notifications
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));
