import { supabase } from "@/integrations/supabase/client";
import type { Product, Dealer, Service, Brand } from "@/data/types";

// ── Mappers ────────────────────────────────────────────────────────────────

function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    brandId: row.brand_id,
    brandName: row.brands?.name,
    price: Number(row.price),
    size: row.size,
    wheelSize: row.wheel_size,
    colour: row.colour ?? undefined,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    compatibleVehicles: row.compatible_vehicles ?? [],
    images: row.images ?? [],
    specs: row.specs ?? {},
    tagline: row.tagline,
    availableDealerIds: (row.product_dealers ?? []).map((d: any) => d.dealer_id),
    featured: row.featured ?? false,
    trending: row.trending ?? false,
  };
}

function mapDealer(row: any): Dealer {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    pincode: row.pincode,
    address: row.address,
    distanceKm: Number(row.distance_km),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    verified: true,
    membership: row.membership,
    phone: row.phone,
    whatsapp: row.whatsapp,
    hoursText: row.hours_text,
    logoInitials: row.logo_initials,
    storefrontImage: row.storefront_image ?? undefined,
    since: row.since,
    enquiryCount: row.enquiry_count,
    services: (row.dealer_services ?? []).map((ds: any) => ds.service_id),
    productIds: (row.product_dealers ?? []).map((pd: any) => pd.product_id),
  };
}

function mapService(row: any): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    applicableVehicles: row.applicable_vehicles ?? [],
    icon: row.icon,
    priceFromText: row.price_from_text,
  };
}

function mapBrand(row: any): Brand {
  return { id: row.id, name: row.name, category: row.category };
}

// ── Products ───────────────────────────────────────────────────────────────

export async function fetchProducts(category?: "tyre" | "alloy"): Promise<Product[]> {
  let q = supabase
    .from("products")
    .select("*, brands(name), product_dealers(dealer_id)");
  if (category) q = (q as any).eq("category", category);
  const { data, error } = await (q as any)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, brands(name), product_dealers(dealer_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

// ── Dealers ────────────────────────────────────────────────────────────────

export async function fetchDealers(): Promise<Dealer[]> {
  const { data, error } = await supabase
    .from("dealers")
    .select("*, dealer_services(service_id), product_dealers(product_id)")
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDealer);
}

export async function fetchDealerById(id: string): Promise<Dealer | null> {
  const { data, error } = await supabase
    .from("dealers")
    .select("*, dealer_services(service_id), product_dealers(product_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDealer(data) : null;
}

export async function fetchDealersForProduct(productId: string): Promise<Dealer[]> {
  const { data, error } = await supabase
    .from("product_dealers")
    .select("dealers(*, dealer_services(service_id), product_dealers(product_id))")
    .eq("product_id", productId);
  if (error) throw error;
  return (data ?? []).map((row: any) => mapDealer(row.dealers)).filter(Boolean);
}

export async function fetchDealersForService(serviceId: string): Promise<Dealer[]> {
  const { data, error } = await supabase
    .from("dealer_services")
    .select("dealers(*, dealer_services(service_id), product_dealers(product_id))")
    .eq("service_id", serviceId);
  if (error) throw error;
  return (data ?? []).map((row: any) => mapDealer(row.dealers)).filter(Boolean);
}

export async function fetchProductsForDealer(dealerId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("product_dealers")
    .select("products(*, brands(name), product_dealers(dealer_id))")
    .eq("dealer_id", dealerId);
  if (error) throw error;
  return (data ?? []).map((row: any) => mapProduct(row.products)).filter(Boolean);
}

// ── Services ───────────────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase.from("services").select("*");
  if (error) throw error;
  return (data ?? []).map(mapService);
}

export async function fetchServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapService(data) : null;
}

export async function fetchServicesForDealer(dealerId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from("dealer_services")
    .select("services(*)")
    .eq("dealer_id", dealerId);
  if (error) throw error;
  return (data ?? []).map((row: any) => mapService(row.services)).filter(Boolean);
}

// ── Brands ─────────────────────────────────────────────────────────────────

export async function fetchBrands(category?: "tyre" | "alloy"): Promise<Brand[]> {
  let q = supabase.from("brands").select("*");
  if (category) q = (q as any).eq("category", category);
  const { data, error } = await (q as any).order("name");
  if (error) throw error;
  return (data ?? []).map(mapBrand);
}
