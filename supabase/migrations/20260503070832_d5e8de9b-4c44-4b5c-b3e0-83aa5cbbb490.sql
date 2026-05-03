-- Delivery areas table (Feni sub-areas with admin-controlled charges)
CREATE TABLE public.delivery_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  charge numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery areas are public"
  ON public.delivery_areas FOR SELECT USING (true);

CREATE POLICY "Admins manage delivery areas"
  ON public.delivery_areas FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_delivery_areas_updated_at
  BEFORE UPDATE ON public.delivery_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few common Feni areas (admin can edit/add later)
INSERT INTO public.delivery_areas (name, charge, sort_order) VALUES
  ('Feni Sadar', 30, 1),
  ('Dagonbhuiyan', 60, 2),
  ('Chhagalnaiya', 60, 3),
  ('Parshuram', 70, 4),
  ('Fulgazi', 70, 5),
  ('Sonagazi', 80, 6);

-- Outside-Feni flat charge stored in app_settings (admin can override)
INSERT INTO public.app_settings (key, value)
VALUES ('delivery.outside_charge', '120')
ON CONFLICT (key) DO NOTHING;
