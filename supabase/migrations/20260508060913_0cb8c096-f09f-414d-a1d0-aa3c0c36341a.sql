DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

CREATE OR REPLACE FUNCTION public.forward_notification_to_telegram()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hnytijfnlxtbugtpatlu.supabase.co/functions/v1/telegram-notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('title', NEW.title, 'message', NEW.message, 'type', NEW.type)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;