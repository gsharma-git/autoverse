-- Change products.id from UUID → TEXT so mock IDs (e.g. "p-michelin-ps5") work directly.
-- Safe to run on empty tables; no data loss.

-- 1. Drop the FK on product_dealers that references products(id)
ALTER TABLE public.product_dealers DROP CONSTRAINT IF EXISTS product_dealers_product_id_fkey;

-- 2. Drop the PK on products and swap the column to TEXT
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.products ADD PRIMARY KEY (id);

-- 3. Swap product_dealers.product_id to TEXT and re-add FK
ALTER TABLE public.product_dealers ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE public.product_dealers ADD CONSTRAINT product_dealers_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
