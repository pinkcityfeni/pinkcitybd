-- Update handle_new_user to also grant 5 signup bonus points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_phone TEXT;
  v_name TEXT;
  v_cp_id UUID;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  v_phone := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '\D', '', 'g');

  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (NEW.id, v_name, COALESCE(NEW.raw_user_meta_data->>'phone', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  -- Signup bonus: 5 points
  IF v_phone <> '' THEN
    -- Try to attach to existing phone row, else create new
    SELECT id INTO v_cp_id FROM public.customer_points WHERE phone = v_phone;
    IF v_cp_id IS NULL THEN
      INSERT INTO public.customer_points (user_id, phone, name, points, total_earned)
      VALUES (NEW.id, v_phone, v_name, 5, 5)
      RETURNING id INTO v_cp_id;
    ELSE
      UPDATE public.customer_points
      SET user_id = COALESCE(user_id, NEW.id),
          name = CASE WHEN name = '' THEN v_name ELSE name END,
          points = points + 5,
          total_earned = total_earned + 5
      WHERE id = v_cp_id;
    END IF;
  ELSE
    -- No phone — create row keyed on user id placeholder
    INSERT INTO public.customer_points (user_id, phone, name, points, total_earned)
    VALUES (NEW.id, 'user-' || NEW.id::text, v_name, 5, 5)
    RETURNING id INTO v_cp_id;
  END IF;

  INSERT INTO public.point_transactions (customer_id, type, points, note)
  VALUES (v_cp_id, 'adjust', 5, 'Signup bonus');

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();