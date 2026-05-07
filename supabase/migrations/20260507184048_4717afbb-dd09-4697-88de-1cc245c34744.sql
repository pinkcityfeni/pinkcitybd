
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage own subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)))
WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)));

CREATE POLICY "Admins view all subscriptions"
ON public.push_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_push_subs_user ON public.push_subscriptions(user_id);

-- Update trigger to also fire push notifications
CREATE OR REPLACE FUNCTION public.forward_notification_to_telegram()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Telegram
  PERFORM net.http_post(
    url := 'https://hnytijfnlxtbugtpatlu.supabase.co/functions/v1/telegram-notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('title', NEW.title, 'message', NEW.message, 'type', NEW.type)
  );
  -- Web Push
  PERFORM net.http_post(
    url := 'https://hnytijfnlxtbugtpatlu.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('title', NEW.title, 'message', NEW.message, 'type', NEW.type, 'link', NEW.link)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;
