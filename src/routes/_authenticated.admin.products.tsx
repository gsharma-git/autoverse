import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, moderateVendorProduct } from "@/data/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StatusBadge } from "./_authenticated.vendor.products";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const products = useStore((s) => s.vendorProducts);
  const vendors = useStore((s) => s.vendors);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  function vendorLabel(id: string) {
    const v = vendors.find((v) => v.id === id);
    return v?.ownerName || v?.email || "Unknown vendor";
  }

  async function decide(id: string, status: "approved" | "rejected") {
    try {
      await moderateVendorProduct(id, status);
      toast.success(`Product ${status}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const filtered = products.filter((p) => p.status === tab);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div>
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Product moderation</h2>
        <p className="text-xs text-muted-foreground">Review vendor-submitted tyres and alloys.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <span className="ml-2 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">
              {products.filter((p) => p.status === "pending").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Image</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Brand</th>
                  <th className="py-2 pr-3">Size</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Vendor</th>
                  <th className="py-2 pr-3">Submitted</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted-foreground">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-semibold">{p.name}</td>
                    <td className="py-3 pr-3 capitalize">{p.category}</td>
                    <td className="py-3 pr-3">{p.brand || "—"}</td>
                    <td className="py-3 pr-3">{p.size}</td>
                    <td className="py-3 pr-3">{formatINR(p.price)}</td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{vendorLabel(p.vendorId)}</td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {p.status !== "approved" && (
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => decide(p.id, "approved")}>
                            Approve
                          </Button>
                        )}
                        {p.status !== "rejected" && (
                          <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => decide(p.id, "rejected")}>
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      No {tab} products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
