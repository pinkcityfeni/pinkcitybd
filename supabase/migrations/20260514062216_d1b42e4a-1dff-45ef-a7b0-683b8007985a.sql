
-- 1. Restrict vouchers SELECT to admins only (validation runs server-side via edge function with service role)
DROP POLICY IF EXISTS "Vouchers are public" ON public.vouchers;

-- 2. Remove direct public SELECT on products. Storefront uses the products_public view (which excludes buying_price). Admin/cashier policies still allow staff access.
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- Ensure anon and authenticated can read the public view
GRANT SELECT ON public.products_public TO anon, authenticated;

-- 3. Remove notifications from realtime publication (admin Notifications page does not subscribe; staff still read via standard queries)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications';
  END IF;
END $$;
