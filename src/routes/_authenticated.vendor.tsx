import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, Wrench, Inbox, UserRound, CreditCard, ShieldPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RoleMismatch } from "./_authenticated.account";
import { useStore } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealerById } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/vendor")({
  component: VendorLayout,
});

const nav = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/vendor/products", label: "Products", icon: Package },
  { to: "/vendor/services", label: "Services", icon: Wrench },
  { to: "/vendor/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/vendor/profile", label: "Business profile", icon: UserRound },
  { to: "/vendor/membership", label: "Membership", icon: CreditCard },
  { to: "/vendor/register", label: "Register (demo)", icon: ShieldPlus },
];

function VendorLayout() {
  const { session } = useAuth();
  const vendor = useStore((s) => s.vendors.find((v) => v.id === session?.userId));
  const { data: dealer } = useQuery({
    queryKey: ["dealer", vendor?.dealerId],
    queryFn: () => fetchDealerById(vendor!.dealerId),
    enabled: !!vendor?.dealerId,
    staleTime: 5 * 60 * 1000,
  });

  if (session?.role !== "vendor") return <RoleMismatch expected="vendor" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Vendor panel</p>
          <h1 className="mt-2 font-display text-3xl font-bold italic uppercase tracking-tight">
            {dealer?.name ?? "Your dealership"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: <span className="font-semibold text-foreground">{vendor?.status}</span> · Membership: {dealer?.membership}
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3">
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary",
                )}
                activeOptions={{ exact: n.exact }}
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <n.icon className