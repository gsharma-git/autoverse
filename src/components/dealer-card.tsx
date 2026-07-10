import { Link } from "@tanstack/react-router";
import { Phone, Star, MapPin, Heart, ShieldCheck } from "lucide-react";
import type { Dealer } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toggleFavouriteDealer, useStore } from "@/data/store";

const membershipStyles: Record<Dealer["membership"], string> = {
  diamond: "bg-ink text-background",
  gold: "bg-brand text-brand-foreground",
  silver: "bg-secondary text-secondary-foreground",
  free: "bg-secondary text-muted-foreground",
};

const membershipLabels: Record<Dealer["membership"], string> = {
  diamond: "Verified Diamond",
  gold: "Verified Gold",
  silver: "Verified Silver",
  free: "Verified",
};

export function DealerCard({ dealer }: { dealer: Dealer }) {
  const { session } = useAuth();
  const customers = useStore((s) => s.customers);
  const me = session?.role === "customer" ? customers.find((c) => c.id === session.userId) : null;
  const isFav = me?.favouriteDealerIds.includes(dealer.id) ?? false;

  const waLink = `https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}`;
  const telLink = `tel:${dealer.phone.replace(/\s/g, "")}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start gap-4 p-5">
        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-ink text-background">
          <span className="font-display text-sm font-bold">{dealer.logoInitials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to="/dealer/$id" params={{ id: dealer.id }}>
                <h3 className="truncate font-display text-lg font-bold tracking-tight">
                  {dealer.name}
                </h3>
              </Link>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3" /> {dealer.city} · {dealer.distanceKm.toFixed(1)} km away
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                membershipStyles[dealer.membership],
              )}
            >
              <ShieldCheck className="size-3" />
              {membershipLabels[dealer.membership]}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {dealer.rating.toFixed(1)}
              <span className="text-muted-foreground">({dealer.reviewCount})</span>
            </span>
            <span className="text-muted-foreground">
              {dealer.enquiryCount} enquiries handled
            </span>
          </div>
        </div>
        {me && (
          <button
            onClick={() => toggleFavouriteDealer(me.id, dealer.id)}
            className={cn(
              "grid size-8 place-items-center rounded-full text-foreground/60 transition-colors hover:text-brand",
              isFav && "text-brand",
            )}
            aria-label="Save dealer"
          >
            <Heart className={cn("size-4", isFav && "fill-current")} />
          </button>
        )}
      </div>
      <div className="mt-auto flex gap-2 border-t border-border bg-secondary/30 p-3">
        <Button asChild size="sm" className="flex-1 rounded-full bg-primary text-primary-foreground">
          <a href={telLink}>
            <Phone className="size-4" />
            Call dealer
          </a>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="flex-1 rounded-full border-[var(--color-whatsapp)]/30 bg-[var(--color-whatsapp)]/10 text-[color-mix(in_oklab,var(--color-whatsapp)_75%,black)] hover:bg-[var(--color-whatsapp)]/20"
        >
          <a href={waLink} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}
