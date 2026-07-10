import { createFileRoute } from "@tanstack/react-router";
import { useStore, updateVendorStatus } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  component: AdminVendors,
});

function AdminVendors() {
  const vendors = useStore((s) => s.vendors);
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const dealerMap = Object.fromEntries(allDealers.map((d) => [d.id, d]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
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
              const d = dealerMap[v.dealerId];
              return (
                <tr key={v.id}>
                  <td className="py-3 pr-3 font-semibold">{d?.name ?? v.dealerId}</td>
                  <td className="py-3 pr-3">{v.ownerName}</td>
                  <td className="py-3 pr-3">{d?.city ?? "—"}</td>
                  <td className="py-3 pr-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                      v.status === "verified" && "bg-brand/10 text-brand",
                      v.status === "pending" && "bg-amber-100 text-amber-800",
                      v.status === "suspended" && "bg-destructive/10 text-destructive",
                    )}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 flex gap-1">
                    {v.status !== "verified" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateVendorStatus(v.id, "verified")}>Approve</Button>
                    )}
                    {v.status !== "suspended" && (
                      <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => updateVendorStatus(v.id, "suspended")}>Suspend</Button>
                    )}
                    {v.status === "suspended" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateVendorStatus(v.id, "pending")}>Restore</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
