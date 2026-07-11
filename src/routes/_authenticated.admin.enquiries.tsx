import { createFileRoute } from "@tanstack/react-router";
import { useStore, updateEnquiryStatus } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers, fetchProducts, fetchServices } from "@/lib/queries";
import { relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: AdminEnquiries,
});

function AdminEnquiries() {
  const enquiries = useStore((s) => s.enquiries);
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const { data: allServices = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const dealerMap = Object.fromEntries(allDealers.map((d) => [d.id, d]));
  const serviceMap = Object.fromEntries(allServices.map((s) => [s.id, s]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">All enquiries</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">About</th>
              <th className="py-2 pr-3">Dealer</th>
              <th className="py-2 pr-3">Age</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enquiries.map((e) => {
              const p = e.productId ? productMap[e.productId] : null;
              const s = e.serviceId ? serviceMap[e.serviceId] : null;
              const d = e.dealerId ? dealerMap[e.dealerId] : null;
              return (
                <tr key={e.id}>
                  <td className="py-3 pr-3">{e.customerName}</td>
                  <td className="py-3 pr-3">{p?.name ?? s?.name ?? "General"}</td>
                  <td className="py-3 pr-3">{d?.name ?? "—"}</td>
                  <td className="py-3 pr-3 text-muted-foreg