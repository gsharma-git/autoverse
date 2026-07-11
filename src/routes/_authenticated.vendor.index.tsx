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
  const enquiries = useStore((s) => s.enquiries.filter((e) => e.dealerId === dealer?.id));

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
            <h3