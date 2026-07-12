import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchDealers } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { session } = useAuth();
  const customers = useStore((s) => s.customers);
  const enquiries = useStore((s) => s.enquiries);
  const notifications = useStore((s) => s.notifications);

  const me = customers.find((c) => c.id === session?.userId);
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const dealerMap = Object.fromEntries(allDealers.map((d) => [d.id, d]));
  if (!me) return null;

  const myEnquiries = enquiries.filter((e) => e.customerId === me.id);
  const myNotifications = notifications.filter((n) => n.userId === me.id);
  const unread = myNotifications.filter((n) => !n.read).length;

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground">Welcome back,</p>
        <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
          {me.name.split(" ")[0]}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {me.vehicle} · Home pincode {me.pincode}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Enquiries sent" value={myEnquiries.length} to="/account/enquiries" />
        <Stat label="Favourite products" value={me.favouriteProductIds.length} to="/account/favourites" />
        <Stat label="Unread updates" value={unread} to="/account/notifications" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Recent enquiries</h3>
        <div className="mt-4 space-y-3">
          {myEnquiries.slice(0, 3).map((e) => {
            const p = e.productId ? productMap[e.productId] : null;
            const d = e.dealerId ? dealerMap[e.dealerId] : null;
            return (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-semibold">{p?.name ?? "Service enquiry"}</p>
                  <p className="text-xs text-muted-foreground">
                    To {d?.name ?? "any nearby dealer"}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                  {e.status}
                </span>
              </div>
            );
          })}
          {myEnquiries.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No enquiries yet. <Link to="/tyres" className="text-brand underline">Start browsing tyres</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </Link>
  );
}
