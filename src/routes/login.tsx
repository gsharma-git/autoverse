import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { UserRound, Store, ShieldCheck, Mail, Lock, Phone, Car, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const VEHICLE_TYPES = [
  "Hatchback", "Sedan", "SUV", "MUV", "Luxury Car",
  "Bike / Scooter", "Commercial Vehicle", "Tractor", "Other",
];

const search = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  role: z.enum(["customer", "vendor"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in - AutoVerse" },
      { name: "description", content: "Sign in or create an account as a customer or dealer on AutoVerse." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, refreshRole } = useAuth();
  const nav = useNavigate();
  const params = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"signin" | "signup">(params.mode ?? "signin");
  const [role, setRole] = useState<"customer" | "vendor">(params.role ?? "customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const dest = session.role === "admin" ? "/admin" : session.role === "vendor" ? "/vendor" : "/account";
      nav({ to: dest, replace: true });
    }
  }, [session, nav]);

  function redirectByRole(r: string) {
    if (r === "admin") nav({ to: "/admin" });
    else if (r === "vendor") nav({ to: "/vendor" });
    else nav({ to: "/account" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && role === "customer" && (!phone || !vehicle || !pincode)) {
      toast.error("Please fill in phone, vehicle type and pincode");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, role, phone, vehicle, pincode },
          },
        });
        if (error) throw error;
        toast.success(data.session ? "Account created" : "Check your email to confirm");
        if (data.session) {
          await refreshRole();
          redirectByRole(role);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refreshRole();
        toast.success("Welcome back");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.redirected) return;
      await refreshRole();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Account</p>
        <h1 className="mt-3 font-display text-4xl font-bold italic uppercase tracking-tight">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Save favourites, track enquiries, and manage your dealership from anywhere.
          {" "}
          {mode === "signin" ? (
            <>New here? <button type="button" onClick={() => setMode("signup")} className="font-semibold text-brand underline-offset-4 hover:underline">Create an account</button>.</>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode("signin")} className="font-semibold text-brand underline-offset-4 hover:underline">Sign in</button>.</>
          )}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <RoleCard active={mode === "signup" && role === "customer"} disabled={mode === "signin"} icon={<UserRound className="size-4" />} label="Customer" onClick={() => setRole("customer")} />
          <RoleCard active={mode === "signup" && role === "vendor"} disabled={mode === "signin"} icon={<Store className="size-4" />} label="Dealer" onClick={() => setRole("vendor")} />
          <RoleCard active={false} disabled icon={<ShieldCheck className="size-4" />} label="Admin (invite only)" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4">
          {mode === "signup" && (
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-9" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className="pl-9" />
            </div>
          </div>

          {mode === "signup" && role === "customer" && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 98765 43210" className="pl-9" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vehicle">Vehicle type</Label>
                <div className="relative">
                  <Car className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Select value={vehicle} onValueChange={setVehicle}>
                    <SelectTrigger className="pl-9" id="vehicle">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required placeholder="e.g. 400001" maxLength={6} className="pl-9" />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create " + role + " account"}
          </Button>

          <div className="relative py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="relative z-10 bg-card px-3">or</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>

          <Button type="button" variant="outline" disabled={loading} onClick={googleSignIn} className="rounded-full">
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Back to home</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function RoleCard({
  active,
  disabled,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={"flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-colors " +
        (active ? "border-brand bg-brand/5 " : "border-border ") +
        (disabled ? "cursor-not-allowed opacity-60" : "hover:border-brand")}
    >
      <span className="grid size-8 place-items-center rounded-full bg-secondary">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
