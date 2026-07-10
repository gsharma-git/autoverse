import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerVendor } from "@/data/store";
import { useQuery } from "@tanstack/react-query";
import { fetchDealers } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/vendor/register")({
  component: VendorRegister,
});

function VendorRegister() {
  const { data: allDealers = [] } = useQuery({ queryKey: ["dealers"], queryFn: fetchDealers, staleTime: 5 * 60 * 1000 });
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [about, setAbout] = useState("");

  function next() {
    if (step === 1 && (!businessName || !ownerName)) return toast.error("Add business & owner name");
    if (step === 2 && (!email || !phone)) return toast.error("Add contact details");
    if (step === 3 && (!city || !pincode || !address)) return toast.error("Add location");
    setStep((s) => Math.min(4, s + 1));
  }

  function submit() {
    const dealer = allDealers[0];
    if (!dealer) return toast.error("No dealers available yet");
    registerVendor({ dealerId: dealer.id, ownerName, email });
    toast.success("Registration submitted", { description: "An admin will verify your business shortly." });
    setStep(4);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-1 flex-1 rounded-full ${step >= n ? "bg-brand" : "bg-secondary"}`} />
        ))}
      </div>

      <h2 className="font-display text-xl font-bold uppercase tracking-tight">
        Step {step} of 4 —{" "}
        {step === 1 ? "Business identity" : step === 2 ? "Contact" : step === 3 ? "Location" : "Verification"}
      </h2>

      <div className="mt-6 grid gap-4">
        {step === 1 && (
          <>
            <Field label="Business name"><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Supreme Tyres & Alignment" /></Field>
            <Field label="Owner name"><Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name" /></Field>
            <Field label="About your shop"><Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Brief description of your business." /></Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Business email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Business phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." /></Field>
          </>
        )}
        {step === 3 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
              <Field label="Pincode"><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></Field>
            </div>
            <Field label="Address"><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be asked to upload GST certificate and shop photos after this step (skipped in demo).
            </p>
          </>
        )}
        {step === 4 && (
          <div className="rounded-xl border border-border p-6 text-center">
            <p className="font-display text-2xl font-bold italic uppercase">Submitted</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our admin team reviews new dealers within 48 hours. You&apos;ll receive email + WhatsApp
              confirmation once your shop is live.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || step === 4}>
          Back
        </Button>
        {step < 3 && (
          <Button onClick={next} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            Continue
          </Button>
        )}
        {step === 3 && (
          <Button onClick={submit} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            Submit for verification
          </Button>
        )}
      </div>
    </div>
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
