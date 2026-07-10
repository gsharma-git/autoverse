import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Phone, Star, ShieldCheck, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { fetchDealerById, fetchProductsForDealer, fetchServicesForDealer } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { WhatsAppIcon } from "@/components/dealer-card";
import { EnquiryDialog } from "@/components/enquiry-dialog";
import { tierById } from "@/data/membership";

export const Route = createFileRoute("/dealer/$id")({
  loader: async ({ params }) => {
    const [dealer, products, services] = await Promise.all([
      fetchDealerById(params.id),
      fetchProductsForDealer(params.id),
      fetchServicesForDealer(params.id),
    ]);
    if (!dealer) throw notFound();
    return { dealer, products, services };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dealer.name} · Verified Dealer · My Tyres & Alloys` },
          { name: "description", content: `${loaderData.dealer.name} in ${loaderData.dealer.city}. Verified since ${loaderData.dealer.since}. ${loaderData.dealer.rating}★ rating.` },
          { property: "og:title", content: `${loaderData.dealer.name} · My Tyres & Alloys` },
          { property: "og:description", content: loaderData.dealer.address },
        ]
      : [{ title: "Dealer · My Tyres & Alloys" }, { name: "robots", content: "noindex" }],
  }),
  component: DealerDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold italic uppercase">Dealer not found</h1>
      <Button asChild variant="ghost" className="mt-6">
        <Link to="/dealers"><ArrowLeft className="size-4" /> Back to dealers</Link>
      </Button>
    </div>
  ),
});

function DealerDetail() {
  const { dealer, products, services } = Route.useLoaderData() as Awaited<ReturnType<typeof Route.options.loader>>;
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const tier = tierById(dealer.membership);

  return (
    <div>
      <section className="border-b border-border bg-steel py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/dealers" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand">
            <ArrowLeft className="size-3" /> Back to dealers
          </Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-start">
            <div className="grid size-24 place-items-center rounded-2xl bg-ink text-background">
              <span className="font-display text-2xl font-bold">{dealer.logoInitials}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
                  <ShieldCheck className="size-3" /> {tier.name} member
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                  Since {dealer.since}
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold italic uppercase leading-tight tracking-tight md:text-5xl">
                {dealer.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {dealer.address}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="size-4 fill-amber-400 text-amber-400" /> {dealer.rating.toFixed(1)}
                  <span className="text-muted-foreground">({dealer.reviewCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-4" /> {dealer.hoursText}
                </span>
                <span className="text-muted-foreground">{dealer.enquiryCount} enquiries handled</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild className="rounded-full bg-primary text-primary-foreground">
                <a href={`tel:${dealer.phone.replace(/\s/g, "")}`}>
                  <Phone className="size-4" /> Call {dealer.phone}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[var(--color-whatsapp)]/30 bg-[var(--color-whatsapp)]/10 text-[color-mix(in_oklab,var(--color-whatsapp)_75%,black)] hover:bg-[var(--color-whatsapp)]/20"
              >
                <a href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={() => setEnquiryOpen(true)}>
                Send enquiry form
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
          In-stock catalogue
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
          Services offered
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border p-5">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-brand">
                {s.priceFromText}
              </p>
            </div>
          ))}
        </div>
      </section>

      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} dealer={dealer} />
    </div>
  );
}
