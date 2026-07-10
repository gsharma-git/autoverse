import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { updateCustomerProfile, useStore } from "@/data/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/profile")({
  component: Profile,
});

function Profile() {
  const { session } = useAuth();
  const me = useStore((s) => s.customers.find((c) => c.id === session?.userId));
  const [name, setName] = useState(me?.name ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [city, setCity] = useState(me?.city ?? "");
  const [pincode, setPincode] = useState(me?.pincode ?? "");
  const [vehicle, setVehicle] = useState(me?.vehicle ?? "");

  if (!me) return null;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    updateCustomerProfile(me.id, { name, email, phone, city, pincode, vehicle });
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label="Vehicle"><Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} /></Field>
        <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
        <Field label="Pincode"><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></Field>
      </div>
      <Button type="submit" className="mt-2 justify-self-start rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        Save changes
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
