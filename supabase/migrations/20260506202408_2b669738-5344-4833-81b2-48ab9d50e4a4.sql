
-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view notifications" ON public.notifications
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'cashier'));
CREATE POLICY "Staff update notifications" ON public.notifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'cashier'));
CREATE POLICY "Staff delete notifications" ON public.notifications
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: new order
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_title text;
  v_msg text;
  v_type text;
BEGIN
  IF NEW.payment_status = 'partial' AND NEW.advance_trx_id IS NOT NULL THEN
    v_type := 'advance_paid';
    v_title := '💸 Advance Payment Received';
    v_msg := COALESCE(NEW.customer_name, 'Guest') || ' — ৳' || NEW.delivery_charge::text || ' advance (TrxID: ' || NEW.advance_trx_id || ')';
  ELSE
    v_type := 'order';
    v_title := '🛒 New Order — ৳' || NEW.total::text;
    v_msg := COALESCE(NEW.customer_name, 'Guest') || ' · ' || COALESCE(NEW.customer_phone, '') || ' · ' || COALESCE(NEW.payment_method, '');
  END IF;

  INSERT INTO public.notifications (type, title, message, link, metadata)
  VALUES (v_type, v_title, v_msg, '/admin/orders',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'phone', NEW.customer_phone, 'trx_id', NEW.advance_trx_id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_order ON public.orders;
CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- Trigger: new review
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link, metadata)
  VALUES ('review',
    '⭐ New Review (' || NEW.rating::text || '/5)',
    COALESCE(NEW.customer_name, 'Customer') || ': ' || LEFT(COALESCE(NEW.comment, ''), 100),
    '/admin/reviews',
    jsonb_build_object('review_id', NEW.id, 'product_id', NEW.product_id, 'rating', NEW.rating));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
CREATE TRIGGER trg_notify_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();

-- Trigger: new signup (via profile insert)
CREATE OR REPLACE FUNCTION public.notify_new_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link, metadata)
  VALUES ('signup',
    '👤 New Customer Signup',
    COALESCE(NEW.name, '') || ' · ' || COALESCE(NEW.phone, ''),
    '/admin/customers',
    jsonb_build_object('user_id', NEW.user_id, 'name', NEW.name, 'phone', NEW.phone));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_signup ON public.profiles;
CREATE TRIGGER trg_notify_new_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_signup();

-- Admin settings (telegram chat id, etc.)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage admin_settings" ON public.admin_settings
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
