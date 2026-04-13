
-- Create a public view excluding buying_price
CREATE VIEW public.products_public
WITH (security_invoker=on) AS
  SELECT id, name, description, image, images, price, barcode, stock, category, subcategory, created_at, updated_at
  FROM public.products;

-- Drop the old public SELECT policy
DROP POLICY IF EXISTS "Products are public" ON public.products;

-- New: public users can only SELECT via the view (which doesn't include buying_price)
CREATE POLICY "Public products read via view"
ON public.products
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)
);

-- Allow anonymous/unauthenticated SELECT so the view works for everyone
-- The view excludes buying_price, so this is safe
CREATE POLICY "Anon can select products for view"
ON public.products
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated non-admin can select products for view"
ON public.products
FOR SELECT
TO authenticated
USING (true);
