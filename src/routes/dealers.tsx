import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers } from "@/lib/queries";
import { DealerCard } from "@/components/dealer-card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "Verified Dealers Near You · My Tyres & Alloys" },
      { name: "description", content: "Discover verified tyre and alloy dealers in your city. Filter by location and connect via Call or WhatsApp." },
      { property: "og:title", content: "Verified Dealers · My Tyres & Alloys" },
      { property: "og:description", content: "2,500+ vetted dealers across 120 cities. Enquire in one tap." },
    ],
  }),
  component: DealersPage,
});

function DealersPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");

  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: fetchDealers,
    staleTime: 5 * 60 * 1000,
  });

  const cities = useMemo(() => Array.from(new Set(dealers.map((d) => d.city))).sort(), [dealers]);

  const filtered = dealers.filter((d) => {
    if (city !== "All" && d.city !== city) return false;
    if (query && !`${d.name} ${d.pincode} ${d.address}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

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

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, address or pincode"
          className="flex-1"
        />
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
