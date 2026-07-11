import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dealers } from "./dealers";
import type {
  AdminProfile,
  CustomerProfile,
  Enquiry,
  Notification,
  VendorProfile,
} from "./types";

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  category: "tyre" | "alloy";
  brand: string;
  size: string;
  price: number;
  image: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface VendorServiceRow {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  priceFromText: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  active: boolean;
}

export interface CmsPage {
  id: string;
  label: string;
  body: string;
}

interface State {
  ready: boolean;
  currentUserId: string | null;
  currentRole: "customer" | "vendor" | "admin" | null;
  enquiries: Enquiry[];
  notifications: Notification[];
  customers: CustomerProfile[]; // profiles visible to this user (usually just self)
  vendors: VendorProfile[]; // publicly readable
  admins: AdminProfile[];
  banners: Banner[];
  cms: CmsPage[];
  vendorProducts: VendorProduct[];
  vendorServices: VendorServiceRow[];
}

// ============= Legacy seed exports (used only for typing/back-compat) =============
export const seedCustomers: CustomerProfile[] = [];
export const seedVendors: VendorProfile[] = [];
export const seedAdmins: AdminProfile[] = [];

// ============= State ==================
function emptyState(): State {
  return {
    ready: false,
    currentUserId: null,
    currentRole: null,
    enquiries: [],
    notifications: [],
    customers: [],
    vendors: [],
    admins: [],
    banners: [],
    cms: [],
    vendorProducts: [],
    vendorServices: [],
  };
}

let state: State = emptyState();
const listeners = new Set<() => void>();
let realtimeChannels: { unsubscribe: () => void }[] = [];

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getState() {
  return state;
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(emptyState()),
  );
}

// ============= Row mappers =============
function mapEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    customerId: row.customer_id ?? "",
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerPincode: row.customer_pincode ?? "",
    productId: row.product_id ?? undefined,
    serviceId: row.service_id ?? undefined,
    dealerId: row.dealer_id ?? undefined,
    message: row.message,
    createdAt: new Date(row.created_at).getTime(),
    status: row.status,
  };
}
function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: new Date(row.created_at).getTime(),
    read: row.read,
  };
}
function mapVendor(row: any): VendorProfile {
  return {
    id: row.id,
    dealerId: row.dealer_id ?? "",
    ownerName: row.owner_name,
    email: row.email ?? "",
    status: row.status,
  };
}
function mapProfile(row: any, favProducts: string[], favDealers: string[]): CustomerProfile {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    city: row.city ?? "",
    pincode: row.pincode ?? "",
    vehicle: row.vehicle ?? "",
    favouriteProductIds: favProducts,
    favouriteDealerIds: favDealers,
  };
}
function mapVendorProduct(row: any): VendorProduct {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    category: row.category,
    brand: row.brand ?? "",
    size: row.size ?? "",
    price: Number(row.price ?? 0),
    image: row.image,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}
function mapVendorService(row: any): VendorServiceRow {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    description: row.description ?? "",
    priceFromText: row.price_from_text ?? "",
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}
function mapBanner(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    active: row.active,
  };
}
function mapCms(row: any): CmsPage {
  return { id: row.id, label: row.label, body: row.body ?? "" };
}

// ============= Load / init =============
async function loadAll(userId: string | null, role: State["currentRole"]) {
  const [
    vendorsRes,
    enquiriesRes,
    notificationsRes,
    bannersRes,
    cmsRes,
    vpRes,
    vsRes,
    profileRes,
    favProdRes,
    favDealRes,
  ] = await Promise.all([
    supabase.from("vendors").select("*"),
    userId ? supabase.from("enquiries").select("*").order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null } as any),
    userId ? supabase.from("notifications").select("*").order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null } as any),
    supabase.from("banners").select("*").order("sort_order"),
    supabase.from("cms_pages").select("*"),
    supabase.from("vendor_products").select("*").order("created_at", { ascending: false }),
    supabase.from("vendor_services").select("*").order("created_at", { ascending: false }),
    userId ? supabase.from("profiles").select("*").eq("id", userId).maybeSingle() : Promise.resolve({ data: null, error: null } as any),
    userId ? supabase.from("favourite_products").select("product_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null } as any),
    userId ? supabase.from("favourite_dealers").select("dealer_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null } as any),
  ]);

  const favProducts = (favProdRes.data ?? []).map((r: any) => r.product_id);
  const favDealers = (favDealRes.data ?? []).map((r: any) => r.dealer_id);

  const customers: CustomerProfile[] = profileRes.data
    ? [mapProfile(profileRes.data, favProducts, favDealers)]
    : [];

  const admins: AdminProfile[] = role === "admin" && profileRes.data
    ? [{ id: profileRes.data.id, name: profileRes.data.name || "Admin", email: profileRes.data.email ?? "" }]
    : [];

  set({
    ready: true,
    currentUserId: userId,
    currentRole: role,
    vendors: (vendorsRes.data ?? []).map(mapVendor),
    enquiries: (enquiriesRes.data ?? []).map(mapEnquiry),
    notifications: (notificationsRes.data ?? []).map(mapNotification),
    banners: (bannersRes.data ?? []).map(mapBanner),
    cms: (cmsRes.data ?? []).map(mapCms),
    vendorProducts: (vpRes.data ?? []).map(mapVendorProduct),
    vendorServices: (vsRes.data ?? []).map(mapVendorService),
    customers,
    admins,
  });
}

function teardownRealtime() {
  realtimeChannels.forEach((c) => c.unsubscribe());
  realtimeChannels = [];
}

function setupRealtime(userId: string | null) {
  teardownRealtime();
  const reload = () => {
    if (state.currentUserId !== userId) return;
    loadAll(userId, state.currentRole).catch(() => {});
  };
  const tables = [
    "enquiries",
    "notifications",
    "vendors",
    "vendor_products",
    "vendor_services",
    "banners",
    "cms_pages",
    "favourite_products",
    "favourite_dealers",
  ];
  tables.forEach((t) => {
    const ch = supabase
      .channel(`rt-${t}`)
      .on("postgres_changes", { event: "*", schema: "public", table: t }, reload)
      .subscribe();
    realtimeChannels.push({ unsubscribe: () => supabase.removeChannel(ch) });
  });
}

export async function initStore(userId: string | null, role: State["currentRole"]) {
  await loadAll(userId, role);
  setupRealtime(userId);
}

export function clearStore() {
  teardownRealtime();
  state = emptyState();
  listeners.forEach((l) => l());
}

// ============= Mutations =============
export async function createEnquiry(input: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerPincode: string;
  productId?: string;
  serviceId?: string;
  dealerId?: string;
  message: string;
}) {
  const insert = {
    customer_id: input.customerId && input.customerId !== "guest" ? input.customerId : null,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_pincode: input.customerPincode,
    product_id: input.productId ?? null,
    service_id: input.serviceId ?? null,
    dealer_id: input.dealerId ?? null,
    message: input.message,
  };
  const { data, error } = await supabase.from("enquiries").insert(insert).select().single();
  if (error) throw error;

  // Fire-and-forget: email notification via Edge Function.
  // The SQL trigger (notify_enquiry_webhook) handles this server-side when pg_net is
  // configured.  This client-side invoke is a reliable fallback for environments where
  // pg_net is not yet set up.  If both are active, disable one to avoid duplicate emails.
  supabase.functions
    .invoke("notify-enquiry", { body: { type: "INSERT", record: data } })
    .catch(() => { /* non-fatal — enquiry was already saved */ });

  return mapEnquiry(data);
}

export async function updateEnquiryStatus(id: string, status: Enquiry["status"]) {
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function toggleFavouriteProduct(customerId: string, productId: string) {
  const has = state.customers.find((c) => c.id === customerId)?.favouriteProductIds.includes(productId);
  if (has) {
    await supabase.from("favourite_products").delete().eq("user_id", customerId).eq("product_id", productId);
  } else {
    await supabase.from("favourite_products").insert({ user_id: customerId, product_id: productId });
  }
  // optimistic — realtime will refresh
  set({
    customers: state.customers.map((c) =>
      c.id === customerId
        ? {
            ...c,
            favouriteProductIds: has
              ? c.favouriteProductIds.filter((p) => p !== productId)
              : [...c.favouriteProductIds, productId],
          }
        : c,
    ),
  });
}

export async function toggleFavouriteDealer(customerId: string, dealerId: string) {
  const has = state.customers.find((c) => c.id === customerId)?.favouriteDealerIds.includes(dealerId);
  if (has) {
    await supabase.from("favourite_dealers").delete().eq("user_id", customerId).eq("dealer_id", dealerId);
  } else {
    await supabase.from("favourite_dealers").insert({ user_id: customerId, dealer_id: dealerId });
  }
  set({
    customers: state.customers.map((c) =>
      c.id === customerId
        ? {
            ...c,
            favouriteDealerIds: has
              ? c.favouriteDealerIds.filter((d) => d !== dealerId)
              : [...c.favouriteDealerIds, dealerId],
          }
        : c,
    ),
  });
}

export async function updateCustomerProfile(id: string, patch: Partial<CustomerProfile>) {
  const dbPatch: Record<string, any> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.city !== undefined) dbPatch.city = patch.city;
  if (patch.pincode !== undefined) dbPatch.pincode = patch.pincode;
  if (patch.vehicle !== undefined) dbPatch.vehicle = patch.vehicle;
  const { error } = await supabase.from("profiles").update(dbPatch as never).eq("id", id);
  if (error) throw error;
  set({
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  });
}

export async function updateVendorStatus(id: string, status: VendorProfile["status"]) {
  const { error } = await supabase.from("vendors").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateVendorProfile(id: string, patch: Partial<VendorProfile> & { dealerId?: string; city?: string; pincode?: string }) {
  const dbPatch: Record<string, any> = {};
  if (patch.ownerName !== undefined) dbPatch.owner_name = patch.ownerName;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.dealerId !== undefined) dbPatch.dealer_id = patch.dealerId;
  if ((patch as any).city !== undefined) dbPatch.city = (patch as any).city;
  if ((patch as any).pincode !== undefined) dbPatch.pincode = (patch as any).pincode;
  const { error } = await supabase.from("vendors").update(dbPatch as never).eq("id", id);
  if (error) throw error;
}

export async function registerVendor(input: {
  dealerId: string;
  ownerName: string;
  email: string;
}) {
  if (!state.currentUserId) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("vendors")
    .upsert({
      id: state.currentUserId,
      dealer_id: input.dealerId,
      owner_name: input.ownerName,
      email: input.email,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  // ensure vendor role
  await supabase.from("user_roles").insert({ user_id: state.currentUserId, role: "vendor" });
  return mapVendor(data);
}

export async function toggleBanner(id: string) {
  const b = state.banners.find((x) => x.id === id);
  if (!b) return;
  const { error } = await supabase.from("banners").update({ active: !b.active }).eq("id", id);
  if (error) throw error;
}

export async function updateCms(id: string, body: string) {
  const { error } = await supabase.from("cms_pages").update({ body }).eq("id", id);
  if (error) throw error;
}

export async function createVendorProduct(input: {
  name: string;
  category: "tyre" | "alloy";
  brand: string;
  size: string;
  price: number;
}) {
  if (!state.currentUserId) throw new Error("Not signed in");
  const { error } = await supabase.from("vendor_products").insert({
    vendor_id: state.currentUserId,
    name: input.name,
    category: input.category,
    brand: input.brand,
    size: input.size,
    price: input.price,
  });
  if (error) throw error;
}

export async function updateVendorProduct(
  id: string,
  input: {
    name: string;
    category: "tyre" | "alloy";
    brand: string;
    size: string;
    price: number;
    image?: string | null;
  },
) {
  const { error } = await supabase
    .from("vendor_products")
    .update({
      name: input.name,
      category: input.category,
      brand: input.brand,
      size: input.size,
      price: input.price,
      image: input.image ?? null,
      status: "pending", // re-submit for approval on edit
    })
    .eq("id", id);
  if (error) throw error;
}

export async function uploadVendorImage(file: File): Promise<string> {
  if (!state.currentUserId) throw new Error("Not signed in");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${state.currentUserId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("vendor-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("vendor-images").getPublicUrl(path);
  