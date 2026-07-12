import type { Service } from "./types";

// Static fallback list — the DB is the source of truth.
// This is used only if the Supabase fetch fails or during local dev without a DB.
export const services: Service[] = [
  {
    id: "new-alloys",
    slug: "new-alloys",
    name: "New Alloys & Tyres",
    description:
      "Browse and enquire on the widest range of new alloy wheels and tyres — car, bike, and tractor fitments available.",
    applicableVehicles: ["All"],
    icon: "circle",
    priceFromText: "Quoted per fitment",
  },
  {
    id: "alloyment-balancing",
    slug: "alloyment-balancing",
    name: "Alloyment & Balancing",
    description:
      "Precise hub-centric alloy fitment plus dynamic on-car balancing. Eliminates vibration and protects your new rims.",
    applicableVehicles: ["All"],
    icon: "settings",
    priceFromText: "From ₹500/wheel",
  },
  {
    id: "tyre-service",
    slug: "tyre-service",
    name: "Tyre Service",
    description:
      "Full-service tyre care: rotation, pressure check, puncture repair, replacement and nitrogen filling in one stop.",
    applicableVehicles: ["All"],
    icon: "wrench",
    priceFromText: "From ₹149",
  },
  {
    id: "car-washing",
    slug: "car-washing",
    name: "Car Washing",
    description:
      "Exterior wash, interior vacuum, tyre dressing and glass cleaning. Choose from basic, premium or foam wash packages.",
    applicableVehicles: ["Hatchback", "Sedan", "SUV", "MUV", "Luxury"],
    icon: "droplets",
    priceFromText: "From ₹299",
  },
  {
    id: "detailing-nitrogen",
    slug: "detailing-nitrogen",
    name: "Detailing & Nitrogen Filling",
    description:
      "Detailer-grade paint correction, ceramic coat prep, and nitrogen tyre inflation for longer pressure retention.",
    applicableVehicles: ["All"],
    icon: "sparkles",
    priceFromText: "From ₹99",
  },
  {
    id: "car-battery",
    slug: "car-battery",
    name: "Car Battery",
    description:
      "Free battery health check plus same-day replacement with top brands. Old battery buyback available.",
    applicableVehicles: ["Hatchback", "Sedan", "SUV", "MUV", "Luxury", "Commercial Vehicle"],
    icon: "battery-charging",
    priceFromText: "From ₹1,999",
  },
  {
    id: "car-accessories",
    slug: "car-accessories",
    name: "Car & Bike Accessories",
    description:
      "Seat covers, floor mats, dashcams, alloy locks, bike accessories and more — fitted at the dealer.",
    applicableVehicles: ["All"],
    icon: "package",
    priceFromText: "Quoted per item",
  },
  {
    id: "spare-parts",
    slug: "spare-parts",
    name: "Spare Parts",
    description:
      "Genuine and OEM-compatible spare parts sourced and fitted by verified dealers. Quick turnaround on common models.",
    applicableVehicles: ["All"],
    icon: "cog",
    priceFromText: "Quoted per part",
  },
  {
    id: "ev-vehicles",
    slug: "ev-vehicles",
    name: "E-Rickshaw & E-Scooty",
    description:
      "EV two-wheeler and three-wheeler sales, tyre fitment and battery servicing at AutoVerse partner dealers.",
    applicableVehicles: ["E-Rickshaw", "E-Scooty"],
    icon: "zap",
    priceFromText: "Quoted on enquiry",
  },
  {
    id: "used-tyres-alloys",
    slug: "used-tyres-alloys",
    name: "Used Tyres & Alloys",
    description:
      "Quality-checked second-hand tyres and alloy wheels. Significant savings for budget-conscious buyers.",
    applicableVehicles: ["All"],
    icon: "refresh-cw",
    priceFromText: "From ₹499",
  },
  {
    id: "insurance",
    slug: "insurance",
    name: "Vehicle Insurance",
    description:
      "Compare and buy motor insurance via AutoVerse partner dealers. Comprehensive, third-party, and add-on covers.",
    applicableVehicles: ["All"],
    icon: "shield-check",
    priceFromText: "Quoted on enquiry",
  },
  {
    id: "ev-charging",
    slug: "ev-charging",
    name: "EV Charging Point Locator",
    description:
      "Find verified EV charging stations near you through the AutoVerse dealer network.",
    applicableVehicles: ["Electric Vehicles"],
    icon: "plug-zap",
    priceFromText: "Free to locate",
  },
  {
    id: "tractor-tyre",
    slug: "tractor-tyre",
    name: "Tractor & EV Tyres",
    description:
      "Specialist fitment for tractor tyres, agricultural tyres, and EV-specific tyre variants from verified dealers.",
    applicableVehicles: ["Tractor", "Electric Vehicles"],
    icon: "tractor",
    priceFromText: "Quoted per fitment",
  },
  {
    id: "bajaj-card",
    slug: "bajaj-card",
    name: "Bajaj Finserv EMI Card",
    description:
      "Buy tyres and alloys on easy EMI through the Bajaj Finserv card, accepted at AutoVerse partner dealers.",
    applicableVehicles: ["All"],
    icon: "credit-card",
    priceFromText: "0% EMI available",
  },
  {
    id: "highway-hotels",
    slug: "highway-hotels",
    name: "Highway Hotels",
    description:
      "Rest stops and highway hospitality partners near AutoVerse dealers. Useful for long-haul drivers.",
    applicableVehicles: ["All"],
    icon: "building-2",
    priceFromText: "Quoted on enquiry",
  },
];

export function serviceById(id: string) {
  return services.find((s) => s.id === id);
}

export function serviceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
