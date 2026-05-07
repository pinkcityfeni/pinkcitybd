
-- Recreate view with security_invoker so it respects caller's RLS
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = true)
AS
SELECT id, name, description, category, subcategory, price, compare_at_price,
       stock, image, images, barcode, trending, created_at, updated_at
FROM public.products;

-- Allow everyone to read products, but exclude the buying_price column from public grants
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke broad SELECT, then re-grant only non-sensitive columns to anon/authenticated
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (id, name, description, category, subcategory, price, compare_at_price,
              stock, image, images, barcode, trending, created_at, updated_at, brand_id, source)
  ON public.products TO anon, authenticated;

-- View needs SELECT grant
GRANT SELECT ON public.products_public TO anon, authenticated;
