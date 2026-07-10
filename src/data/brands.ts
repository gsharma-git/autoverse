import type { Brand } from "./types";

export const brands: Brand[] = [
  { id: "michelin", name: "Michelin", category: "tyre" },
  { id: "bridgestone", name: "Bridgestone", category: "tyre" },
  { id: "pirelli", name: "Pirelli", category: "tyre" },
  { id: "continental", name: "Continental", category: "tyre" },
  { id: "yokohama", name: "Yokohama", category: "tyre" },
  { id: "apollo", name: "Apollo", category: "tyre" },
  { id: "mrf", name: "MRF", category: "tyre" },
  { id: "ceat", name: "CEAT", category: "tyre" },
  { id: "jk", name: "JK Tyre", category: "tyre" },
  { id: "goodyear", name: "Goodyear", category: "tyre" },
  { id: "neo", name: "Neo Wheels", category: "alloy" },
  { id: "momo", name: "Momo", category: "alloy" },
  { id: "enkei", name: "Enkei", category: "alloy" },
  { id: "lenso", name: "Lenso", category: "alloy" },
  { id: "hre", name: "HRE Performance", category: "alloy" },
];

export function brandById(id: string) {
  return brands.find((b) => b.id === id);
}
