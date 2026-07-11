import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Phone, Star, ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchDealersForProduct, fetchRelatedProducts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { EnquiryDialog } from "@/components/enquiry-dialog";
import { ProductCard } from "@/components/product-card";
import { WhatsAppIcon, DealerCard } from "@/components/dealer-card";
import type { Product } from "@/data/types";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const [product, dealers] = await Promise.all([
      fetchProductById(params.id),
      fetchDealersForProduct(params.id),
    ]);
    if (!product) throw notFound();
    return { product, dealers };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} · My Tyres & Alloys` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: `${loaderData.product.name} · My Tyres & Alloys` },
          { property: "og:description", content: loaderData.product.tagline },
        ]
      : [{ title: "Product · My Tyres & Alloys" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold italic uppercase">Product not found</h1>
      <Button asChild variant="ghost" className="mt-6">
        <Link to="/tyres"><ArrowLeft className="size-4" /> Back to catalog</Link>
      </Button>
    </div>
  ),
});

function ProductPage() {
  const { product, dealers } = Route.useLoaderData() as Awaited<ReturnType<typeof Route.options.loader>>;
  const brand = product.brandName ? { name: product.brandName } : { name: product.brandId };
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={product.category === "tyre" ? "/tyres" : "/alloys"} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand">
        <ArrowLeft className="size-3" /> Back to {product.category === "tyre" ? "tyres" : "alloys"}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-steel">
            <ProductVisual product={product} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-steel/70" />
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{brand?.name}</span>
          <h1 className="mt-2 font-display text-4xl font-bold italic uppercase leading-tight tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
              <Star className="size-4 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
              <span className="ml-1 text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="size-4 text-brand" /> Verified stock at {dealers.length} dealers
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {product.category === "alloy" ? "Set of 4 starting from" : "Starting from"}
            </p>
            <p className="mt-1 font-display text-4xl font-bold">{formatINR(product.price)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Final price confirmed by dealer. Enquire for exact fitment quote.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Button onClick={() => setEnquiryOpen(true)} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                Send enquiry
              </Button>
              {dealers[0] && (
                <>
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={`tel:${dealers[0].phone.replace(/\s/g, "")}`}>
                      <Phone className="size-4" /> Call top dealer
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-[var(--color-whatsapp)]/30 bg-[var(--color-whatsapp)]/10 text-[color-mix(in_oklab,var(--color-whatsapp)_75%,black)] hover:bg-[var(--color-whatsapp)]/20"
                  >
                    <a href={`https://wa.me/${dealers[0].whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="size-4" /> WhatsApp
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Specifications
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-secondary/60 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Compatible vehicles
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.compatibleVehicles.map((v) => (
                <span key={v} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
          Verified dealers with this in stock
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {dealers.map((d) => (
            <DealerCard key={d.id} dealer={d} />
          ))}
        </div>
      </section>

      <RelatedProducts product={product} />

      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} product={product} />
    </div>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  const { data: related = [], isLoading } = useQuery({
    queryKey: ["related-products", product.id],
    queryFn: () => fetchRelatedProducts(product.id, product.category, product.brandId),
  });

  if (!isLoading && related.length === 0) return null;

  return (
    <section className="mt-16 pb-16">
      <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
        You may also like
      </h2>
      <div className="mt-6 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-80 w-64 shrink-0 animate-pulse snap-start rounded-2xl border border-border bg-secondary/40 md:w-auto"
              />
            ))
          : related.map((p) => (
              <div key={p.id} className="w-64 shrink-0 snap-start md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}

function ProductVisual({ product }: { product: Product }) {
  const isAlloy = product.category === "alloy";
  return (
    <div className="grid h-full place-items-center p-8">
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <defs>
          <radialGradient id="ring" cx="50%" cy="50%" r="50%">
            <s