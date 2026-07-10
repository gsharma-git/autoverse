import { createFileRoute } from "@tanstack/react-router";
import { useStore, moderateVendorProduct, moderateVendorService } from "@/data/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const products = useStore((s) => s.vendorProducts);
  const services = useStore((s) => s.vendorServices);
  const vendors = useStore((s) => s.vendors);

  async function decideP(id: string, status: "approved" | "rejected") {
    try { await moderateVendorProduct(id, status); toast.success(`Product ${status}`); }
    catch (err: any) { toast.error(err.message); }
  }
  async function decideS(id: string, status: "approved" | "rejected") {
    try { await moderateVendorService(id, status); toast.success(`Service ${status}`); }
    catch (err: any) { toast.error(err.message); }
  }

  function vendorLabel(id: string) {
    const v = vendors.find((v) => v.id === id);
    return v?.ownerName || v?.email || "Unknown vendor";
  }

  const badge = (status: string) =>
    cn(
      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
      status === "approved" ? "bg-brand text-brand-foreground" :
      status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground",
    );

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Product moderation</h2>
        <p className="text-xs text-muted-foreground">Vendor-submitted tyres & alloys awaiting review.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Vendor</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-3 font-semibold">{p.name}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{vendorLabel(p.vendorId)}</td>
                  <td className="py-3 pr-3 capitalize">{p.category}</td>
                  <td className="py-3 pr-3">{p.size}</td>
                  <td className="py-3 pr-3">{formatINR(p.price)}</td>
                  <td className="py-3 pr-3"><span className={badge(p.status)}>{p.status}</span></td>
                  <td className="py-3 space-x-2">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decideP(p.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => decideP(p.id, "rejected")}>Reject</Button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No vendor products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Service moderation</h2>
        <p className="text-xs text-muted-foreground">Vendor-submitted services awaiting review.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Vendor</th>
                <th className="py-2 pr-3">Starting price</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-3 font-semibold">{p.name}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{vendorLabel(p.vendorId)}</td>
                  <td className="py-3 pr-3">{p.priceFromText || "—"}</td>
                  <td className="py-3 pr-3"><span className={badge(p.status)}>{p.status}</span></td>
                  <td className="py-3 space-x-2">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decideS(p.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => decideS(p.id, "rejected")}>Reject</Button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No vendor services yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
