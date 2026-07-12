import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, upgradeMembership } from "@/data/store";
import { membershipTiers } from "@/data/membership";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/membership")({
  component: VendorMembership,
});

const TIER_ORDER = ["free", "silver", "gold", "diamond"] as const;

function VendorMembership() {
  const { session } = useAuth();
  const vendor = useStore((s) => s.vendors.find((v) => v.id === session?.userId));
  const current = (vendor as any)?.membership ?? "free";

  const [pending, setPending] = useState<string | null>(null);   // tier being confirmed
  const [saving, setSaving] = useState(false);

  async function confirmSwitch() {
    if (!pending || !vendor) return;
    setSaving(true);
    try {
      await upgradeMembership(vendor.id, vendor.dealerId, pending as any);
      toast.success(`Switched to ${pending.charAt(0).toUpperCase() + pending.slice(1)}`, {
        description: "Your listing visibility updates within a few minutes.",
      });
    } catch (err: any) {
      toast.error("Could not update membership", { description: err?.message });
    } finally {
      setSaving(false);
      setPending(null);
    }
  }

  const pendingTier = membershipTiers.find((t) => t.id === pending);
  const currentIdx = TIER_ORDER.indexOf(current as any);
  const pendingIdx = pending ? TIER_ORDER.indexOf(pending as any) : -1;
  const isDowngrade = pendingIdx < currentIdx;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Membership</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re on the{" "}
          <span className="font-semibold capitalize text-foreground">{current}</span> tier.
          Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {membershipTiers.map((t) => {
          const isCurrent = t.id === current;
          const tierIdx = TIER_ORDER.indexOf(t.id as any);
          const isUpgrade = tierIdx > currentIdx;

          return (
            <div
              key={t.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5 transition-shadow",
                isCurrent
                  ? "border-brand bg-brand/5 shadow-[0_0_0_1px_var(--color-brand)]"
                  : "border-border bg-card hover:shadow-md",
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
              <ul className="mt-4 flex-1 space-y-1.5 text-xs">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setPending(t.id)}
                disabled={isCurrent || saving}
                className={cn(
                  "mt-6 rounded-full",
                  isCurrent
                    ? "bg-secondary text-muted-foreground"
                    : isUpgrade
                    ? "bg-brand text-brand-foreground hover:bg-brand/90"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {isCurrent
                  ? "Current plan"
                  : isUpgrade
                  ? `Upgrade to ${t.name}`
                  : `Downgrade to ${t.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isDowngrade ? "Downgrade" : "Upgrade"} to {pendingTier?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDowngrade
                ? `Switching to ${pendingTier?.name} will reduce your product listings and visibility. Your existing listings above the new limit will be hidden until you upgrade again.`
                : `You'll be switched to ${pendingTier?.name} (${pendingTier?.priceText}). Your listings and visibility will be updated within a few minutes.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwitch}
              disabled={saving}
              className={isDowngrade ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </span>
              ) : isDowngrade ? (
                "Yes, downgrade"
              ) : (
                "Confirm upgrade"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
