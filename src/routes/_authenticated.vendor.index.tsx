import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealerById, fetchProducts } from "@/lib/queries";
import { tierById } from "@/data/membership";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vendor/")({
  component: VendorDashboard,
});

function VendorDashboard() {
  const { session } = useAuth();
  const vendor = useStore((s) => s.vendors.find((v) => v.id === session?.userId));
  const { data: dealer } = useQuery({
    queryKey: ["dealer", vendor?.dealerId],
    queryFn: () => fetchDealerById(vendor!.dealerId),
    enabled: !!vendor?.dealerId,
    staleTime: 5 * 60 * 1000,
  });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const enquiries = useStore((s) => s.enquiries.filter((e) => e.dealerId === dealer?.id));

  if (!vendor || !dealer) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-bold italic uppercase">Registration pending</p>
        <p className="mt-2 text-sm text-muted-foreground">
          An admin needs to link a dealership to this account.
        </p>
      </div>
    );
  }

  const tier = tierById(dealer.membership);
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="New enquiries" value={newCount} />
        <StatCard label="Total enquiries" value={dealer.enquiryCount + enquiries.length} />
        <StatCard label="Listings" value={dealer.productIds?.length ?? 0} />
        <StatCard label="Rating" value={dealer.rating} suffix="★" />
      </div>

      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Current tier</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{tier.name}</h3>
            <p className="text-sm text-muted-foreground">{tier.tagline}</p>
          </div>
          <p className="font-display text-xl font-bold">{tier.priceText}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Recent enquiries</h3>
        <div className="mt-4 divide-y divide-border">
          {enquiries.slice(0, 5).map((e) => {
            const p = e.productId ? productMap[e.productId] : null;
            return (
              <div key={e.id} className="grid gap-2 py-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold">{p?.name ?? "Service enquiry"} — {e.customerName}</p>
                  <p className="text-xs text-muted-foreground">{e.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{relativeTime(e.createdAt)}</span>
              </div>
            );
          })}
          {enquiries.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">No enquiries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">
        {value}
        {suffix && <span className="ml-1 text-lg text-brand">{suffix}</span>}
      </p>
    </div>
  );
}
