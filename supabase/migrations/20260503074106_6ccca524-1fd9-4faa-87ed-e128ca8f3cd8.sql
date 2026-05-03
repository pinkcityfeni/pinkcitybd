ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'reviews'
);
