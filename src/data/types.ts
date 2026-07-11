export type Role = "customer" | "vendor" | "admin";

export interface Brand {
  id: string;
  name: string;
  category: "tyre" | "alloy";
}

export interface Product {
  id: string;
  slug: string;
  category: "tyre" | "alloy";
  name: string;
  brandId: string;
  brandName?: string; // enriched from DB join
  price: number; // starting price in INR
  size: string; // e.g. "205/55 R16" or "17 inch"
  wheelSize: number; // inches
  colour?: string;
  rating: number;
  reviewCount: number;
  compatibleVehicles: string[];
  images: string[];
  specs: Record<string, string>;
  tagline: string;
  availableDealerIds: string[];
  featured?: boolean;
  trending?: boolean;
}

export interface Dealer {
  id: string;
  slug: string;
  name: string;
  city: string;
  pincode: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  verified: true;
  membership: "free" | "silver" | "gold" | "diamond";
  phone: string;
  whatsapp: string;
  hoursText: string;
  services: string[]; // service ids
  productIds: string[];
  logoInitials: string;
  storefrontImage?: string;
  since: number;
  enquiryCount: number;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  applicableVehicles: string[];
  icon: string;
  priceFromText: string;
}

export interface MembershipTier {
  id: "free" | "silver" | "gold" | "diamond";
  name: string;
  priceText: string;
  tagline: string;
  productLimit: string;
  visibility: string;
  leads: string;
  featured: boolean;
  color: string;
  perks: string[];
}

export interface Review {
  id: string;
  dealerId: string;
  customerName: string;
  rating: number; // 1–5
  title: string;
  body: string;
  createdAt: number; // unix ms
  verified: boolean;
}

export interface Enquiry {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerPincode: string;
  productId?: string;
  serviceId?: string;
  dealerId?: string;
  message: string;
  createdAt: number;
  status: "new" | "contacted" | "closed";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
  vehicle: string;
  favouriteProductIds: string[];
  favouriteDealerIds: str