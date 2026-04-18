ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_products_source ON public.products(source);