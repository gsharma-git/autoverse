import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerVendor } from "@/services/vendor-registration";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/vendor/register")({
  component: VendorRegister,
});

function VendorRegister() {
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [about, setAbout] = useState("");

  function next() {
    if (step === 1 && (!businessName || !ownerName)) return toast.error("Add business & owner name");
    if (step === 2 && (!email || !phone)) return toast.error("Add contact details");
    if (step === 3 && (!city || !pincode || !address)) return toast.error("Add location details");
    setStep((s) => Math.min(4, s + 1));
  }

  async function submit() {
    if (!session) return;
    setLoading(true);
    try {
      await registerVendor({
        userId: session.userId,
        businessName,
        ownerName,
        email,
        phone,
        city,
        pincode,
      });

      setStep(4);
      toast.success("Registration submitted", {
        description: "An admin will verify your business within 48 hours.",
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        {step === 1 ? "Business identity" : step === 2 ? "Contact" : step === 3 ? "Location" : "Submitted"}
      </h2>

      <div className="mt-6 grid gap-4">
        {step === 1 && (
          <>
            <Field label="Business name">
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Supreme Tyres & Alignment" />
            </Field>
            <Field label="Owner name">
              <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name" />
            </Field>
            <Field label="About your shop">
              <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Brief description of your business, specialisations, years in operation." />
            </Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Business email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="business@example.com" />
            </Field>
            <Field label="Business phone">
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="WhatsApp number (optional)">
              <Input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210 (if different)" />
            </Field>
          </>
        )}
        {step === 3 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
              </Field>
              <Field label="Pincode">
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 400001" maxLength={6} />
              </Field>
            </div>
            <Field label="Full address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop no., street, area" />
            </Field>
            <p className="text-xs text-muted-foreground">
              Document upload (GST certificate, shop photos) will be available after admin approval.
            </p>
          </>
        )}
        {step === 4 && (
          <div className="rounded-xl border border-border p-6 text-center">
            <p className="font-display text-2xl font-bold italic uppercase text-brand">Application received</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our admin team reviews new dealers within 48 hours. You&apos;ll be notified once your
              profile is live on AutoVerse.
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
          <Button onClick={submit} disabled={loading} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            {loading ? "Submitting…" : "Submit for verification"}
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
