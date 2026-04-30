CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#ec4899',
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are public"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "Admins manage brands"
  ON public.brands FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.brands (name, slug, color, is_default, sort_order) VALUES
  ('Personal', 'personal', '#ec4899', true, 0),
  ('Pastel', 'pastel', '#a78bfa', false, 1),
  ('Dorea', 'dorea', '#14b8a6', false, 2);

ALTER TABLE public.products ADD COLUMN brand_id UUID;
UPDATE public.products SET brand_id = (SELECT id FROM public.brands WHERE slug = 'personal');
ALTER TABLE public.products ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_products_brand_id ON public.products(brand_id);

ALTER TABLE public.categories ADD COLUMN brand_id UUID;
UPDATE public.categories SET brand_id = (SELECT id FROM public.brands WHERE slug = 'personal');
ALTER TABLE public.categories ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_categories_brand_id ON public.categories(brand_id);