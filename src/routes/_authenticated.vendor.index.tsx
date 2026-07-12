import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealerById, fetchProducts } from "@/lib/queries";
import { tierById } from "@/data/membership";
import { relativeTime } from "@/lib/format";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/vendor/")({
  component: VendorDashboard,
});

function VendorDashboard() {
  const { session } = useAuth();
  const vendor = useStore((s) => s.vendors.find((v) => v.id === session?.userId));
  const { data: dealer } = useQuery({
    queryKey: ["dealer", vendor?.dealerId],
    queryFn: () => fetchDealerById(vendor!.dealerId),
    enabled: !!vendor?.dealerId,
    staleTime: 5 * 60 * 1000,
  });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(), staleTime: 5 * 60 * 1000 });
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  const allEnquiries = useStore((s) => s.enquiries);
  const enquiries = allEnquiries.filter((e) => e.dealerId === dealer?.id);

  if (!vendor || !dealer) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-bold italic uppercase">Registration pending</p>
        <p className="mt-2 text-sm text-muted-foreground">
          An admin needs to link a dealership to this account.
        </p>
      </div>
    );
  }

  const tier = tierById(dealer.membership);
  const newCount = enquiries.filter((e) => e.status === "new").length;

  // ── Analytics derivations ──────────────────────────────────────────────
  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; count: number }[] = [];
    const now = Date.now();
    for (let i = 5; i >= 0; i--) {
      const start = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const end = now - i * 7 * 24 * 60 * 60 * 1000;
      const label = i === 0 ? "This wk" : i === 1 ? "Last wk" : `${i + 1}w ago`;
      weeks.push({
        week: label,
        count: enquiries.filter((e) => e.createdAt >= start && e.createdAt < end).length,
      });
    }
    return weeks;
  }, [enquiries]);

  const statusBreakdown = useMemo(() => {
    const counts = { new: 0, contacted: 0, closed: 0 };
    enquiries.forEach((e) => { counts[e.status]++; });
    return [
      { name: "New", value: counts.new, color: "var(--color-brand)" },
      { name: "Contacted", value: counts.contacted, color: "oklch(0.6 0.15 240)" },
      { name: "Closed", value: counts.closed, color: "oklch(0.7 0.05 150)" },
    ].filter((s) => s.value > 0);
  }, [enquiries]);

  return (
    <div className="grid gap-6">
      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="New enquiries" value={newCount} />
        <StatCard label="Total enquiries" value={dealer.enquiryCount + enquiries.length} />
        <StatCard label="Listings" value={dealer.productIds?.length ?? 0} />
        <StatCard label="Rating" value={dealer.rating} suffix="★" />
      </div>

      {/* ── Membership tier strip ── */}
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Current tier</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{tier.name}</h3>
            <p className="text-sm text-muted-foreground">{tier.tagline}</p>
          </div>
          <p className="font-display text-xl font-bold">{tier.priceText}</p>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Weekly enquiry trend */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Enquiry trend</h3>
          <p className="mt-1 text-xs text-muted-foreground">Last 6 weeks</p>
          <div className="mt-4 h-48">
            {enquiries.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-secondary/40">
                <p className="text-xs text-muted-foreground">No enquiries yet — chart will populate as they come in</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} barSize={28}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "var(--color-secondary)" }}
                  />
                  <Bar dataKey="count" name="Enquiries" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status breakdown donut */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">By status</h3>
          <p className="mt-1 text-xs text-muted-foreground">All time</p>
          <div className="mt-4 flex flex-col items-center gap-4">
            {statusBreakdown.length === 0 ? (
              <div className="flex h-32 w-full items-center justify-center rounded-xl bg-secondary/40">
                <p className="text-xs text-muted-foreground">No data yet</p>
              </div>
            ) : (
              <>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={64}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="w-full space-y-1.5">
                  {statusBreakdown.map((s) => (
                    <li key={s.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="font-semibold">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent enquiries ── */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Recent enquiries</h3>
        <div className="mt-4 divide-y divide-border">
          {enquiries.slice(0, 5).map((e) => {
            const p = e.productId ? productMap[e.productId] : null;
            return (
              <div key={e.id} className="grid gap-2 py-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold">{p?.name ?? "Service enquiry"} — {e.customerName}</p>
                  <p className="text-xs text-muted-foreground">{e.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{relativeTime(e.createdAt)}</span>
              </div>
            );
          })}
          {enquiries.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">No enquiries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">
        {value}
        {suffix && <span className="ml-1 text-lg text-brand">{suffix}</span>}
      </p>
    </div>
  );
}
