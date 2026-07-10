import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createVendorProduct, deleteVendorProduct, useStore } from "@/data/store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vendor/products")({
  component: VendorProducts,
});

function VendorProducts() {
  const { session } = useAuth();
  const products = useStore((s) =>
    s.vendorProducts.filter((p) => p.vendorId === session?.userId),
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"tyre" | "alloy">("tyre");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !size) return toast.error("Name and size are required");
    setBusy(true);
    try {
      await createVendorProduct({
        name, brand, size, price: Number(price) || 0, category,
      });
      toast.success("Product submitted for approval");
      setOpen(false);
      setName(""); setBrand(""); setSize(""); setPrice("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add product");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteVendorProduct(id);
      toast.success("Product removed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Product catalogue</h2>
          <p className="text-xs text-muted-foreground">
            Add tyres and alloys to your listing. Each new product is reviewed by an admin before going live.
          </p>
        </div>
        <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ Add product"}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Brand"><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></Field>
          <Field label="Size (e.g. 205/55 R16 or 17 inch)"><Input value={size} onChange={(e) => setSize(e.target.value)} required /></Field>
          <Field label="Price (INR)"><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
          <Field label="Category">
            <Select value={category} onValueChange={(v) => setCategory(v as "tyre" | "alloy")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tyre">Tyre</SelectItem>
                <SelectItem value="alloy">Alloy</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={busy} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              {busy ? "Saving…" : "Submit for approval"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-3 font-semibold">{p.name}</td>
                <td className="py-3 pr-3 capitalize">{p.category}</td>
                <td className="py-3 pr-3">{p.size}</td>
                <td className="py-3 pr-3">{formatINR(p.price)}</td>
                <td className="py-3 pr-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    p.status === "approved" ? "bg-brand text-brand-foreground" :
                    p.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground",
                  )}>{p.status}</span>
                </td>
                <td className="py-3">
                  <button onClick={() => remove(p.id)} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No products yet — add your first one to get listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
