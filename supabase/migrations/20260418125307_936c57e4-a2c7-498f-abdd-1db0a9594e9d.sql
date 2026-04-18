DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  description,
  category,
  subcategory,
  price,
  stock,
  image,
  images,
  barcode,
  trending,
  created_at,
  updated_at
FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;