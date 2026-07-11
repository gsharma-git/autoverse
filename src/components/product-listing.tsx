import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchBrands } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Props {
  category: "tyre" | "alloy";
  initialPincode?: string;
  initialVehicle?: string;
  initialSize?: string;
}

export function ProductListing({ category, initialPincode, initialVehicle, initialSize }: Props) {
  const [pincode, setPincode] = useState(initialPincode ?? "");
  const [size, setSize] = useState(initialSize ?? "");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating" | "distance">("relevance");

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProducts(category),
    staleTime: 5 * 60 * 1000,
  });

  const { data: catBrands = [] } = useQuery({ queryKey: ["brands", category], queryFn: () => fetchBrands(category), staleTime: 10 * 60 * 1000 });

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (brandFilter !== "all" && p.brandId !== brandFilter) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (p.rating < minRating) return false;
      if (size && !p.size.toLowerCase().includes(size.toLowerCase())) return false;
      if (initialVehicle) {
        const v = initialVehicle.toLowerCase();
        if (!p.compatibleVehicles.some((c) => c.toLowerCase().includes(v.split(" ")[0]) || c.toLowerCase().includes(v))) {
          // fall through, don't hard filter
        }
      }
      return true;
    });
    if (sort === "price-asc") list = list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list = list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [allProducts, brandFilter, priceRange, minRating, size, sort, initialVehicle]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          {category === "tyre" ? "Tyre marketplace" : "Alloy gallery"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold italic uppercase tracking-tight md:text-5xl">
          {category === "tyre" ? "Find your perfect tyre" : "Turn heads with the right alloys"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {filtered.length} verified listings across our dealer network
          {pincode ? ` near ${pincode}` : ""}.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Location
            </h3>
            <Input
              className="mt-3"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter pincode"
            />
          </div>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Brand
            </h3>
            <div className="mt-3 space-y-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={brandFilter === "all"}
                  onChange={() => setBrandFilter("all")}
                  className="accent-brand"
                />
                All brands
              </label>
              {catBrands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={brandFilter === b.id}
                    onChange={() => setBrandFilter(b.id)}
                    className="accent-brand"
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {category === "tyre" ? "Tyre size" : "Wheel size"}
            </h3>
            <Input
              className="mt-3"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder={category === "tyre" ? "e.g. 205/55 R16" : "e.g. 17"}
            />
          </div>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Price range
            </h3>
            <p className="mt-3 text-sm text-foreground">
              ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
            </p>
            <Slider
              className="mt-3"
              min={0}
              max={200000}
              step={1000}
              value={priceRange}
              onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
            />
          </div>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Min rating
            </h3>
            <div className="mt-3 flex gap-2">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    minRating === r ? "border-brand bg-brand text-brand-foreground" : "border-border"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}+★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border p-16 text-center">
              <p className="font-d