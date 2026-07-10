import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { dealerFromVendor } from "@/data/store";
import { membershipTiers } from "@/data/membership";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/membership")({
  component: VendorMembership,
});

function VendorMembership() {
  const { session } = useAuth();
  const dealer = session ? dealerFromVendor(session.userId) : undefined;
  const current = dealer?.membership ?? "free";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Membership</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re on the <span className="font-semibold text-foreground">{current}</span> tier.
          Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {membershipTiers.map((t) => {
          const isCurrent = t.id === current;
          return (
            <div
              key={t.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                isCurrent ? "border-brand bg-brand/5" : "border-border bg-card",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">{t.name}</h3>
                {isCurrent && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-foreground">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.tagline}</p>
              <p className="mt-4 font-display text-2xl font-bold">{t.priceText}</p>
              <ul className="mt-4 space-y-1.5 text-xs">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.success(`Switched to ${t.name} (demo)`)}
                disabled={isCurrent}
                className={cn(
                  "mt-6 rounded-full",
                  isCurrent ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                {isCurrent ? "Current plan" : `Switch to ${t.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
