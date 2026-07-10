import type { MembershipTier } from "./types";

export const membershipTiers: MembershipTier[] = [
  {
    id: "free",
    name: "Free",
    priceText: "₹0",
    tagline: "Get discovered.",
    productLimit: "Up to 10 products",
    visibility: "Standard visibility",
    leads: "Receive enquiries only",
    featured: false,
    color: "steel",
    perks: [
      "Verified dealer badge",
      "Basic dealer profile",
      "Map placement",
      "Customer enquiries via form",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    priceText: "₹999/mo",
    tagline: "Priority in your city.",
    productLimit: "Up to 50 products",
    visibility: "Above-average placement",
    leads: "Priority support",
    featured: false,
    color: "steel",
    perks: [
      "Everything in Free",
      "Priority list ordering",
      "Service listings",
      "Enquiry email + SMS alerts",
      "Working-hours display",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    priceText: "₹2,499/mo",
    tagline: "Most popular for growing dealers.",
    productLimit: "Unlimited products",
    visibility: "Featured placement",
    leads: "Premium analytics",
    featured: true,
    color: "brand",
    perks: [
      "Everything in Silver",
      "Featured on category pages",
      "Custom storefront banner",
      "Product performance analytics",
      "WhatsApp CTA on every listing",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    priceText: "₹4,999/mo",
    tagline: "Top of every search.",
    productLimit: "Unlimited products",
    visibility: "Top of homepage & search",
    leads: "Premium leads + dedicated support",
    featured: false,
    color: "ink",
    perks: [
      "Everything in Gold",
      "Top of homepage carousel",
      "Priority search ranking",
      "Dedicated account manager",
      "Monthly performance review",
      "Exclusive promotional slots",
    ],
  },
];

export function tierById(id: MembershipTier["id"]) {
  return membershipTiers.find((t) => t.id === id)!;
}
