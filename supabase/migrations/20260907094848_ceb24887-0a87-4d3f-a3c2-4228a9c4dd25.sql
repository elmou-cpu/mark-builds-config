-- =========================================================
-- Phase 1/3: remove first-admin bootstrap, tighten grants
-- =========================================================
DROP FUNCTION IF EXISTS public.claim_first_admin();

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.products FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.categories FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.products FROM authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.categories FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.user_roles FROM authenticated;

-- =========================================================
-- Enums
-- =========================================================
CREATE TYPE public.order_status AS ENUM ('nouvelle','confirmee','prete','expediee','livree','annulee');
CREATE TYPE public.payment_status AS ENUM ('impaye','paye','rembourse','echoue');
CREATE TYPE public.delivery_mode AS ENUM ('retrait','livraison');
CREATE TYPE public.message_status AS ENUM ('nouveau','lu','resolu');

-- =========================================================
-- Column additions (additive, non-destructive)
-- =========================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS granted_by uuid;

-- =========================================================
-- store_settings (single row)
-- =========================================================
CREATE TABLE public.store_settings (
  id boolean PRIMARY KEY DEFAULT true,
  delivery_fee numeric NOT NULL DEFAULT 1200,
  free_delivery_threshold numeric,
  tax_rate numeric NOT NULL DEFAULT 0,
  default_low_stock_threshold integer NOT NULL DEFAULT 3,
  notification_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_single_row CHECK (id),
  CONSTRAINT store_settings_tax_rate_range CHECK (tax_rate >= 0 AND tax_rate <= 1),
  CONSTRAINT store_settings_delivery_fee_positive CHECK (delivery_fee >= 0)
);
GRANT SELECT ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store settings admin read" ON public.store_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.store_settings (id) VALUES (true);
CREATE TRIGGER store_settings_updated_at BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- orders / order_items
-- =========================================================
CREATE SEQUENCE public.order_number_seq;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  wilaya text NOT NULL,
  address text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  delivery_mode public.delivery_mode NOT NULL DEFAULT 'retrait',
  subtotal numeric NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  currency text NOT NULL DEFAULT 'DZD',
  payment_status public.payment_status NOT NULL DEFAULT 'impaye',
  payment_provider text,
  payment_reference text,
  paid_at timestamptz,
  status public.order_status NOT NULL DEFAULT 'nouvelle',
  cancelled_at timestamptz,
  cancellation_reason text,
  refunded_at timestamptz,
  refund_amount numeric,
  stock_released boolean NOT NULL DEFAULT false,
  client_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_amounts_positive CHECK (
    subtotal >= 0 AND shipping_fee >= 0 AND tax_amount >= 0
    AND discount_amount >= 0 AND total >= 0
  )
);
CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders admin read" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text NOT NULL DEFAULT '',
  product_slug text NOT NULL DEFAULT '',
  unit_price numeric NOT NULL,
  quantity integer NOT NULL,
  line_total numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_price_positive CHECK (unit_price >= 0 AND line_total >= 0)
);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items admin read" ON public.order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- contact_messages
-- =========================================================
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  status public.message_status NOT NULL DEFAULT 'nouveau',
  handled_by uuid,
  handled_at timestamptz,
  client_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_messages_created_at_idx ON public.contact_messages (created_at DESC);
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact messages admin read" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- audit_log
-- =========================================================
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_label text NOT NULL DEFAULT '',
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX audit_log_entity_idx ON public.audit_log (entity_type, entity_id);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit log admin read" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- admin_invitations
-- =========================================================
CREATE TABLE public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid,
  invited_user_id uuid,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_invitations_email_idx ON public.admin_invitations (lower(email));
GRANT SELECT ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitations admin read" ON public.admin_invitations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- rate_limits (internal, service_role only)
-- =========================================================
CREATE TABLE public.rate_limits (
  bucket text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- no policies: unreachable through the Data API for anon/authenticated

-- =========================================================
-- Rate limiting helper: atomic counter with exponential backoff
-- =========================================================
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer,
  p_backoff_seconds integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.rate_limits;
  v_retry integer;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) = 0 OR length(p_bucket) > 200 THEN
    RAISE EXCEPTION 'invalid bucket';
  END IF;
  IF p_limit < 1 OR p_window_seconds < 1 OR p_backoff_seconds < 1 THEN
    RAISE EXCEPTION 'invalid rate limit parameters';
  END IF;

  INSERT INTO public.rate_limits (bucket, attempts, window_start)
  VALUES (p_bucket, 0, now())
  ON CONFLICT (bucket) DO NOTHING;

  SELECT * INTO v_row FROM public.rate_limits WHERE bucket = p_bucket FOR UPDATE;

  IF v_row.blocked_until IS NOT NULL AND v_row.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after', ceil(extract(epoch FROM (v_row.blocked_until - now())))::int
    );
  END IF;

  IF v_row.window_start < now() - make_interval(secs => p_window_seconds) THEN
    UPDATE public.rate_limits
      SET attempts = 1, window_start = now(), blocked_until = NULL
      WHERE bucket = p_bucket;
    RETURN jsonb_build_object('allowed', true, 'retry_after', 0);
  END IF;

  IF v_row.attempts + 1 > p_limit THEN
    -- exponential backoff on repeated abuse of the same bucket
    v_retry := p_backoff_seconds * power(2, least(v_row.attempts - p_limit, 5))::int;
    UPDATE public.rate_limits
      SET attempts = attempts + 1,
          blocked_until = now() + make_interval(secs => v_retry)
      WHERE bucket = p_bucket;
    RETURN jsonb_build_object('allowed', false, 'retry_after', v_retry);
  END IF;

  UPDATE public.rate_limits SET attempts = attempts + 1 WHERE bucket = p_bucket;
  RETURN jsonb_build_object('allowed', true, 'retry_after', 0);
END
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.reset_rate_limit(p_bucket text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits WHERE bucket = p_bucket;
$$;
REVOKE ALL ON FUNCTION public.reset_rate_limit(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_rate_limit(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_rate_limit(text) TO service_role;

-- =========================================================
-- Atomic order creation: server-side pricing + safe stock
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_customer jsonb,
  p_client_ip text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.store_settings;
  v_item jsonb;
  v_product public.products;
  v_qty integer;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_tax numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_mode public.delivery_mode;
  v_name text;
  v_phone text;
  v_wilaya text;
  v_address text;
  v_notes text;
  v_email text;
  v_count integer;
  v_ids uuid[];
BEGIN
  -- ---- validate customer payload ----
  v_name := btrim(coalesce(p_customer->>'full_name',''));
  v_phone := btrim(coalesce(p_customer->>'phone',''));
  v_wilaya := btrim(coalesce(p_customer->>'wilaya',''));
  v_address := btrim(coalesce(p_customer->>'address',''));
  v_notes := btrim(coalesce(p_customer->>'notes',''));
  v_email := nullif(btrim(coalesce(p_customer->>'email','')),'');
  v_mode := coalesce(nullif(p_customer->>'delivery_mode',''),'retrait')::public.delivery_mode;

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'INVALID_NAME';
  END IF;
  IF length(v_phone) < 6 OR length(v_phone) > 30 THEN
    RAISE EXCEPTION 'INVALID_PHONE';
  END IF;
  IF length(v_wilaya) < 2 OR length(v_wilaya) > 60 THEN
    RAISE EXCEPTION 'INVALID_WILAYA';
  END IF;
  IF length(v_notes) > 1000 OR length(v_address) > 300 THEN
    RAISE EXCEPTION 'INVALID_ADDRESS';
  END IF;
  IF v_mode = 'livraison' AND length(v_address) < 5 THEN
    RAISE EXCEPTION 'ADDRESS_REQUIRED';
  END IF;

  -- ---- validate items payload ----
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_ITEMS';
  END IF;
  SELECT count(*) INTO v_count FROM jsonb_array_elements(p_items);
  IF v_count = 0 OR v_count > 50 THEN
    RAISE EXCEPTION 'INVALID_ITEMS';
  END IF;

  -- deterministic lock order prevents deadlocks between concurrent orders
  SELECT array_agg(DISTINCT (elem->>'product_id')::uuid ORDER BY (elem->>'product_id')::uuid)
    INTO v_ids
  FROM jsonb_array_elements(p_items) AS elem;

  PERFORM 1 FROM public.products WHERE id = ANY(v_ids) ORDER BY id FOR UPDATE;

  SELECT * INTO v_settings FROM public.store_settings WHERE id;

  v_order_number := 'MC-' || to_char(now(),'YYMMDD') || '-' ||
                    lpad(nextval('public.order_number_seq')::text, 4, '0');

  INSERT INTO public.orders (
    order_number, customer_name, customer_phone, customer_email, wilaya, address,
    notes, delivery_mode, subtotal, shipping_fee, tax_amount, total, client_ip
  ) VALUES (
    v_order_number, v_name, v_phone, v_email, v_wilaya, v_address,
    v_notes, v_mode, 0, 0, 0, 0, left(coalesce(p_client_ip,''), 60)
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    IF v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT * INTO v_product FROM public.products
      WHERE id = (v_item->>'product_id')::uuid;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;
    IF v_product.active IS NOT TRUE THEN
      RAISE EXCEPTION 'PRODUCT_UNAVAILABLE:%', v_product.name;
    END IF;
    IF v_product.status IN ('rupture') THEN
      RAISE EXCEPTION 'PRODUCT_OUT_OF_STOCK:%', v_product.name;
    END IF;
    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_product.name;
    END IF;

    UPDATE public.products
      SET stock = stock - v_qty,
          status = CASE WHEN stock - v_qty <= 0 AND status = 'disponible'
                        THEN 'rupture' ELSE status END
      WHERE id = v_product.id;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_sku, product_slug,
      unit_price, quantity, line_total
    ) VALUES (
      v_order_id, v_product.id, v_product.name, v_product.sku, v_product.slug,
      v_product.price, v_qty, v_product.price * v_qty
    );

    v_subtotal := v_subtotal + (v_product.price * v_qty);
  END LOOP;

  IF v_mode = 'livraison' THEN
    IF v_settings.free_delivery_threshold IS NOT NULL
       AND v_subtotal >= v_settings.free_delivery_threshold THEN
      v_shipping := 0;
    ELSE
      v_shipping := v_settings.delivery_fee;
    END IF;
  END IF;

  v_tax := round((v_subtotal + v_shipping) * v_settings.tax_rate, 2);
  v_total := v_subtotal + v_shipping + v_tax;

  UPDATE public.orders
    SET subtotal = v_subtotal, shipping_fee = v_shipping,
        tax_amount = v_tax, total = v_total
    WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'tax_amount', v_tax,
    'total', v_total
  );
END
$$;
REVOKE ALL ON FUNCTION public.create_order(jsonb, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_order(jsonb, jsonb, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text) TO service_role;

-- =========================================================
-- Order cancellation: releases stock exactly once
-- =========================================================
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order_id uuid,
  p_reason text,
  p_actor uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_item public.order_items;
BEGIN
  IF p_actor IS NULL OR NOT public.has_role(p_actor, 'admin') THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;
  IF v_order.status = 'annulee' THEN
    RAISE EXCEPTION 'ALREADY_CANCELLED';
  END IF;

  IF v_order.stock_released IS NOT TRUE THEN
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      IF v_item.product_id IS NOT NULL THEN
        UPDATE public.products
          SET stock = stock + v_item.quantity,
              status = CASE WHEN status = 'rupture' AND stock + v_item.quantity > 0
                            THEN 'disponible' ELSE status END
          WHERE id = v_item.product_id;
      END IF;
    END LOOP;
  END IF;

  UPDATE public.orders
    SET status = 'annulee',
        cancelled_at = now(),
        cancellation_reason = left(coalesce(p_reason,''), 500),
        stock_released = true
    WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true);
END
$$;
REVOKE ALL ON FUNCTION public.cancel_order(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_order(uuid, text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order(uuid, text, uuid) TO service_role;

-- =========================================================
-- Public catalogue policy update: only active categories
-- =========================================================
DROP POLICY IF EXISTS "categories public read" ON public.categories;
CREATE POLICY "categories public read active" ON public.categories
  FOR SELECT TO anon USING (active = true);
CREATE POLICY "categories authenticated read" ON public.categories
  FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));