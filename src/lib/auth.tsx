import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "../data/types";
import { supabase } from "@/integrations/supabase/client";
import { clearStore, initStore, useStore } from "../data/store";

interface Session {
  role: Role;
  userId: string;
  email: string | null;
}

interface AuthContextValue {
  session: Session | null;
  isReady: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role as Role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("vendor")) return "vendor";
  return "customer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  const hydrate = useCallback(async (authUserId: string | null, email: string | null) => {
    if (!authUserId) {
      setSession(null);
      clearStore();
      return;
    }
    const role = await resolveRole(authUserId);
    const next = { userId: authUserId, role, email };
    setSession(next);
    await initStore(authUserId, role);
  }, []);

  useEffect(() => {
    // subscribe first so no events are missed
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // defer supabase-touching work to avoid deadlocks
      setTimeout(() => {
        hydrate(s?.user?.id ?? null, s?.user?.email ?? null).catch(() => {});
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      hydrate(data.session?.user?.id ?? null, data.session?.user?.email ?? null)
        .catch(() => {})
        .finally(() => setIsReady(true));
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    clearStore();
  }, []);

  const refreshRole = useCallback(async () => {
    if (!session) return;
    const role = await resolveRole(session.userId);
    setSession({ ...session, role });
    await initStore(session.userId, role);
  }, [session]);

  const value = useMemo(
    () => ({ session, isReady, signOut, refreshRole }),
    [session, isReady, signOut, refreshRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCurrentUser() {
  const { session } = useAuth();
  const customers = useStore((s) => s.customers);
  const vendors = useStore((s) => s.vendors);
  const admins = useStore((s) => s.admins);
  if (!session) return null;
  if (session.role === "customer") return customers.find((c) => c.id === session.userId) ?? null;
  if (session.role === "vendor") return vendors.find((v) => v.id === session.userId) ?? null;
  return admins.find((a) => a.id === session.userId) ?? null;
}

// Legacy re-exports for older imports; empty in real-backend mode.
export const demoAccounts = {
  customers: [] as never[],
  vendors: [] as never[],
  admins: [] as never[],
};
