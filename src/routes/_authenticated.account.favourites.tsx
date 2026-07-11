import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/_authenticated/account/favourites")({
  component: FavProducts,
});

function FavProducts() {
  const { session } = useAuth();
  const me = useStore((s) => s.customers.find((c) => c.id === session?.userId));
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const favIds = new Set(me?.favouriteProductIds ?? []);
  const items = allProducts.filter((p) => favIds.has(p.id));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Favourite products</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Tap the heart on a product card to sav