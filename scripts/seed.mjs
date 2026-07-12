/**
 * AutoVerse seed script
 * Seeds brands, products, dealers, dealer_services, and product_dealers
 * into the live Supabase project.
 *
 * Usage:
 *   node --env-file=.env scripts/seed.mjs
 *
 * Safe to re-run — all inserts use ON CONFLICT DO NOTHING.
 * Services are already seeded by migration 20260711144742.
 */

import { createClient } from "@supabase/supabase-js";

// ── Supabase client (uses service role key for unrestricted writes) ──────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Missing env vars.\n" +
    "    Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.\n" +
    "    Get the service role key from: Supabase dashboard → Settings → API"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── 1. Brands ────────────────────────────────────────────────────────────────

const brands = [
  { id: "michelin",    name: "Michelin",         category: "tyre"  },
  { id: "bridgestone", name: "Bridgestone",       category: "tyre"  },
  { id: "pirelli",     name: "Pirelli",           category: "tyre"  },
  { id: "continental", name: "Continental",       category: "tyre"  },
  { id: "yokohama",    name: "Yokohama",          category: "tyre"  },
  { id: "apollo",      name: "Apollo",            category: "tyre"  },
  { id: "mrf",         name: "MRF",               category: "tyre"  },
  { id: "ceat",        name: "CEAT",              category: "tyre"  },
  { id: "jk",          name: "JK Tyre",           category: "tyre"  },
  { id: "goodyear",    name: "Goodyear",          category: "tyre"  },
  { id: "neo",         name: "Neo Wheels",        category: "alloy" },
  { id: "momo",        name: "Momo",              category: "alloy" },
  { id: "enkei",       name: "Enkei",             category: "alloy" },
  { id: "lenso",       name: "Lenso",             category: "alloy" },
  { id: "hre",         name: "HRE Performance",   category: "alloy" },
];

// ── 2. Products ──────────────────────────────────────────────────────────────

const products = [
  // Tyres
  {
    id: "p-michelin-ps5",
    slug: "michelin-pilot-sport-5",
    category: "tyre",
    name: "Pilot Sport 5",
    brand_id: "michelin",
    price: 14250,
    size: "225/45 R17",
    wheel_size: 17,
    rating: 4.9,
    review_count: 210,
    compatible_vehicles: ["Honda City", "Hyundai Verna", "Skoda Slavia", "VW Virtus"],
    images: [],
    specs: { "Wet Grip": "A", "Fuel Efficiency": "B", "Noise": "71 dB", "Speed Rating": "W (270 km/h)", "Load Index": "94", "Tread Pattern": "Asymmetric" },
    tagline: "Max-performance summer tyre engineered for spirited driving.",
    featured: true,
    trending: true,
  },
  {
    id: "p-bridgestone-t005",
    slug: "bridgestone-turanza-t005",
    category: "tyre",
    name: "Turanza T005",
    brand_id: "bridgestone",
    price: 6800,
    size: "185/65 R15",
    wheel_size: 15,
    rating: 4.6,
    review_count: 340,
    compatible_vehicles: ["Maruti Swift", "Hyundai i20", "Tata Tiago", "Renault Kwid"],
    images: [],
    specs: { "Wet Grip": "A", "Fuel Efficiency": "B", "Noise": "70 dB", "Comfort": "Premium touring", "Tread Pattern": "Symmetric" },
    tagline: "Comfort-first touring tyre for quiet urban miles.",
    trending: true,
  },
  {
    id: "p-continental-mc7",
    slug: "continental-maxcontact-mc7",
    category: "tyre",
    name: "MaxContact MC7",
    brand_id: "continental",
    price: 9450,
    size: "215/55 R17",
    wheel_size: 17,
    rating: 4.7,
    review_count: 180,
    compatible_vehicles: ["Hyundai Creta", "Kia Seltos", "VW Taigun", "Skoda Kushaq"],
    images: [],
    specs: { "Wet Grip": "A", "Fuel Efficiency": "C", "Noise": "72 dB", "Dry Handling": "Excellent", "Tread Pattern": "Asymmetric" },
    tagline: "Ultra-high-performance summer for compact SUVs.",
  },
  {
    id: "p-pirelli-pzero",
    slug: "pirelli-p-zero",
    category: "tyre",
    name: "P Zero",
    brand_id: "pirelli",
    price: 18900,
    size: "245/40 R18",
    wheel_size: 18,
    rating: 4.8,
    review_count: 95,
    compatible_vehicles: ["BMW 3 Series", "Audi A4", "Mercedes C-Class"],
    images: [],
    specs: { "Wet Grip": "A", "Fuel Efficiency": "C", "Noise": "73 dB", "Speed Rating": "Y (300 km/h)", "Tread Pattern": "Asymmetric" },
    tagline: "Ultra-luxury performance from Milan.",
    featured: true,
  },
  {
    id: "p-yokohama-e400",
    slug: "yokohama-earth-1-e400",
    category: "tyre",
    name: "Earth-1 E400",
    brand_id: "yokohama",
    price: 5800,
    size: "185/65 R15",
    wheel_size: 15,
    rating: 4.5,
    review_count: 260,
    compatible_vehicles: ["Honda Amaze", "Maruti Dzire", "Hyundai Aura"],
    images: [],
    specs: { "Wet Grip": "B", "Fuel Efficiency": "A", "Noise": "69 dB", "Warranty": "5 Years" },
    tagline: "Fuel-efficient daily driver with all-weather grip.",
  },
  {
    id: "p-mrf-perfinza",
    slug: "mrf-perfinza-clm1",
    category: "tyre",
    name: "Perfinza CLM1",
    brand_id: "mrf",
    price: 7200,
    size: "205/55 R16",
    wheel_size: 16,
    rating: 4.6,
    review_count: 480,
    compatible_vehicles: ["Honda City", "Hyundai Verna", "Maruti Ciaz"],
    images: [],
    specs: { "Wet Grip": "B", "Fuel Efficiency": "B", "Noise": "70 dB", "Made In": "India" },
    tagline: "Premium Indian-engineered tyre for luxury sedans.",
    trending: true,
  },
  {
    id: "p-apollo-alnac",
    slug: "apollo-alnac-4g",
    category: "tyre",
    name: "Alnac 4G",
    brand_id: "apollo",
    price: 4800,
    size: "175/65 R14",
    wheel_size: 14,
    rating: 4.4,
    review_count: 320,
    compatible_vehicles: ["Maruti Alto K10", "Hyundai Santro", "Datsun Redi-GO"],
    images: [],
    specs: { "Wet Grip": "B", "Fuel Efficiency": "A", "Noise": "70 dB", "Warranty": "5 Years" },
    tagline: "Value-first daily commuter tyre.",
  },
  {
    id: "p-ceat-secura",
    slug: "ceat-secura-drive",
    category: "tyre",
    name: "SecuraDrive",
    brand_id: "ceat",
    price: 5400,
    size: "195/60 R15",
    wheel_size: 15,
    rating: 4.3,
    review_count: 210,
    compatible_vehicles: ["Maruti Baleno", "Hyundai i20", "Tata Altroz"],
    images: [],
    specs: { "Wet Grip": "B", "Fuel Efficiency": "B", "Noise": "71 dB" },
    tagline: "Confident wet-weather braking for city driving.",
  },
  {
    id: "p-jk-uxroyale",
    slug: "jk-ux-royale",
    category: "tyre",
    name: "UX Royale",
    brand_id: "jk",
    price: 6900,
    size: "205/65 R16",
    wheel_size: 16,
    rating: 4.4,
    review_count: 175,
    compatible_vehicles: ["Mahindra Scorpio", "Tata Sumo", "Renault Duster"],
    images: [],
    specs: { "Wet Grip": "C", "Fuel Efficiency": "B", "Noise": "72 dB" },
    tagline: "Comfort tuned for SUV highway cruising.",
  },
  {
    id: "p-goodyear-assurance",
    slug: "goodyear-assurance-triplemax-2",
    category: "tyre",
    name: "Assurance TripleMax 2",
    brand_id: "goodyear",
    price: 7600,
    size: "195/55 R16",
    wheel_size: 16,
    rating: 4.5,
    review_count: 240,
    compatible_vehicles: ["Maruti Baleno", "Hyundai i20", "VW Polo"],
    images: [],
    specs: { "Wet Grip": "A", "Fuel Efficiency": "B", "Noise": "70 dB" },
    tagline: "Wet-braking-first everyday premium tyre.",
  },
  // Alloys
  {
    id: "a-neo-stellar",
    slug: "neo-stellar-matte-grey",
    category: "alloy",
    name: "Stellar Matte Grey",
    brand_id: "neo",
    price: 32000,
    size: "15 inch",
    wheel_size: 15,
    colour: "Matte Grey",
    rating: 4.7,
    review_count: 128,
    compatible_vehicles: ["Maruti Swift", "Hyundai i20", "Tata Altroz", "VW Polo"],
    images: [],
    specs: { "Design": "5-spoke", "PCD": "4x100", "Offset": "ET35", "Weight/Wheel": "7.8 kg", "Finish": "Matte Grey" },
    tagline: "Timeless 5-spoke silhouette in a modern matte finish.",
    featured: true,
    trending: true,
  },
  {
    id: "a-momo-quantum",
    slug: "momo-quantum-anthracite",
    category: "alloy",
    name: "Quantum Anthracite",
    brand_id: "momo",
    price: 68000,
    size: "17 inch",
    wheel_size: 17,
    colour: "Anthracite",
    rating: 4.9,
    review_count: 85,
    compatible_vehicles: ["Honda City", "Skoda Slavia", "VW Virtus"],
    images: [],
    specs: { "Design": "Multi-spoke", "PCD": "5x114.3", "Offset": "ET40", "Weight/Wheel": "8.4 kg", "Finish": "Anthracite" },
    tagline: "Italian design, aggressive multi-spoke geometry.",
    featured: true,
  },
  {
    id: "a-enkei-rpf1",
    slug: "enkei-rpf1-silver",
    category: "alloy",
    name: "RPF1 Racing Silver",
    brand_id: "enkei",
    price: 54000,
    size: "16 inch",
    wheel_size: 16,
    colour: "Silver",
    rating: 4.8,
    review_count: 210,
    compatible_vehicles: ["Honda City", "Hyundai Verna", "Maruti Baleno"],
    images: [],
    specs: { "Design": "6-spoke", "PCD": "5x114.3", "Offset": "ET38", "Weight/Wheel": "6.5 kg", "Finish": "Bright Silver" },
    tagline: "Legendary lightweight racing wheel from Japan.",
    trending: true,
  },
  {
    id: "a-lenso-conquista",
    slug: "lenso-conquista-black",
    category: "alloy",
    name: "Conquista C5",
    brand_id: "lenso",
    price: 44000,
    size: "17 inch",
    wheel_size: 17,
    colour: "Gloss Black",
    rating: 4.6,
    review_count: 74,
    compatible_vehicles: ["Hyundai Creta", "Kia Seltos", "Skoda Kushaq"],
    images: [],
    specs: { "Design": "Twin 5-spoke", "PCD": "5x114.3", "Offset": "ET40", "Weight/Wheel": "8.9 kg", "Finish": "Gloss Black" },
    tagline: "Aggressive stance for compact SUVs.",
  },
  {
    id: "a-hre-p101",
    slug: "hre-p101-brushed",
    category: "alloy",
    name: "P101 Brushed Titanium",
    brand_id: "hre",
    price: 185000,
    size: "18 inch",
    wheel_size: 18,
    colour: "Brushed Titanium",
    rating: 5.0,
    review_count: 32,
    compatible_vehicles: ["BMW 3 Series", "Audi A4", "Mercedes C-Class", "Porsche Cayman"],
    images: [],
    specs: { "Design": "Monoblok forged", "PCD": "5x120", "Offset": "ET32", "Weight/Wheel": "9.2 kg", "Finish": "Brushed Titanium" },
    tagline: "Forged perfection for the discerning driver.",
    featured: true,
  },
];

// ── 3. Dealers ───────────────────────────────────────────────────────────────

const dealers = [
  {
    id: "d-supreme-mumbai",
    slug: "supreme-tyres-lower-parel",
    name: "Supreme Tyres & Alignment",
    city: "Mumbai",
    pincode: "400013",
    address: "Senapati Bapat Marg, Lower Parel West, Mumbai",
    distance_km: 1.2,
    rating: 4.9,
    review_count: 812,
    membership: "diamond",
    phone: "+91 98200 11223",
    whatsapp: "+91 98200 11223",
    hours_text: "Mon–Sat · 9:30am – 8:30pm",
    logo_initials: "ST",
    since: 2004,
    enquiry_count: 1240,
    // services & products handled via junction tables below
  },
  {
    id: "d-autohub-mumbai",
    slug: "autohub-performance-prabhadevi",
    name: "AutoHub Performance",
    city: "Mumbai",
    pincode: "400025",
    address: "Prabhadevi Station Road, Mumbai",
    distance_km: 3.5,
    rating: 4.7,
    review_count: 540,
    membership: "gold",
    phone: "+91 98211 44556",
    whatsapp: "+91 98211 44556",
    hours_text: "Mon–Sun · 10am – 9pm",
    logo_initials: "AH",
    since: 2011,
    enquiry_count: 840,
  },
  {
    id: "d-tyre-empire-blr",
    slug: "tyre-empire-hsr",
    name: "Tyre Empire",
    city: "Bengaluru",
    pincode: "560102",
    address: "27th Main, HSR Layout Sector 1, Bengaluru",
    distance_km: 2.1,
    rating: 4.8,
    review_count: 1120,
    membership: "diamond",
    phone: "+91 90080 22334",
    whatsapp: "+91 90080 22334",
    hours_text: "Mon–Sat · 9am – 9pm",
    logo_initials: "TE",
    since: 1998,
    enquiry_count: 2140,
  },
  {
    id: "d-speedline-mumbai",
    slug: "speedline-auto-lower-parel",
    name: "Speedline Auto Centre",
    city: "Mumbai",
    pincode: "400013",
    address: "Kamala Mills, Lower Parel, Mumbai",
    distance_km: 4.8,
    rating: 4.6,
    review_count: 320,
    membership: "gold",
    phone: "+91 97022 88991",
    whatsapp: "+91 97022 88991",
    hours_text: "Tue–Sun · 10am – 8pm",
    logo_initials: "SA",
    since: 2015,
    enquiry_count: 460,
  },
  {
    id: "d-wheel-world-delhi",
    slug: "wheel-world-karol-bagh",
    name: "Wheel World",
    city: "Delhi",
    pincode: "110005",
    address: "Karol Bagh, Central Delhi",
    distance_km: 6.0,
    rating: 4.5,
    review_count: 690,
    membership: "silver",
    phone: "+91 98115 66778",
    whatsapp: "+91 98115 66778",
    hours_text: "Mon–Sat · 10am – 8pm",
    logo_initials: "WW",
    since: 2007,
    enquiry_count: 720,
  },
  {
    id: "d-highway-delhi",
    slug: "highway-tyres-dwarka",
    name: "Highway Tyres & Alloys",
    city: "Delhi",
    pincode: "110075",
    address: "Sector 12, Dwarka, New Delhi",
    distance_km: 8.3,
    rating: 4.6,
    review_count: 410,
    membership: "silver",
    phone: "+91 99991 22110",
    whatsapp: "+91 99991 22110",
    hours_text: "Mon–Sun · 9am – 9pm",
    logo_initials: "HT",
    since: 2010,
    enquiry_count: 290,
  },
  {
    id: "d-chennai-grip",
    slug: "grip-motors-anna-nagar",
    name: "Grip Motors",
    city: "Chennai",
    pincode: "600040",
    address: "2nd Avenue, Anna Nagar, Chennai",
    distance_km: 3.2,
    rating: 4.7,
    review_count: 380,
    membership: "gold",
    phone: "+91 90030 44556",
    whatsapp: "+91 90030 44556",
    hours_text: "Mon–Sat · 9:30am – 9pm",
    logo_initials: "GM",
    since: 2012,
    enquiry_count: 520,
  },
  {
    id: "d-pune-torque",
    slug: "torque-tyres-koregaon-park",
    name: "Torque Tyres",
    city: "Pune",
    pincode: "411001",
    address: "North Main Road, Koregaon Park, Pune",
    distance_km: 2.5,
    rating: 4.8,
    review_count: 460,
    membership: "gold",
    phone: "+91 90111 55667",
    whatsapp: "+91 90111 55667",
    hours_text: "Mon–Sun · 10am – 9:30pm",
    logo_initials: "TT",
    since: 2013,
    enquiry_count: 615,
  },
];

// ── 4. Dealer → Service junctions ────────────────────────────────────────────

const dealerServices = [
  // d-supreme-mumbai
  { dealer_id: "d-supreme-mumbai", service_id: "tyre-service" },
  { dealer_id: "d-supreme-mumbai", service_id: "alloyment-balancing" },
  { dealer_id: "d-supreme-mumbai", service_id: "detailing-nitrogen" },
  { dealer_id: "d-supreme-mumbai", service_id: "new-alloys" },
  { dealer_id: "d-supreme-mumbai", service_id: "car-washing" },
  { dealer_id: "d-supreme-mumbai", service_id: "used-tyres-alloys" },
  // d-autohub-mumbai
  { dealer_id: "d-autohub-mumbai", service_id: "tyre-service" },
  { dealer_id: "d-autohub-mumbai", service_id: "alloyment-balancing" },
  { dealer_id: "d-autohub-mumbai", service_id: "new-alloys" },
  { dealer_id: "d-autohub-mumbai", service_id: "car-washing" },
  { dealer_id: "d-autohub-mumbai", service_id: "car-accessories" },
  // d-tyre-empire-blr
  { dealer_id: "d-tyre-empire-blr", service_id: "tyre-service" },
  { dealer_id: "d-tyre-empire-blr", service_id: "alloyment-balancing" },
  { dealer_id: "d-tyre-empire-blr", service_id: "detailing-nitrogen" },
  { dealer_id: "d-tyre-empire-blr", service_id: "new-alloys" },
  { dealer_id: "d-tyre-empire-blr", service_id: "used-tyres-alloys" },
  { dealer_id: "d-tyre-empire-blr", service_id: "car-battery" },
  { dealer_id: "d-tyre-empire-blr", service_id: "spare-parts" },
  // d-speedline-mumbai
  { dealer_id: "d-speedline-mumbai", service_id: "tyre-service" },
  { dealer_id: "d-speedline-mumbai", service_id: "alloyment-balancing" },
  { dealer_id: "d-speedline-mumbai", service_id: "new-alloys" },
  { dealer_id: "d-speedline-mumbai", service_id: "car-washing" },
  // d-wheel-world-delhi
  { dealer_id: "d-wheel-world-delhi", service_id: "tyre-service" },
  { dealer_id: "d-wheel-world-delhi", service_id: "alloyment-balancing" },
  { dealer_id: "d-wheel-world-delhi", service_id: "car-washing" },
  { dealer_id: "d-wheel-world-delhi", service_id: "used-tyres-alloys" },
  // d-highway-delhi
  { dealer_id: "d-highway-delhi", service_id: "tyre-service" },
  { dealer_id: "d-highway-delhi", service_id: "alloyment-balancing" },
  { dealer_id: "d-highway-delhi", service_id: "detailing-nitrogen" },
  { dealer_id: "d-highway-delhi", service_id: "new-alloys" },
  // d-chennai-grip
  { dealer_id: "d-chennai-grip", service_id: "tyre-service" },
  { dealer_id: "d-chennai-grip", service_id: "alloyment-balancing" },
  { dealer_id: "d-chennai-grip", service_id: "new-alloys" },
  { dealer_id: "d-chennai-grip", service_id: "car-washing" },
  // d-pune-torque
  { dealer_id: "d-pune-torque", service_id: "tyre-service" },
  { dealer_id: "d-pune-torque", service_id: "alloyment-balancing" },
  { dealer_id: "d-pune-torque", service_id: "detailing-nitrogen" },
  { dealer_id: "d-pune-torque", service_id: "new-alloys" },
  { dealer_id: "d-pune-torque", service_id: "car-washing" },
  { dealer_id: "d-pune-torque", service_id: "car-accessories" },
];

// ── 5. Product → Dealer junctions (from availableDealerIds in products.ts) ──

const productDealers = [
  // p-michelin-ps5
  { product_id: "p-michelin-ps5",       dealer_id: "d-supreme-mumbai"   },
  { product_id: "p-michelin-ps5",       dealer_id: "d-tyre-empire-blr"  },
  { product_id: "p-michelin-ps5",       dealer_id: "d-pune-torque"      },
  // p-bridgestone-t005
  { product_id: "p-bridgestone-t005",   dealer_id: "d-supreme-mumbai"   },
  { product_id: "p-bridgestone-t005",   dealer_id: "d-chennai-grip"     },
  // p-continental-mc7
  { product_id: "p-continental-mc7",    dealer_id: "d-supreme-mumbai"   },
  { product_id: "p-continental-mc7",    dealer_id: "d-speedline-mumbai" },
  // p-pirelli-pzero
  { product_id: "p-pirelli-pzero",      dealer_id: "d-autohub-mumbai"   },
  { product_id: "p-pirelli-pzero",      dealer_id: "d-pune-torque"      },
  // p-yokohama-e400
  { product_id: "p-yokohama-e400",      dealer_id: "d-autohub-mumbai"   },
  // p-mrf-perfinza
  { product_id: "p-mrf-perfinza",       dealer_id: "d-tyre-empire-blr"  },
  { product_id: "p-mrf-perfinza",       dealer_id: "d-wheel-world-delhi"},
  // p-apollo-alnac
  { product_id: "p-apollo-alnac",       dealer_id: "d-tyre-empire-blr"  },
  { product_id: "p-apollo-alnac",       dealer_id: "d-chennai-grip"     },
  // p-ceat-secura
  { product_id: "p-ceat-secura",        dealer_id: "d-wheel-world-delhi"},
  // p-jk-uxroyale
  { product_id: "p-jk-uxroyale",        dealer_id: "d-highway-delhi"    },
  // p-goodyear-assurance
  { product_id: "p-goodyear-assurance", dealer_id: "d-highway-delhi"    },
  // a-neo-stellar
  { product_id: "a-neo-stellar",        dealer_id: "d-supreme-mumbai"   },
  { product_id: "a-neo-stellar",        dealer_id: "d-tyre-empire-blr"  },
  { product_id: "a-neo-stellar",        dealer_id: "d-wheel-world-delhi"},
  // a-momo-quantum
  { product_id: "a-momo-quantum",       dealer_id: "d-supreme-mumbai"   },
  { product_id: "a-momo-quantum",       dealer_id: "d-autohub-mumbai"   },
  { product_id: "a-momo-quantum",       dealer_id: "d-pune-torque"      },
  // a-enkei-rpf1
  { product_id: "a-enkei-rpf1",         dealer_id: "d-autohub-mumbai"   },
  { product_id: "a-enkei-rpf1",         dealer_id: "d-speedline-mumbai" },
  { product_id: "a-enkei-rpf1",         dealer_id: "d-chennai-grip"     },
  // a-lenso-conquista
  { product_id: "a-lenso-conquista",    dealer_id: "d-tyre-empire-blr"  },
  { product_id: "a-lenso-conquista",    dealer_id: "d-highway-delhi"    },
  // a-hre-p101
  { product_id: "a-hre-p101",           dealer_id: "d-speedline-mumbai" },
  { product_id: "a-hre-p101",           dealer_id: "d-pune-torque"      },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function ok(label, count) {
  console.log(`  ✅  ${label}: ${count} rows upserted`);
}

function fail(label, error) {
  console.error(`  ❌  ${label} failed:`, error.message);
  process.exit(1);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  AutoVerse seed — starting\n");

  // Brands
  {
    const { error, count } = await supabase
      .from("brands")
      .upsert(brands, { onConflict: "id", count: "exact" });
    if (error) fail("brands", error);
    ok("brands", brands.length);
  }

  // Products
  {
    const rows = products.map((p) => ({ featured: false, trending: false, ...p }));
    const { error } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "id" });
    if (error) fail("products", error);
    ok("products", products.length);
  }

  // Dealers
  {
    const { error } = await supabase
      .from("dealers")
      .upsert(dealers, { onConflict: "id" });
    if (error) fail("dealers", error);
    ok("dealers", dealers.length);
  }

  // dealer_services
  {
    const { error } = await supabase
      .from("dealer_services")
      .upsert(dealerServices, { onConflict: "dealer_id,service_id" });
    if (error) fail("dealer_services", error);
    ok("dealer_services", dealerServices.length);
  }

  // product_dealers
  {
    const { error } = await supabase
      .from("product_dealers")
      .upsert(productDealers, { onConflict: "product_id,dealer_id" });
    if (error) fail("product_dealers", error);
    ok("product_dealers", productDealers.length);
  }

  console.log("\n✨  Seed complete. Run the sitemap script next:\n");
  console.log("    node --env-file=.env scripts/generate-sitemap.mjs\n");
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
