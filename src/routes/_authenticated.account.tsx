import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Heart, Bell, UserRound, Store } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountLayout,
});

const nav = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/account/enquiries", label: "My enquiries", icon: Inbox },
  { to: "/account/favourites", label: "Favourites", icon: Heart },
  { to: "/account/dealers", label: "Saved dealers", icon: Store },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/profile", label: "Profile", icon: UserRound },
];

function AccountLayout() {
  const { session } = useAuth();

  if (session?.role !== "customer") {
    return <RoleMismatch expected="customer" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Customer account</p>
        <h1 className="mt-2 font-display text-3xl font-bold italic uppercase tracking-tight">
          Your garage
        </h1>
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
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { claimFirstAdmin } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RoleMismatch({ expected }: { expected: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold italic uppercase">Access restricted</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This section is only available to <span className="font-semibold">{expected}</span> accounts.
      </p>
      {expected === "admin" && <ClaimFirstAdmin />}
    </div>
  );
}

function ClaimFirstAdmin() {
  const { refreshRole } = useAuth();
  async function claim() {
    try {
      const isAdmin = await claimFirstAdmin();
      if (isAdmin) {
        toast.success("You are now an admin");
        await refreshRole();
      } else {
        toast.message("An admin already exists — ask them to grant you access.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    }
  }
  return (
    <div className="mt-6">
      <Button onClick={claim} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        Claim first admin role
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">Only works if no admin exists yet.</p>
    </div>
  );
}
