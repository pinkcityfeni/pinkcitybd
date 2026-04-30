-- Add returned_items tracker to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS returned_items jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Create pos_returns table
CREATE TABLE IF NOT EXISTS public.pos_returns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_refund numeric NOT NULL DEFAULT 0,
  refund_method text NOT NULL DEFAULT 'cash',
  reason text DEFAULT '',
  points_reverted integer NOT NULL DEFAULT 0,
  processed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_returns_order_id ON public.pos_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_returns_created_at ON public.pos_returns(created_at DESC);

ALTER TABLE public.pos_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage returns"
ON public.pos_returns
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'cashier'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'cashier'::app_role));

CREATE POLICY "Users view own returns"
ON public.pos_returns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = pos_returns.order_id AND o.user_id = auth.uid()
  )
);
