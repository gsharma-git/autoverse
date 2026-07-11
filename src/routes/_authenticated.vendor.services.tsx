import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  createVendorService,
  deleteVendorService,
  updateVendorService,
  useStore,
  type VendorServiceRow,
} from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Info, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./_authenticated.vendor.products";

export const Route = createFileRoute("/_authenticated/vendor/services")({
  component: VendorServices,
});

type FormState = { name: string; description: string; priceFromText: string };
const emptyForm: FormState = { name: "", description: "", priceFromText: "" };

function VendorServices() {
  const { session } = useAuth();
  const services = useStore((s) =>
    s.vendorServices.filter((v) => v.vendorId === session?.userId),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VendorServiceRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(s: VendorServiceRow) {
    setEditing(s);
    setForm({ name: s.name, description: s.description, priceFromText: s.priceFromText });
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      toast.error("Service name is required");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await updateVendorService(editing.id, form);
        toast.success("Service updated — re-submitted for approval");
      } else {
        await createVendorService(form);
        toast.success("Service submitted for approval");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteVendorService(deleteId);
      toast.success("Service removed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Services offered</h2>
          <p className="text-xs text-muted-foreground">Manage the services your shop offers.</p>
        </div>
        <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={openCreate}>
          + Add service
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <span>Services are reviewed by admin before going live. Editing an approved service will send it back to pending.</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Starting price</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="py-3 pr-3 font-semibold">{s.name}</td>
                <td className="py-3 pr-3 max-w-md text-muted-foreground">
                  <span className="line-clamp-2">{s.description || "—"}</span>
                </td>
                <td className="py-3 pr-3">{s.priceFromText || "—"}</td>
                <td className="py-3 pr-3"><StatusBadge status={s.status} /></td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(s)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">No services yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              {editing ? "Edit service" : "Add service"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Changes will be re-reviewed by admin." : "This service will be reviewed before going live."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <Field label="Service name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Wheel alignment" />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Starting price">
              <Input value={form.priceFromText} onChange={(e) => setForm({ ...form, priceFromText: e.target.value })} placeholder="e.g. From Rs. 499" />
            </Field>
            <DialogFooter>
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                {busy ? "Saving..." : editing ? "Save changes" : "Submit for approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the service from your listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
