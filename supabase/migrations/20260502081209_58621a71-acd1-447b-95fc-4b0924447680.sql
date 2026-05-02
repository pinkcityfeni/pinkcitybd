-- =========== Vouchers table ===========
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('product', 'category')),
  scope_product_id UUID,
  scope_category TEXT,
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expire_at TIMESTAMPTZ NOT NULL,
  per_customer_limit INTEGER NOT NULL DEFAULT 1,
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vouchers_code ON public.vouchers (code);
CREATE INDEX idx_vouchers_active ON public.vouchers (active);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vouchers are public" ON public.vouchers FOR SELECT USING (true);
CREATE POLICY "Admins manage vouchers" ON public.vouchers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_vouchers_updated_at
BEFORE UPDATE ON public.vouchers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger (avoid CHECK with non-immutable expressions)
CREATE OR REPLACE FUNCTION public.validate_voucher_dates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expire_at <= NEW.start_at THEN
    RAISE EXCEPTION 'expire_at must be after start_at';
  END IF;
  IF NEW.scope_type = 'product' AND NEW.scope_product_id IS NULL THEN
    RAISE EXCEPTION 'scope_product_id required when scope_type = product';
  END IF;
  IF NEW.scope_type = 'category' AND (NEW.scope_category IS NULL OR NEW.scope_category = '') THEN
    RAISE EXCEPTION 'scope_category required when scope_type = category';
  END IF;
  -- normalize code to uppercase
  NEW.code := upper(NEW.code);
  RETURN NEW;
END;
$$;

CREATE TRIGGER vouchers_validate_before_insert_update
BEFORE INSERT OR UPDATE ON public.vouchers
FOR EACH ROW EXECUTE FUNCTION public.validate_voucher_dates();

-- =========== Voucher redemptions table ===========
CREATE TABLE public.voucher_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL,
  order_id UUID,
  user_id UUID,
  customer_phone_normalized TEXT,
  discount_applied NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_voucher_redemptions_voucher ON public.voucher_redemptions (voucher_id);
CREATE INDEX idx_voucher_redemptions_phone ON public.voucher_redemptions (voucher_id, customer_phone_normalized);
CREATE INDEX idx_voucher_redemptions_user ON public.voucher_redemptions (voucher_id, user_id);

ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage redemptions" ON public.voucher_redemptions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

CREATE POLICY "Users view own redemptions" ON public.voucher_redemptions
FOR SELECT USING (auth.uid() = user_id);

-- =========== Add voucher columns to orders ===========
ALTER TABLE public.orders
  ADD COLUMN voucher_code TEXT,
  ADD COLUMN voucher_discount NUMERIC NOT NULL DEFAULT 0;
