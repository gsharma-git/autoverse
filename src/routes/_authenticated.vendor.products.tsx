import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  createVendorProduct,
  deleteVendorProduct,
  updateVendorProduct,
  uploadVendorImage,
  useStore,
  type VendorProduct,
} from "@/data/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Info, Pencil, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/products")({
  component: VendorProducts,
});

type FormState = {
  name: string;
  brand: string;
  size: string;
  price: string;
  category: "tyre" | "alloy";
  image: string | null;
};

const emptyForm: FormState = {
  name: "", brand: "", size: "", price: "", category: "tyre", image: null,
};

function VendorProducts() {
  const { session } = useAuth();
  const products = useStore((s) =>
    s.vendorProducts.filter((p) => p.vendorId === session?.userId),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(p: VendorProduct) {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand,
      size: p.size,
      price: String(p.price),
      category: p.category,
      image: p.image,
    });
    setDialogOpen(true);
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadVendorImage(file);
      setForm((f) => ({ ...f, image: url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.size) {
      toast.error("Name and size are required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        size: form.size,
        price: Number(form.price) || 0,
        category: form.category,
        image: form.image,
      };
      if (editing) {
        await updateVendorProduct(editing.id, payload);
        toast.success("Product updated — re-submitted for approval");
      } else {
        await createVendorProduct(payload);
        toast.success("Product submitted for approval");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save product");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteVendorProduct(deleteId);
      toast.success("Product removed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Product catalogue</h2>
          <p className="text-xs text-muted-foreground">
            Manage your tyre and alloy listings. New and edited products go through admin review before appearing publicly.
          </p>
        </div>
        <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={openCreate}>
          + Add product
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <span>Products are reviewed by admin before going live. Editing an approved product will send it back to pending.</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2 pr-3">Image</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Brand</th>
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted-foreground">
                      No img
                    </div>
                  )}
                </td>
                <td className="py-3 pr-3 font-semibold">{p.name}</td>
                <td className="py-3 pr-3 capitalize">{p.category}</td>
                <td className="py-3 pr-3">{p.brand || "—"}</td>
                <td className="py-3 pr-3">{p.size}</td>
                <td className="py-3 pr-3">{formatINR(p.price)}</td>
                <td className="py-3 pr-3"><StatusBadge status={p.status} /></td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No products yet — add your first one to get listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              {editing ? "Changes will be re-reviewed by admin." : "This product will be reviewed before going live."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as "tyre" | "alloy" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tyre">Tyre</SelectItem>
                  <SelectItem value="alloy">Alloy</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand">
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Size">
              <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required placeholder="205/55 R16" />
            </Field>
            <Field label="Price (Rs.)">
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Image" className="sm:col-span-2">
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="preview" className="h-16 w-16 rounded-lg object-cover" />}
                <label className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold",
                  uploading && "opacity-50",
                )}>
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : form.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                </label>
                {form.image && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => setForm({ ...form, image: null })}
                  >
                    Remove
                  </button>
                )}
              </div>
            </Field>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy || uploading} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                {busy ? "Saving..." : editing ? "Save changes" : "Submit for approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product from your catalogue. This action cannot be undone.
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

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full border font-bold uppercase tracking-widest text-[10px]", map[status])}>
      {status}
    </Badge>
  );
}
