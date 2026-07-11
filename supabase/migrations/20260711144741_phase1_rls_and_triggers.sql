-- ============================================================
-- Phase 1: Create catalog tables + RLS + trigger improvements
-- ============================================================

-- Helper: is the current user an admin? (avoids enum cast issues)
-- Uses a direct subquery so it works even if app_role enum name differs.
-- We define this inline in each policy rather than calling has_role().

-- =========== brands ===========
CREATE TABLE IF NOT EXISTS public.brands (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL CHECK (category IN ('tyre','alloy'))
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL    ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_brands"  ON public.brands;
DROP POLICY IF EXISTS "admin_write_brands"  ON public.brands;
CREATE POLICY "public_read_brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "admin_write_brands" ON public.brands FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

-- =========== products ===========
CREATE TABLE IF NOT EXISTS public.products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT UNIQUE NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('tyre','alloy')),
  name                 TEXT NOT NULL,
  brand_id             TEXT REFERENCES public.brands(id),
  price                NUMERIC(10,2) NOT NULL DEFAULT 0,
  size                 TEXT NOT NULL DEFAULT '',
  wheel_size           NUMERIC(5,1) NOT NULL DEFAULT 0,
  colour               TEXT,
  rating               NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count         INT NOT NULL DEFAULT 0,
  compatible_vehicles  TEXT[] NOT NULL DEFAULT '{}',
  images               TEXT[] NOT NULL DEFAULT '{}',
  specs                JSONB NOT NULL DEFAULT '{}',
  tagline              TEXT NOT NULL DEFAULT '',
  featured             BOOLEAN NOT NULL DEFAULT false,
  trending             BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL    ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products"  ON public.products;
DROP POLICY IF EXISTS "admin_write_products"  ON public.products;
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (true);
CREATE POLICY "admin_write_products" ON public.products FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

-- =========== dealers ===========
CREATE TABLE IF NOT EXISTS public.dealers (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  city             TEXT NOT NULL DEFAULT '',
  pincode          TEXT NOT NULL DEFAULT '',
  address          TEXT NOT NULL DEFAULT '',
  distance_km      NUMERIC(6,2) NOT NULL DEFAULT 0,
  rating           NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count     INT NOT NULL DEFAULT 0,
  membership       TEXT NOT NULL DEFAULT 'free' CHECK (membership IN ('free','silver','gold','diamond')),
  phone            TEXT NOT NULL DEFAULT '',
  whatsapp         TEXT NOT NULL DEFAULT '',
  hours_text       TEXT NOT NULL DEFAULT '',
  logo_initials    TEXT NOT NULL DEFAULT '',
  storefront_image TEXT,
  since            INT NOT NULL DEFAULT 2020,
  enquiry_count    INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dealers TO anon, authenticated;
GRANT ALL    ON public.dealers TO service_role;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_dealers"  ON public.dealers;
DROP POLICY IF EXISTS "admin_write_dealers"  ON public.dealers;
CREATE POLICY "public_read_dealers" ON public.dealers FOR SELECT USING (true);
CREATE POLICY "admin_write_dealers" ON public.dealers FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

-- =========== services ===========
CREATE TABLE IF NOT EXISTS public.services (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  description          TEXT NOT NULL DEFAULT '',
  applicable_vehicles  TEXT[] NOT NULL DEFAULT '{}',
  icon                 TEXT NOT NULL DEFAULT '',
  price_from_text      TEXT NOT NULL DEFAULT ''
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL    ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_services"  ON public.services;
DROP POLICY IF EXISTS "admin_write_services"  ON public.services;
CREATE POLICY "public_read_services" ON public.services FOR SELECT USING (true);
CREATE POLICY "admin_write_services" ON public.services FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

-- =========== product_dealers (junction) ===========
CREATE TABLE IF NOT EXISTS public.product_dealers (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  dealer_id  TEXT REFERENCES public.dealers(id)  ON DELETE CASCADE,
  PRIMARY KEY (product_id, dealer_id)
);
GRANT SELECT ON public.product_dealers TO anon, authenticated;
GRANT ALL    ON public.product_dealers TO service_role;
ALTER TABLE public.product_dealers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_dealers" ON public.product_dealers;
CREATE POLICY "public_read_product_dealers" ON public.product_dealers FOR SELECT USING (true);

-- =========== dealer_services (junction) ===========
CREATE TABLE IF NOT EXISTS public.dealer_services (
  dealer_id  TEXT REFERENCES public.dealers(id)  ON DELETE CASCADE,
  service_id TEXT REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (dealer_id, service_id)
);
GRANT SELECT ON public.dealer_services TO anon, authenticated;
GRANT ALL    ON public.dealer_services TO service_role;
ALTER TABLE public.dealer_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_dealer_services" ON public.dealer_services;
CREATE POLICY "public_read_dealer_services" ON public.dealer_services FOR SELECT USING (true);

-- =========== Enquiries: allow anon INSERT ===========
DROP POLICY IF EXISTS "insert_enquiries_anon" ON public.enquiries;
CREATE POLICY "insert_enquiries_anon" ON public.enquiries FOR INSERT TO anon
  WITH CHECK (customer_id IS NULL);
GRANT INSERT ON public.enquiries TO anon;

-- =========== Trigger: notify admins on new vendor application ===========
CREATE OR REPLACE FUNCTION public.notify_admins_of_new_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (user_id, title, body)
    SELECT user_id,
           'New vendor application',
           COALESCE(NEW.business_name, 'Unknown business') || ' (' || COALESCE(NEW.owner_name, '') || ') applied to join AutoVerse. Review in Admin → Vendors.'
    FROM public.user_roles
    WHERE role::text = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_vendor ON public.vendors;
CREATE TRIGGER trg_notify_admins_on_vendor
  AFTER INSERT ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_new_vendor();

-- =========== Update handle_new_user: write phone/vehicle/pincode ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested_role TEXT;
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, vehicle, pincode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'vehicle', ''),
    COALESCE(NEW.raw_user_meta_data->>'pincode', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    phone   = EXCLUDED.phone,
    vehicle = EXCLUDED.vehicle,
    pincode = EXCLUDED.pincode;

  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  -- Never let signups self-assign admin
  IF requested_role = 'admin' THEN requested_role := 'customer'; END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role::public.app_role)
  ON CONFLICT DO NOTHING;

  IF requested_role = 'vendor' THEN
    INSERT INTO public.vendors (id, owner_name, email, status)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email, 'pending')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- =========== CMS: update AutoVerse branding ===========
UPDATE public.cms_pages
SET body = 'AutoVerse is India''s dedicated marketplace for verified tyre, alloy and auto service dealers.'
WHERE id = 'about';
