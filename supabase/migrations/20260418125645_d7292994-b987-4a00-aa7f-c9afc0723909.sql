-- Drop all existing policies on storage.objects for images bucket
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- Public can view images
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Only admins can upload images
CREATE POLICY "Admins upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can update images
CREATE POLICY "Admins update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can delete images
CREATE POLICY "Admins delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);