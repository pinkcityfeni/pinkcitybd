-- Restrict public SELECT on vouchers; codes/discounts must not be enumerable.
DROP POLICY IF EXISTS "Vouchers are public" ON public.vouchers;

CREATE POLICY "Staff view vouchers"
ON public.vouchers
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
);
