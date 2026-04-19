-- Add approved column to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Mark existing reviews as approved so they don't disappear
UPDATE public.reviews SET approved = true WHERE approved = false;

-- Drop old public-read policy and replace with approved-only public read
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;

CREATE POLICY "Approved reviews are public"
ON public.reviews FOR SELECT
USING (approved = true);

-- Admins can see all reviews (including pending)
CREATE POLICY "Admins view all reviews"
ON public.reviews FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reviews (approve/reject)
CREATE POLICY "Admins update reviews"
ON public.reviews FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete reviews
CREATE POLICY "Admins delete reviews"
ON public.reviews FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));