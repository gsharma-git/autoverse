
-- Enum for app roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer', 'vendor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========== profiles ===========
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  vehicle TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========== user_roles ===========
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- policies for user_roles
DROP POLICY IF EXISTS "users_read_own_roles" ON public.user_roles;
CREATE POLICY "users_read_own_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admins_manage_roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- policies for profiles
DROP POLICY IF EXISTS "read_own_profile_or_admin" ON public.profiles;
CREATE POLICY "read_own_profile_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- =========== vendors ===========
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id TEXT,
  owner_name TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
GRANT SELECT ON public.vendors TO anon;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_vendors_public" ON public.vendors;
CREATE POLICY "read_vendors_public" ON public.vendors FOR SELECT USING (true);
DROP POLICY IF EXISTS "insert_own_vendor" ON public.vendors;
CREATE POLICY "insert_own_vendor" ON public.vendors FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "update_own_vendor_or_admin" ON public.vendors;
CREATE POLICY "update_own_vendor_or_admin" ON public.vendors FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "admin_delete_vendor" ON public.vendors;
CREATE POLICY "admin_delete_vendor" ON public.vendors FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========== enquiries ===========
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_pincode TEXT NOT NULL DEFAULT '',
  product_id TEXT,
  service_id TEXT,
  dealer_id TEXT,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_enquiries_by_stake" ON public.enquiries;
CREATE POLICY "read_enquiries_by_stake" ON public.enquiries FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = auth.uid() AND v.dealer_id = enquiries.dealer_id
    )
  );
DROP POLICY IF EXISTS "insert_enquiries_any_auth" ON public.enquiries;
CREATE POLICY "insert_enquiries_any_auth" ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);
DROP POLICY IF EXISTS "update_enquiry_status" ON public.enquiries;
CREATE POLICY "update_enquiry_status" ON public.enquiries FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = auth.uid() AND v.dealer_id = enquiries.dealer_id)
  );

-- =========== notifications ===========
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_notifications" ON public.notifications;
CREATE POLICY "read_own_notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========== favourites ===========
CREATE TABLE IF NOT EXISTS public.favourite_products (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favourite_products TO authenticated;
GRANT ALL ON public.favourite_products TO service_role;
ALTER TABLE public.favourite_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_fav_products" ON public.favourite_products;
CREATE POLICY "own_fav_products" ON public.favourite_products FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.favourite_dealers (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, dealer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favourite_dealers TO authenticated;
GRANT ALL ON public.favourite_dealers TO service_role;
ALTER TABLE public.favourite_dealers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_fav_dealers" ON public.favourite_dealers;
CREATE POLICY "own_fav_dealers" ON public.favourite_dealers FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========== vendor_products (moderated) ===========
CREATE TABLE IF NOT EXISTS public.vendor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tyre','alloy')),
  brand TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_products TO authenticated;
GRANT ALL ON public.vendor_products TO service_role;
GRANT SELECT ON public.vendor_products TO anon;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_approved_or_own_or_admin_products" ON public.vendor_products;
CREATE POLICY "read_approved_or_own_or_admin_products" ON public.vendor_products FOR SELECT
  USING (status = 'approved' OR vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "vendor_insert_own_products" ON public.vendor_products;
CREATE POLICY "vendor_insert_own_products" ON public.vendor_products FOR INSERT TO authenticated
  WITH CHECK (vendor_id = auth.uid());
DROP POLICY IF EXISTS "vendor_update_own_or_admin_products" ON public.vendor_products;
CREATE POLICY "vendor_update_own_or_admin_products" ON public.vendor_products FOR UPDATE TO authenticated
  USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "vendor_delete_own_or_admin_products" ON public.vendor_products;
CREATE POLICY "vendor_delete_own_or_admin_products" ON public.vendor_products FOR DELETE TO authenticated
  USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========== vendor_services (moderated) ===========
CREATE TABLE IF NOT EXISTS public.vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_from_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_services TO authenticated;
GRANT ALL ON public.vendor_services TO service_role;
GRANT SELECT ON public.vendor_services TO anon;
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_approved_or_own_or_admin_services" ON public.vendor_services;
CREATE POLICY "read_approved_or_own_or_admin_services" ON public.vendor_services FOR SELECT
  USING (status = 'approved' OR vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "vendor_insert_own_services" ON public.vendor_services;
CREATE POLICY "vendor_insert_own_services" ON public.vendor_services FOR INSERT TO authenticated
  WITH CHECK (vendor_id = auth.uid());
DROP POLICY IF EXISTS "vendor_update_own_or_admin_services" ON public.vendor_services;
CREATE POLICY "vendor_update_own_or_admin_services" ON public.vendor_services FOR UPDATE TO authenticated
  USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "vendor_delete_own_or_admin_services" ON public.vendor_services;
CREATE POLICY "vendor_delete_own_or_admin_services" ON public.vendor_services FOR DELETE TO authenticated
  USING (vendor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========== banners ===========
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT SELECT ON public.banners TO anon;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "banners_admin_write" ON public.banners;
CREATE POLICY "banners_admin_write" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== cms_pages ===========
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_pages TO authenticated;
GRANT SELECT ON public.cms_pages TO anon;
GRANT ALL ON public.cms_pages TO service_role;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_public_read" ON public.cms_pages;
CREATE POLICY "cms_public_read" ON public.cms_pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "cms_admin_write" ON public.cms_pages;
CREATE POLICY "cms_admin_write" ON public.cms_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== triggers ===========

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS trg_vendors_updated ON public.vendors;
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS trg_vendor_products_updated ON public.vendor_products;
CREATE TRIGGER trg_vendor_products_updated BEFORE UPDATE ON public.vendor_products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS trg_vendor_services_updated ON public.vendor_services;
CREATE TRIGGER trg_vendor_services_updated BEFORE UPDATE ON public.vendor_services FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP TRIGGER IF EXISTS trg_cms_updated ON public.cms_pages;
CREATE TRIGGER trg_cms_updated BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'customer'::public.app_role);
  IF requested_role = 'admin' THEN requested_role := 'customer'; END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, requested_role)
  ON CONFLICT DO NOTHING;

  IF requested_role = 'vendor' THEN
    INSERT INTO public.vendors (id, owner_name, email, status)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email, 'pending')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notify vendor when an enquiry lands for them
CREATE OR REPLACE FUNCTION public.notify_vendor_of_enquiry()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  vendor_uid UUID;
BEGIN
  IF NEW.dealer_id IS NOT NULL THEN
    SELECT id INTO vendor_uid FROM public.vendors WHERE dealer_id = NEW.dealer_id LIMIT 1;
    IF vendor_uid IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (vendor_uid, 'New enquiry from ' || NEW.customer_name, LEFT(NEW.message, 120));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_vendor_on_enquiry ON public.enquiries;
CREATE TRIGGER trg_notify_vendor_on_enquiry AFTER INSERT ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.notify_vendor_of_enquiry();

-- Realtime (safe to re-add, Supabase ignores duplicates)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.favourite_products; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.favourite_dealers; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_products; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_services; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.banners; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_pages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed initial CMS + banners
INSERT INTO public.cms_pages (id, label, body) VALUES
  ('about','About','AutoVerse is India''s dedicated marketplace for verified tyre and alloy dealers.'),
  ('privacy','Privacy Policy','We only collect what we need to route your enquiry to the right dealer.'),
  ('help','Help Centre','Contact our support team via the Contact page — Monday to Saturday, 10am to 7pm IST.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.banners (title, subtitle, active, sort_order) VALUES
  ('Diamond dealer week','50% off enquiry boost across Mumbai',true,1),
  ('Monsoon-ready promo','Featured tyres for rainy season',false,2)
ON CONFLICT DO NOTHING;
