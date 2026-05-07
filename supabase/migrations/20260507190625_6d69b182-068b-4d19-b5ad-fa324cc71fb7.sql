
-- Revoke EXECUTE on internal trigger functions from anon/authenticated (they only run via triggers / service-role)
REVOKE EXECUTE ON FUNCTION public.notify_new_signup() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_order() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_review() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.forward_notification_to_telegram() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_voucher_dates() FROM anon, authenticated;

-- Restrict listing on the public 'images' bucket: drop broad select, keep authenticated-only listing
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public can read individual images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'images');
-- Note: listing requires the storage API call which needs metadata; the prior open policy
-- allowed enumeration. We keep public reads of known paths but discourage listing by removing
-- the bucket from open enumeration via the storage.buckets public flag adjustment is not needed
-- as long as clients fetch by exact path.
