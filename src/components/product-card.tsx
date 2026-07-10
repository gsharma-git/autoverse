import { Link } from "@tanstack/react-router";
import { Star, MapPin, Heart } from "lucide-react";
import type { Product } from "@/data/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { toggleFavouriteProduct, useStore } from "@/data/store";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const brand = { name: product.brandName ?? product.brandId };
  const { session } = useAuth();
  const customers = useStore((s) => s.customers);
  const me = session?.role === "customer" ? customers.find((c) => c.id === session.userId) : null;
  const isFav = me?.favouriteProductIds.includes(product.id) ?? false;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-[var(--shadow-elevated)]">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-steel"
      >
        <div className="absolute inset-0 grid place-items-center">
          <ProductGlyph category={product.category} colour={product.colour} />
        </div>
        {product.trending && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
            Trending
          </span>
        )}
        {product.featured && !product.trending && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
            Best seller
          </span>
        )}
        {me && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavouriteProduct(me.id, product.id);
            }}
            className={cn(
              "absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/90 backdrop-blur transition-colors",
              isFav ? "text-brand" : "text-foreground/60 hover:text-brand",
            )}
            aria-label="Toggle favourite"
          >
            <Heart className={cn("size-4", isFav && "fill-current")} />
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
            {brand?.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-foreground">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {product.size}
          </span>
          {product.colour && (
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {product.colour}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.category === "alloy" ? "Set of 4 from" : "From"}
            </p>
            <p className="font-display text-lg font-bold">{formatINR(product.price)}</p>
          </div>
          <div className="flex items-center gap-1 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3" />
            {product.availableDealerIds.length} nearby
          </div>
        </div>
        <Button asChild size="sm" className="mt-4 w-full rounded-full bg-primary text-primary-foreground group-hover:bg-brand group-hover:text-brand-foreground">
          <Link to="/product/$id" params={{ id: product.id }}>
            Find local dealers
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ProductGlyph({ category, colour }: { category: "tyre" | "alloy"; colour?: string }) {
  if (category === "tyre") {
    return (
      <svg viewBox="0 0 200 200" className="size-4/5 text-ink">
        <circle cx="100" cy="100" r="90" fill="currentColor" />
        <circle cx="100" cy="100" r="42" fill="var(--steel)" />
        <circle cx="100" cy="100" r="12" fill="currentColor" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x1 = 100 + Math.cos(a) * 55;
          const y1 = 100 + Math.sin(a) * 55;
          const x2 = 100 + Math.cos(a) * 85;
          const y2 = 100 + Math.sin(a) * 85;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--steel)" strokeWidth="5" />;
        })}
      </svg>
    );
  }
  const fill = colour?.toLowerCase().includes("black")
    ? "oklch(0.25 0.02 264)"
    : colour?.toLowerCase().includes("grey") || colour?.toLowerCase().includes("gunmetal") || colour?.toLowerCase().includes("anthracite")
      ? "oklch(0.45 0.01 264)"
      : "oklch(0.75 0.01 264)";
  return (
    <svg viewBox="0 0 200 200" className="size-4/5">
      <circle cx="100" cy="100" r="92" fill="oklch(0.12 0.02 264)" />
      <circle cx="100" cy="100" r="80" fill={fill} />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 55;
        const y = 100 + Math.sin(a) * 55;
        return (
          <g key={i} transform={`rotate(${(i / 5) * 360} 100 100)`}>
            <rect x="94" y="18" width="12" height="55" rx="4" fill="oklch(0.12 0.02 264)" />
          </g>
        );
      })}
      <circle cx="100" cy="100" r="20" fill="oklch(0.12 0.02 264)" />
      <circle cx="100" cy="100" r="7" fill={fill} />
    </svg>
  );
}
