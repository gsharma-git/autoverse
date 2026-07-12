import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Users, Package, Inbox, Megaphone, FileText, BarChart3, Settings, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RoleMismatch } from "./_authenticated.account";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/vendors", label: "Vendors", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/catalog", label: "Catalog", icon: BookOpen },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/banners", label: "Banners", icon: Megaphone },
  { to: "/admin/cms", label: "CMS", icon: FileText },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { session } = useAuth();
  if (session?.role !== "admin") return <RoleMismatch expected="admin" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Admin console</p>
        <h1 className="mt-2 font-display text-3xl font-bold italic uppercase tracking-tight">
          Marketplace control
        </h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3">
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary")}
                activeOptions={{ exact: n.exact }}
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
