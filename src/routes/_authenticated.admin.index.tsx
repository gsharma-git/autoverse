import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers, fetchProducts } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const enquiries = useStore((s) => s.enquiries);
  const vendors = useStore((s) => s.vendors);
  const pending = vendors.filter((v) => v.status === "pending").length;
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total dealers" value={allDealers.length} />
        <StatCard label="Products live" value={allProducts.length} />
        <StatCard label="Enquiries" value={enquiries.length} />
        <StatCard label="Pending vendors" value={pending} accent />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Recent activity</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {enquiries.slice(0, 6).map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Enquiry from <span className="font-semibold">{e.customerName}</span></span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{e.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-brand bg-brand/5" : "border-border bg-card"}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
