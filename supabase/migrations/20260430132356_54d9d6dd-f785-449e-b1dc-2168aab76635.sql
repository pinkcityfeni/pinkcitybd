ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price numeric NOT NULL DEFAULT 0;