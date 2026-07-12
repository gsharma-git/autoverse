import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchDealers, fetchServices } from "@/lib/queries";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/enquiries")({
  component: MyEnquiries,
});

function MyEnquiries() {
  const { session } = useAuth();
  const allEnquiries = useStore((s) => s.enquiries);
  const enquiries = allEnquiries.filter((e) => e.customerId === session?.userId);
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const { data: allServices = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const dealerMap = Object.fromEntries(allDealers.map((d) => [d.id, d]));
  const serviceMap = Object.fromEntries(allServices.map((s) => [s.id, s]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">My enquiries</h2>
      <div className="mt-4 divide-y divide-border">
        {enquiries.map((e) => {
          const p = e.productId ? productMap[e.productId] : null;
          const s = e.serviceId ? serviceMap[e.serviceId] : null;
          const d = e.dealerId ? dealerMap[e.dealerId] : null;
          return (
            <div key={e.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    {e.status}
                  </span>
                  <p className="font-semibold">
                    {p?.name ?? s?.name ?? "General enquiry"}
                  </p>
                  <span className="text-xs text-muted-foreground">· {relativeTime(e.createdAt)}</span>
                </div>
                {d && <p className="mt-1 text-xs text-muted-foreground">Sent to {d.name}</p>}
                <p className="mt-2 text-sm text-muted-foreground">{e.message}</p>
              </div>
            </div>
          );
        })}
        {enquiries.length === 0 && (
          <p className="py-6 text-sm text-muted-foreground">No enquiries yet.</p>
        )}
      </div>
    </div>
  );
}
