import type { Service } from "./types";

export const services: Service[] = [
  {
    id: "wheel-alignment",
    slug: "wheel-alignment",
    name: "Wheel Alignment",
    description:
      "Precision 4-wheel alignment using laser-guided rigs. Extends tyre life and corrects steering pull for a straight, planted drive.",
    applicableVehicles: ["Hatchback", "Sedan", "SUV", "Luxury"],
    icon: "target",
    priceFromText: "From ₹499",
  },
  {
    id: "wheel-balancing",
    slug: "wheel-balancing",
    name: "Wheel Balancing",
    description:
      "Dynamic on-car balancing eliminates vibration at highway speeds. Recommended every 5,000 km or after new tyre fitment.",
    applicableVehicles: ["All"],
    icon: "circle-dot",
    priceFromText: "From ₹299",
  },
  {
    id: "puncture-repair",
    slug: "puncture-repair",
    name: "Tyre Puncture Repair",
    description:
      "Mushroom-plug patch repair from inside the tyre — safer and longer-lasting than surface plugs. Done in under 20 minutes.",
    applicableVehicles: ["All"],
    icon: "wrench",
    priceFromText: "From ₹149",
  },
  {
    id: "pressure-check",
    slug: "pressure-check",
    name: "Tyre Pressure Check",
    description:
      "Free digital pressure check and top-up across all 4 tyres and the spare. Critical for fuel efficiency and safety.",
    applicableVehicles: ["All"],
    icon: "gauge",
    priceFromText: "Free with any service",
  },
  {
    id: "nitrogen-filling",
    slug: "nitrogen-filling",
    name: "Nitrogen Air Filling",
    description:
      "Nitrogen retains pressure longer and runs cooler than regular air. Ideal for highway drivers and performance tyres.",
    applicableVehicles: ["All"],
    icon: "wind",
    priceFromText: "From ₹99",
  },
  {
    id: "tyre-rotation",
    slug: "tyre-rotation",
    name: "Tyre Rotation",
    description:
      "Rotate front-to-rear following manufacturer pattern to equalise wear. Recommended every 8,000–10,000 km.",
    applicableVehicles: ["All"],
    icon: "refresh-cw",
    priceFromText: "From ₹399",
  },
  {
    id: "tyre-installation",
    slug: "tyre-installation",
    name: "Tyre Installation",
    description:
      "Full mount, balance and valve replacement on your new tyres with disposal of the old set included.",
    applicableVehicles: ["All"],
    icon: "package-plus",
    priceFromText: "From ₹250/tyre",
  },
  {
    id: "alloy-installation",
    slug: "alloy-installation",
    name: "Alloy Wheel Installation",
    description:
      "Precise torque-spec mounting for new alloy sets, hub-centric fitment check and balance included.",
    applicableVehicles: ["All"],
    icon: "settings",
    priceFromText: "From ₹500/wheel",
  },
  {
    id: "wheel-cleaning",
    slug: "wheel-cleaning",
    name: "Wheel Cleaning",
    description:
      "Detailer-grade cleaning that lifts brake dust and road grime from every spoke without damaging the finish.",
    applicableVehicles: ["All"],
    icon: "sparkles",
    priceFromText: "From ₹399",
  },
  {
    id: "tyre-replacement",
    slug: "tyre-replacement",
    name: "Tyre Replacement",
    description:
      "End-to-end tyre swap consultation, old-tyre buyback assessment and installation of your chosen new set.",
    applicableVehicles: ["All"],
    icon: "arrow-left-right",
    priceFromText: "Quoted per tyre",
  },
];

export function serviceById(id: string) {
  return services.find((s) => s.id === id);
}

export function serviceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
