import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, isReady } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isReady && !session) nav({ to: "/login", replace: true });
  }, [isReady, session, nav]);

  if (!isReady) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  if (!session) return null;

  return <Outlet />;
}
