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
          Every dealer is manually vetted before going live. Reach them via WhatsApp, call, or a quick
          enquiry.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, address or pincode"
            className="flex-1"
          />
          <Input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Your pincode (e.g. 400013)"
            inputMode="numeric"
            className="md:w-56"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...cities].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                city === c ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setSortByDistance((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              effectiveDistanceSort
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border hover:bg-secondary"
            }`}
            title={pincodeActive ? "Distance sort active from pincode" : "Sort by distance"}
          >
            Sort by distance
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-secondary" />
            ))
          : filtered.map((d) => <DealerCard key={d.id} dealer={d} />)}
      </div>
    </div>
  );
}
