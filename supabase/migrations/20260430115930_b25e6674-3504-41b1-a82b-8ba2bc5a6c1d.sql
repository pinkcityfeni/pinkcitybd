-- customer_points table
CREATE TABLE public.customer_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_points_user ON public.customer_points(user_id);
CREATE INDEX idx_customer_points_phone ON public.customer_points(phone);

ALTER TABLE public.customer_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage customer_points"
ON public.customer_points FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

CREATE POLICY "Users view own points"
ON public.customer_points FOR SELECT
USING (auth.uid() = user_id);

CREATE TRIGGER update_customer_points_updated_at
BEFORE UPDATE ON public.customer_points
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- point_transactions table
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_points(id) ON DELETE CASCADE,
  order_id UUID NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','adjust')),
  points INTEGER NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_point_tx_customer ON public.point_transactions(customer_id);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage point_transactions"
ON public.point_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

CREATE POLICY "Users view own transactions"
ON public.point_transactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customer_points cp
  WHERE cp.id = customer_id AND cp.user_id = auth.uid()
));

-- orders table additions
ALTER TABLE public.orders
  ADD COLUMN customer_phone_normalized TEXT NULL,
  ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN points_redeemed INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_orders_phone_normalized ON public.orders(customer_phone_normalized);