import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers, fetchProducts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const enquiries = useStore((s) => s.enquiries);
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const byStatus = { new: 0, contacted: 0, closed: 0 };
  enquiries.forEach((e) => (byStatus[e.status] += 1));

  function exportCsv() {
    const rows = [
      ["id", "customer", "phone", "dealer", "status", "createdAt"],
      ...enquiries.map((e) => [e.id, e.customerName, e.customerPhone, e.dealerId ?? "", e.status, new Date(e.createdAt).toISOString()]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported enquiries.csv");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New" value={byStatus.new} />
        <StatCard label="Contacted" value={byStatus.contacted} />
        <StatCard label="Closed" value={byStatus.closed} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Marketplace snapshot</h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Total dealers: <span className="font-semibold">{allDealers.length}</span></li>
          <li>Total products: <span className="font-semibold">{allProducts.length}</span></li>
          <li>Total enquiries: <span className="font-semibold">{enquiries.length}</span></li>
        </ul>
        <Button className="mt-6 rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={exportCsv}>
          Export enquiries CSV
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; va