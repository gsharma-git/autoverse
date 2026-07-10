import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers } from "@/lib/queries";
import { DealerCard } from "@/components/dealer-card";

export const Route = createFileRoute("/_authenticated/account/dealers")({
  component: FavDealers,
});

function FavDealers() {
  const { session } = useAuth();
  const me = useStore((s) => s.customers.find((c) => c.id === session?.userId));
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const favIds = new Set(me?.favouriteDealerIds ?? []);
  const dealers = allDealers.filter((d) => favIds.has(d.id));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Saved dealers</h2>
      {dealers.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Save dealers to quickly reach them later.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {dealers.map((d) => d && <DealerCard key={d.id} dealer={d} />)}
        </div>
      )}
    </div>
  );
}
