import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Phone, Star, ShieldCheck, MapPin, Clock, ArrowLeft, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDealerById, fetchProductsForDealer, fetchServicesForDealer, fetchReviewsForDealer } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { WhatsAppIcon } from "@/components/dealer-card";
import { EnquiryDialog } from "@/components/enquiry-dialog";
import { tierById } from "@/data/membership";
import { relativeTime } from "@/lib/format";
import type { Review } from "@/data/types";

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
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dealer.name} · Verified Dealer · AutoVerse` },
          {
            name: "description",
            content: `${loaderData.dealer.name} in ${loaderData.dealer.city}. Verified since ${loaderData.dealer.since}. ${loaderData.dealer.rating}★ rating from ${loaderData.dealer.reviewCount} reviews.`,
          },
          { property: "og:title", content: `${loaderData.dealer.name} · AutoVerse` },
          { property: "og:description", content: `${loaderData.dealer.address} — ${loaderData.dealer.rating}★ verified dealer` },
          { property: "og:url", content: `https://autoverse.in/dealer/${params.id}` },
          { property: "og:type", content: "website" },
        ]
      : [{ title: "Dealer · AutoVerse" }, { name: "robots", content: "noindex" }],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: dealer.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address,
      addressLocality: dealer.city,
      addressCountry: "IN",
    },
    telephone: dealer.phone,
    aggregateRating: dealer.reviewCount > 0
      ? { "@type": "AggregateRating", ratingValue: dealer.rating, reviewCount: dealer.reviewCount }
      : undefined,
    url: `https://autoverse.in/dealer/${dealer.id}`,
    openingHours: dealer.openTime && dealer.closeTime
      ? `Mo-Sa ${dealer.openTime}-${dealer.closeTime}`
      : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-border bg-steel py-12">
        {dealer.storefrontImage && (
          <div className="relative h-56 overflow-hidden sm:h-72">
            <img src={dealer.storefrontImage} alt={dealer.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-ink/50" />
          </div>
        )}
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
              <h1 className="mt-3 font-display text-3xl font-bold italic uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl">
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

      <ReviewsSection dealerId={dealer.id} rating={dealer.rating} reviewCount={dealer.reviewCount} />

      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} dealer={dealer} />
    </div>
  );
}

function ReviewsSection({
  dealerId,
  rating,
  reviewCount,
}: {
  dealerId: string;
  rating: number;
  reviewCount: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["dealer-reviews", dealerId],
    queryFn: () => fetchReviewsForDealer(dealerId),
  });

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = reviews.length || 1;
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
        Customer reviews
      </h2>

      <div className="mt-6 grid gap-6 rounded-2xl border border-border p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="text-center md:text-left">
          <div className="font-display text-5xl font-bold">{rating.toFixed(1)}</div>
          <div className="mt-2 flex items-center justify-center gap-0.5 md:justify-start">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`size-5 ${
                  i <= Math.round(rating) ? "fill-brand text-brand" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on {reviewCount.toLocaleString("en-IN")} reviews
          </p>
        </div>
        <div className="space-y-2">
          {counts.map(({ star, count }) => {
            const pct = reviews.length ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-6 font-semibold">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-secondary/40" />
            ))
          : visible.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>

      {reviews.length > 4 && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
          </Button>
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{review.customerName}</p>
          {review.verified && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
              <BadgeCheck className="size-3" /> Verified buyer
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{relativeTime(review.createdAt)}</span>
      </div>
      <div className="mt-3 flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`size-4 ${
              i <= Math.round(review.rating) ? "fill-brand text-brand" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <h3 className="mt-2 font-bold">{review.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
    </div>
  );
}
