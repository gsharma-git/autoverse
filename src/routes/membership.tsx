import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { membershipTiers } from "@/data/membership";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Dealer Membership Plans · My Tyres & Alloys" },
      { name: "description", content: "Compare Free, Silver, Gold and Diamond membership tiers for tyre and alloy dealers. Grow your local enquiry pipeline." },
      { property: "og:title", content: "Dealer Membership · My Tyres & Alloys" },
      { property: "og:description", content: "Free → Diamond. Scale visibility and lead volume as you grow." },
    ],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Dealer membership</p>
        <h1 className="mt-3 font-display text-4xl font-bold italic uppercase tracking-tight md:text-5xl">
          Choose how you want to grow
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every tier is a step-change in visibility and lead volume. Start free, upgrade any time.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {membershipTiers.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex flex-col rounded-3xl border p-6 transition-all",
              t.featured ? "border-brand bg-brand text-brand-foreground shadow-[var(--shadow-elevated)]" : "border-border bg-card",
            )}
          >
            {t.featured && (
              <span className="mb-3 inline-block self-start rounded-full bg-brand-foreground/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                Most popular
              </span>
            )}
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{t.name}</h2>
            <p className={cn("mt-1 text-sm", t.featured ? "text-brand-foreground/80" : "text-muted-foreground")}>
              {t.tagline}
            </p>
            <p className="mt-6 font-display text-3xl font-bold">{t.priceText}</p>

            <ul className="mt-6 space-y-2 text-sm">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className={cn("mt-6 space-y-2 border-t pt-4 text-xs", t.featured ? "border-brand-foreground/30" : "border-border")}>
              <p><span className="font-semibold">Products:</span> {t.productLimit}</p>
              <p><span className="font-semibold">Visibility:</span> {t.visibility}</p>
              <p><span className="font-semibold">Leads:</span> {t.leads}</p>
            </div>

            <Button
              asChild
              className={cn(
                "mt-6 rounded-full",
                t.featured ? "bg-ink text-background hover:bg-ink/90" : "bg-primary text-primary-foreground",
              )}
            >
              <Link to="/vendor/register">Get started</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
