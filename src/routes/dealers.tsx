import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers } from "@/lib/queries";
import { DealerCard } from "@/components/dealer-card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "Verified Dealers Near You · AutoVerse" },
      { name: "description", content: "Discover verified tyre and alloy dealers in your city. Filter by location and connect via Call or WhatsApp." },
      { property: "og:title", content: "Verified Dealers · AutoVerse" },
      { property: "og:description", content: "2,500+ vetted dealers across 120 cities. Enquire in one tap." },
    ],
  }),
  component: DealersPage,
});

function DealersPage() {
  const [query, setQuery] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("All");
  const [sortByDistance, setSortByDistance] = useState(false);

  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: fetchDealers,
    staleTime: 5 * 60 * 1000,
  });

  const cities = useMemo(() => Array.from(new Set(dealers.map((d) => d.city))).sort(), [dealers]);

  const pincodeActive = pincode.trim().length >= 3;
  const effectiveDistanceSort = pincodeActive || sortByDistance;

  const filtered = useMemo(() => {
    const list = dealers.filter((d) => {
      if (city !== "All" && d.city !== city) return false;
      if (query && !`${d.name} ${d.pincode} ${d.address}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    if (pincodeActive) {
      const p = pincode.trim();
      const prefix = p.slice(0, 3);
      return list.slice().sort((a, b) => {
        const aNear = a.pincode === p ? 0 : a.pincode.startsWith(prefix) ? 1 : 2;
        const bNear = b.pincode === p ? 0 : b.pincode.startsWith(prefix) ? 1 : 2;
        if (aNear !== bNear) return aNear - bNear;
        return a.distanceKm - b.distanceKm;
      });
    }

    if (sortByDistance) {
      return list.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list.slice().sort((a, b) => b.rating - a.rating);
  }, [dealers, city, query, pincode, pincodeActive, sortByDistance]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Dealer directory</p>
        <h1 className="mt-2 font-display text-4xl font-bold italic uppercase tracking-tight md:text-5xl">
          Verified dealers near you
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every dealer is m