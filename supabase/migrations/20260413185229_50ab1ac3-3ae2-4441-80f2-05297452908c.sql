
-- Drop the contradictory policies
DROP POLICY IF EXISTS "Anon can select products for view" ON public.products;
DROP POLICY IF EXISTS "Authenticated non-admin can select products for view" ON public.products;
DROP POLICY IF EXISTS "Public products read via view" ON public.products;

-- Recreate: only admin/cashier can SELECT directly from products table
CREATE POLICY "Admin cashier select products"
ON public.products
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)
);

-- Recreate view without security_invoker (uses owner/definer permissions, bypasses RLS)
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
  SELECT id, name, description, image, images, price, barcode, stock, category, subcategory, created_at, updated_at
  FROM public.products;

-- Grant select on the view to anon and authenticated
GRANT SELECT ON public.products_public TO anon, authenticated;
