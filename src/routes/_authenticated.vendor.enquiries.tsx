import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { dealerFromVendor, updateEnquiryStatus, useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchServices } from "@/lib/queries";
import { relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/vendor/enquiries")({
  component: VendorEnquiries,
});

function VendorEnquiries() {
  const { session } = useAuth();
  const dealer = session ? dealerFromVendor(session.userId) : undefined;
  const enquiries = useStore((s) => s.enquiries.filter((e) => e.dealerId === dealer?.id));
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const { data: allServices = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const serviceMap = Object.fromEntries(allServices.map((s) => [s.id, s]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Enquiry inbox</h2>
      <div className="mt-4 space-y-3">
        {enquiries.map((e) => {
          const p = e.productId ? productMap[e.productId] : null;
          const s = e.serviceId ? serviceMap[e.serviceId] : null;
          return (
            <div key={e.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {p?.name ?? s?.name ?? "General enquiry"} — {e.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.customerPhone} · {e.customerPincode} · {relativeTime(e.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{e.message}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                  {e.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" asChild variant="outline" className="rounded-full">
                  <a href={`tel:${e.customerPhone.replace(/\s/g, "")}`}>Call customer</a>
                </Button>
                <Button size="sm" asChild variant="outline" className="rounded-full">
                  <a href={`https://wa.me/${e.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </Button>
                {e.status !== "contacted" && (
                  <Button size="sm" onClick={() => updateEnquiryStatus(e.id, "contacted")} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                    Mark contacted
                  </Button>
                )}
                {e.s