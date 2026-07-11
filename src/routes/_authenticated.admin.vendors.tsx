import { createFileRoute } from "@tanstack/react-router";
import { useStore, updateVendorStatus, moderateVendorService } from "@/data/store";
import { dealerById } from "@/data/dealers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  component: AdminVendors,
});

function AdminVendors() {
  const vendors = useStore((s) => s.vendors);
  const pendingServices = useStore((s) => s.vendorServices.filter((v) => v.status === "pending"));

  function vendorLabel(id: string) {
    const v = vendors.find((v) => v.id === id);
    return v?.ownerName || v?.email || "Unknown vendor";
  }

  async function decideService(id: string, status: "approved" | "rejected") {
    try {
      await moderateVendorService(id, status);
      toast.success("Service " + status);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Vendor verification</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Business</th>
                <th className="py-2 pr-3">Owner</th>
                <th className="py-2 pr-3">City</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v) => {
                const d = dealerById(v.dealerId);
                return (
                  <tr key={v.id}>
                    <td className="py-3 pr-3 font-semibold">{d?.name ?? v.dealerId}</td>
                    <td className="py-3 pr-3">{v.ownerName}</td>
                    <td className="py-3 pr-3">{d?.city ?? "—"}</td>
                    <td className="py-3 pr-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                        v.status === "verified" && "bg-emerald-100 text-emerald-800",
                        v.status === "pending" && "bg-amber-100 text-amber-800",
                        v.status === "suspended" && "bg-red-100 text-red-800",
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 flex gap-1">
                      {v.status !== "verified" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateVendorStatus(v.id, "verified")}>
                          Approve
                        </Button>
                      )}
                      {v.status !== "suspended" && (
                        <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => updateVendorStatus(v.id, "suspended")}>
                          Suspend
                        </Button>
                      )}
                      {v.status === "suspended" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateVendorStatus(v.id, "pending")}>
                          Restore
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No vendors yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">Vendor services pending approval</h2>
            <p className="text-xs text-muted-foreground">Review and approve new services submitted by vendors.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {pendingServices.length} pending
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Vendor</th>
                <th className="py-2 pr-3">Submitted</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingServices.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 pr-3 font-semibold">{s.name}</td>
                  <td className="py-3 pr-3 max-w-md text-muted-foreground">
                    <span className="line-clamp-2">{s.description || "—"}</span>
                  </td>
                  <td className="py-3 pr-3">{s.priceFromText || "—"}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{vendorLabel(s.vendorId)}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => decideService(s.id, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => decideService(s.id, "rejected")}>
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No services awaiting approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
