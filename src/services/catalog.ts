import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CatalogBrand {
  id: string;
  name: string;
  category: "tyre" | "alloy";
}

export interface CatalogService {
  id: string;
  name: string;
  slug: string;
  description: string;
  applicable_vehicles: string[];
  icon: string;
  price_from_text: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: "tyre" | "alloy";
  brand_id: string;
  price: number;
  size: string;
  tagline: string;
  featured: boolean;
  trending: boolean;
  images: string[];
}

export interface CatalogDealer {
  id: string;
  name: string;
  slug: string;
  city: string;
  pincode: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours_text: string;
  logo_initials: string;
  storefront_image?: string;
  membership: "free" | "silver" | "gold" | "diamond";
  rating: number;
  since: number;
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function fetchCatalogBrands(): Promise<CatalogBrand[]> {
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function insertBrand(id: string, name: string, category: "tyre" | "alloy"): Promise<void> {
  const { error } = await supabase.from("brands").insert({ id, name, category });
  if (error) throw error;
}

export async function updateBrand(id: string, name: string, category: "tyre" | "alloy"): Promise<void> {
  const { error } = await supabase.from("brands").update({ name, category }).eq("id", id);
  if (error) throw error;
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;
}

// ── Services ───────────────────────────────────────────────────────────────────

export async function fetchCatalogServices(): Promise<CatalogService[]> {
  const { data, error } = await supabase.from("services").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export interface CatalogServicePayload {
  name: string;
  slug: string;
  description: string;
  icon: string;
  price_from_text: string;
  applicable_vehicles: string[];
}

export async function insertService(id: string, payload: CatalogServicePayload): Promise<void> {
  const { error } = await supabase.from("services").insert({ id, ...payload });
  if (error) throw error;
}

export async function updateService(id: string, payload: CatalogServicePayload): Promise<void> {
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ── Products ───────────────────────────────────────────────────────────────────

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,category,brand_id,price,size,tagline,featured,trending,images")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export interface CatalogProductPayload {
  name: string;
  slug: string;
  category: "tyre" | "alloy";
  brand_id: string;
  size: string;
  price: number;
  tagline: string;
  featured: boolean;
  trending: boolean;
  images: string[];
}

export async function insertProduct(id: string, payload: CatalogProductPayload): Promise<void> {
  const { error } = await supabase.from("products").insert({ id, ...payload });
  if (error) throw error;
}

export async function updateProduct(id: string, payload: CatalogProductPayload): Promise<void> {
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw error;
}

export async function toggleProductFlag(
  id: string,
  flag: "featured" | "trending",
  newValue: boolean,
): Promise<void> {
  const { error } = await supabase.from("products").update({ [flag]: newValue }).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ── Dealers ───────────────────────────────────────────────────────────────────

export async function fetchCatalogDealers(): Promise<CatalogDealer[]> {
  const { data, error } = await supabase
    .from("dealers")
    .select("id,name,slug,city,pincode,address,phone,whatsapp,hours_text,logo_initials,storefront_image,membership,rating,since")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export interface CatalogDealerPayload {
  name: string;
  slug: string;
  city: string;
  pincode: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours_text: string;
  logo_initials: string;
  storefront_image: string | null;
  membership: "free" | "silver" | "gold" | "diamond";
  since: number;
}

export async function insertDealer(id: string, payload: CatalogDealerPayload): Promise<void> {
  const { error } = await supabase.from("dealers").insert({ id, ...payload });
  if (error) throw error;
}

export async function updateDealer(id: string, payload: CatalogDealerPayload): Promise<void> {
  const { error } = await supabase.from("dealers").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteDealer(id: string): Promise<void> {
  const { error } = await supabase.from("dealers").delete().eq("id", id);
  if (error) throw error;
}
