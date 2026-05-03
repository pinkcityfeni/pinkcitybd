
-- Add separate district & area columns to orders for clarity
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_district text,
  ADD COLUMN IF NOT EXISTS delivery_area text;

-- Save user's default delivery details on profile so they don't have to retype
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS district text DEFAULT '',
  ADD COLUMN IF NOT EXISTS area text DEFAULT '';
