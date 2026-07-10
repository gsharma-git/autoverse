import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createVendorService, deleteVendorService, useStore } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vendor/services")({
  component: VendorServices,
});

function VendorServices() {
  const { session } = useAuth();
  const services = useStore((s) =>
    s.vendorServices.filter((v) => v.vendorId === session?.userId),
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceFromText, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return toast.error("Service name is required");
    setBusy(true);
    try {
      await createVendorService({ name, description, priceFromText });
      toast.success("Service submitted for approval");
      setOpen(false);
      setName(""); setDescription(""); setPrice("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try { await deleteVendorService(id); toast.success("Removed"); }
    catch (err: any) { toast.error(err.message ?? "Failed"); }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Services offered</h2>
          <p className="text-xs text-muted-foreground">
            Add services your shop offers. Each entry is reviewed by an admin before being published.
          </p>
        </div>
        <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ Add service"}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-border bg-background p-4">
          <Field label="Service name"><Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Wheel alignment" /></Field>
          <Field label="Description"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <Field label="Starting price"><Input value={priceFromText} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. ₹499 onwards" /></Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              {busy ? "Saving…" : "Submit for approval"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
            <div>
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.priceFromText || "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                s.status === "approved" ? "bg-brand text-brand-foreground" :
                s.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground",
              )}>{s.status}</span>
              <button onClick={() => remove(s.id)} className="text-[10px] font-semibold text-destructive hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No services yet.</p>
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
