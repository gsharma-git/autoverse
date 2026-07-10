import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, MapPin, MessageCircle, Handshake, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { HeroSearch } from "@/components/hero-search";
import { ProductCard } from "@/components/product-card";
import { DealerCard } from "@/components/dealer-card";
import { fetchProducts, fetchDealers, fetchServices, fetchBrands } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: alloys = [] } = useQuery({ queryKey: ["products", "alloy"], queryFn: () => fetchProducts("alloy"), staleTime: 5 * 60 * 1000 });
  const { data: tyres = [] } = useQuery({ queryKey: ["products", "tyre"], queryFn: () => fetchProducts("tyre"), staleTime: 5 * 60 * 1000 });
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const { data: allServices = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });
  const { data: tyreBrandsData = [] } = useQuery({ queryKey: ["brands", "tyre"], queryFn: () => fetchBrands("tyre"), staleTime: 60 * 60 * 1000 });

  const trendingAlloys = alloys.filter((p) => p.trending).slice(0, 4);
  const featuredTyres = tyres.filter((p) => p.featured || p.trending).slice(0, 3);
  const featuredDealers = allDealers.slice(0, 4);
  const homeServices = allServices.slice(0, 6);
  const tyreBrands = tyreBrandsData.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-steel pb-24 pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(oklch(0.21_0.03_264/0.08)_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="inline-block rounded-full border border-ink/10 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
              Verified · Enquiry-first · Local
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase italic leading-none tracking-tight text-foreground md:text-6xl">
              Grip the road.<br />
              Own the style.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              India&apos;s dedicated marketplace to discover, compare and connect with local tyre &amp; alloy
              experts. No middlemen, no online checkout — just the right dealer, near you.
            </p>
          </div>
          <HeroSearch />
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-b border-border bg-background py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 opacity-70 sm:px-6 lg:px-8">
          {tyreBrands.map((b) => (
            <span key={b.id} className="font-display text-lg font-bold uppercase tracking-widest text-foreground/70">
              {b.name}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold italic uppercase tracking-tight md:text-4xl">
            Search → Discover → Enquire → Fit
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Search, title: "Search", body: "Filter by vehicle, brand, size, city or pincode." },
            { icon: MapPin, title: "Discover nearby", body: "See verified dealers closest to your location." },
            { icon: MessageCircle, title: "Enquire directly", body: "Call, WhatsApp or drop a quick enquiry form." },
            { icon: Handshake, title: "Fit offline", body: "Complete the sale and fitment at the dealer." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border p-6">
              <div className="grid size-12 place-items-center rounded-full bg-secondary">
                <s.icon className="size-5 text-brand" />
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Step 0{i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending alloys */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold italic uppercase tracking-tight">
              Trending alloys
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest performance rims available near you
            </p>
          </div>
          <Link to="/alloys" className="hidden text-sm font-bold text-brand underline underline-offset-4 sm:inline">
            View full catalog
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingAlloys.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured tyres */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold italic uppercase tracking-tight">
              Top-rated tyres
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified dealer stock across Mumbai, Bengaluru, Delhi
            </p>
          </div>
          <Link to="/tyres" className="hidden text-sm font-bold text-brand underline underline-offset-4 sm:inline">
            Browse all tyres
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredTyres.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Dealer spotlight */}
      <section className="bg-ink py-20 text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <span className="inline-block rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
                Verified dealer network
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold italic uppercase tracking-tight md:text-4xl">
                Connect with experts in your neighbourhood.
              </h2>
            </div>
            <p className="text-sm text-background/70">
              We&apos;ve vetted 2,500+ dealers across India. Get instant quotes, check stock availability
              and book fitment via WhatsApp or a direct call — all without leaving the platform.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {featuredDealers.map((d) => (
              <div key={d.id} className="rounded-2xl bg-background text-foreground">
                <DealerCard dealer={d} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="secondary" className="rounded-full bg-background text-foreground hover:bg-background/90">
              <Link to="/dealers">
                View all verified dealers <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">In-shop services</p>
            <h2 className="mt-3 font-display text-3xl font-bold italic uppercase tracking-tight md:text-4xl">
              More than just tyres.
            </h2>
          </div>
          <Link to="/services" className="hidden text-sm font-bold text-brand underline underline-offset-4 sm:inline">
            All services
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeServices.map((s) => (
            <Link
              to="/service/$id"
              params={{ id: s.id }}
              key={s.id}
              className="group rounded-2xl border border-border p-6 transition-all hover:border-brand/40 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">{s.name}</h3>
                <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-brand">
                {s.priceFromText}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-10 text-brand-foreground md:p-14">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="size-3" />
              For dealers
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold italic uppercase tracking-tight md:text-4xl">
              Grow your dealership.
            </h2>
            <p className="mt-3 text-brand-foreground/90">
              List your inventory, capture qualified enquiries from your locality every week, and close
              more offline sales without a middleman commission.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-ink text-background hover:bg-ink/90">
                <Link to="/vendor/register">Register as dealer</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-brand-foreground/40 bg-transparent text-brand-foreground hover:bg-brand-foreground/10">
                <Link to="/membership">Compare plans</Link>
              </Button>
            </div>
          </div>
          <span className="pointer-events-none absolute -bottom-12 -right-4 select-none font-display text-[10rem] font-bold italic leading-none tracking-tighter text-brand-foreground/10 md:text-[14rem]">
            HUB
          </span>
        </div>
      </section>
    </div>
  );
}
