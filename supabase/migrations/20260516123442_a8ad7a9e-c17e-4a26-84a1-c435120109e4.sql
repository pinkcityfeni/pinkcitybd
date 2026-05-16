ALTER VIEW public.products_public SET (security_invoker = off);
GRANT SELECT ON public.products_public TO anon, authenticated;