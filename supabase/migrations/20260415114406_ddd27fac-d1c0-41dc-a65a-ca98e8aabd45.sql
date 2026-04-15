
-- Add trending column to products
ALTER TABLE public.products ADD COLUMN trending boolean NOT NULL DEFAULT false;

-- Recreate the public view to include trending
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
  SELECT id, name, description, image, images, price, barcode, stock, category, subcategory, trending, created_at, updated_at
  FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;
