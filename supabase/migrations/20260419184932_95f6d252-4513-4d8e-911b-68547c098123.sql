-- Recreate products_public view WITHOUT security_invoker so it uses owner privileges,
-- allowing public/anon users to read products via the view (excludes buying_price).
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public AS
SELECT id, name, description, category, subcategory, price, stock,
       image, images, barcode, trending, created_at, updated_at
FROM public.products;

-- Grant read access to anon and authenticated through the view
GRANT SELECT ON public.products_public TO anon, authenticated;