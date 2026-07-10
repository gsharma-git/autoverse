import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { dealerFromVendor, useStore } from "@/data/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/vendor/profile")({
  component: VendorProfile,
});

function VendorProfile() {
  const { session } = useAuth();
  const vendor = useStore((s) => s.vendors.find((v) => v.id === session?.userId));
  const dealer = session ? dealerFromVendor(session.userId) : undefined;

  const [ownerName, setOwnerName] = useState(vendor?.ownerName ?? "");
  const [email, setEmail] = useState(vendor?.email ?? "");
  const [about, setAbout] = useState(
    `${dealer?.name ?? "Our dealership"} has been serving ${dealer?.city ?? "the city"} since ${dealer?.since ?? "2015"}. We specialise in premium tyres and alloy wheels for all major Indian and imported vehicles.`,
  );

  if (!dealer) return <p className="text-sm text-muted-foreground">Register first to edit profile.</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Business profile updated");
      }}
      className="grid gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Business profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label>Business name</Label><Input value={dealer.name} readOnly /></div>
        <div className="grid gap-1.5"><Label>Owner name</Label><Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Phone</Label><Input value={dealer.phone} readOnly /></div>
        <div className="grid gap-1.5"><Label>City</Label><Input value={dealer.city} readOnly /></div>
        <div className="grid gap-1.5"><Label>Pincode</Label><Input value={dealer.pincode} readOnly /></div>
      </div>
      <div className="grid gap-1.5"><Label>Address</Label><Input value={dealer.address} readOnly /></div>
      <div className="grid gap-1.5"><Label>Working hours</Label><Input value={dealer.hoursText} readOnly /></div>
      <div className="grid gap-1.5"><Label>About</Label><Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} /></div>

      <Button type="submit" className="justify-self-start rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
        Save changes
      </Button>
    </form>
  );
}
