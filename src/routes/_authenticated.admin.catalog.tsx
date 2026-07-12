import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatINR } from "@/lib/format";
import { ImageUpload } from "@/components/image-upload";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  component: AdminCatalog,
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface CatalogBrand {
  id: string;
  name: string;
  category: "tyre" | "alloy";
}

interface CatalogService {
  id: string;
  name: string;
  slug: string;
  description: string;
  applicable_vehicles: string[];
  icon: string;
  price_from_text: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: "tyre" | "alloy";
  brand_id: string;
  price: number;
  size: string;
  tagline: string;
  featured: boolean;
  trending: boolean;
  images: string[];
}

interface CatalogDealer {
  id: string;
  name: string;
  slug: string;
  city: string;
  pincode: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours_text: string;
  logo_initials: string;
  storefront_image?: string;
  membership: "free" | "silver" | "gold" | "diamond";
  rating: number;
  since: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Root component ────────────────────────────────────────────────────────────

function AdminCatalog() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Catalog management</h2>
        <p className="text-xs text-muted-foreground">
          Manage seeded brands, services, products and dealers.
        </p>
      </div>
      <Tabs defaultValue="brands">
        <TabsList className="mb-6">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
        </TabsList>
        <TabsContent value="brands"><BrandsTab /></TabsContent>
        <TabsContent value="services"><ServicesTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="dealers"><DealersTab /></TabsContent>
      </Tabs>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRANDS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function BrandsTab() {
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<CatalogBrand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogBrand | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("brands").select("*").order("name");
    if (error) toast.error(error.message);
    else setBrands(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(brand: CatalogBrand) {
    const { error } = await supabase.from("brands").delete().eq("id", brand.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${brand.name}" deleted`);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Search brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 size-3.5" /> Add brand
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{b.id}</td>
                  <td className="py-3 pr-3 font-semibold">{b.name}</td>
                  <td className="py-3 pr-3 capitalize">{b.category}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditTarget(b)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => setDeleteTarget(b)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add dialog */}
      <BrandDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => { setShowAdd(false); load(); }}
      />

      {/* Edit dialog */}
      {editTarget && (
        <BrandDialog
          open
          brand={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete brand?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted. Products referencing this brand will lose their brand link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrandDialog({
  open,
  brand,
  onClose,
  onSaved,
}: {
  open: boolean;
  brand?: CatalogBrand;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(brand?.name ?? "");
  const [category, setCategory] = useState<"tyre" | "alloy">(brand?.category ?? "tyre");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(brand?.name ?? "");
    setCategory(brand?.category ?? "tyre");
  }, [brand, open]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    if (brand) {
      const { error } = await supabase.from("brands").update({ name: name.trim(), category }).eq("id", brand.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const id = slugify(name.trim());
      const { error } = await supabase.from("brands").insert({ id, name: name.trim(), category });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(brand ? "Brand updated" : "Brand added");
    setSaving(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? "Edit brand" : "Add brand"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MRF" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as "tyre" | "alloy")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tyre">Tyre</SelectItem>
                <SelectItem value="alloy">Alloy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ServicesTab() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<CatalogService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogService | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (error) toast.error(error.message);
    else setServices(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(svc: CatalogService) {
    const { error } = await supabase.from("services").delete().eq("id", svc.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${svc.name}" deleted`);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Search services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 size-3.5" /> Add service
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Icon</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Price from</th>
                <th className="py-2 pr-3">Vehicles</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 pr-3 text-lg">{s.icon}</td>
                  <td className="py-3 pr-3 font-semibold">{s.name}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{s.price_from_text || "—"}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">
                    {(s.applicable_vehicles ?? []).join(", ") || "—"}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditTarget(s)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ServiceDialog open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />
      {editTarget && (
        <ServiceDialog open service={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted. Dealers linked to this service will lose the association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceDialog({
  open,
  service,
  onClose,
  onSaved,
}: {
  open: boolean;
  service?: CatalogService;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "🔧");
  const [priceFromText, setPriceFromText] = useState(service?.price_from_text ?? "");
  const [vehicles, setVehicles] = useState((service?.applicable_vehicles ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(service?.name ?? "");
    setDescription(service?.description ?? "");
    setIcon(service?.icon ?? "🔧");
    setPriceFromText(service?.price_from_text ?? "");
    setVehicles((service?.applicable_vehicles ?? []).join(", "));
  }, [service, open]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: service?.slug ?? slugify(name.trim()),
      description: description.trim(),
      icon: icon.trim() || "🔧",
      price_from_text: priceFromText.trim(),
      applicable_vehicles: vehicles.split(",").map((v) => v.trim()).filter(Boolean),
    };
    if (service) {
      const { error } = await supabase.from("services").update(payload).eq("id", service.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const id = slugify(name.trim());
      const { error } = await supabase.from("services").insert({ id, ...payload });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(service ? "Service updated" : "Service added");
    setSaving(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Car Washing" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Icon</label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🔧" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Price from text</label>
            <Input value={priceFromText} onChange={(e) => setPriceFromText(e.target.value)} placeholder="e.g. ₹299 onwards" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Applicable vehicles (comma-separated)</label>
            <Input value={vehicles} onChange={(e) => setVehicles(e.target.value)} placeholder="Car, SUV, Bike" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ProductsTab() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<CatalogProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogProduct | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const [pRes, bRes] = await Promise.all([
      supabase.from("products").select("id,name,slug,category,brand_id,price,size,tagline,featured,trending,images").order("name"),
      supabase.from("brands").select("*").order("name"),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    else setProducts(pRes.data ?? []);
    if (bRes.error) toast.error(bRes.error.message);
    else setBrands(bRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  function brandName(id: string) {
    return brands.find((b) => b.id === id)?.name ?? id;
  }

  async function handleDelete(p: CatalogProduct) {
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${p.name}" deleted`);
    setDeleteTarget(null);
    load();
  }

  async function toggleFlag(p: CatalogProduct, flag: "featured" | "trending") {
    const { error } = await supabase.from("products").update({ [flag]: !p[flag] }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, [flag]: !p[flag] } : x));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 size-3.5" /> Add product
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Image</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Cat.</th>
                <th className="py-2 pr-3">Brand</th>
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3 text-center">Featured</th>
                <th className="py-2 pr-3 text-center">Trending</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="size-10 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                    )}
                  </td>
                  <td className="py-3 pr-3 font-semibold">{p.name}</td>
                  <td className="py-3 pr-3 capitalize text-xs">{p.category}</td>
                  <td className="py-3 pr-3 text-xs">{brandName(p.brand_id)}</td>
                  <td className="py-3 pr-3 text-xs">{p.size}</td>
                  <td className="py-3 pr-3 text-xs">{formatINR(p.price)}</td>
                  <td className="py-3 pr-3 text-center">
                    <button
                      onClick={() => toggleFlag(p, "featured")}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.featured ? "bg-amber-100 text-amber-800" : "bg-secondary text-muted-foreground"}`}
                    >
                      {p.featured ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <button
                      onClick={() => toggleFlag(p, "trending")}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.trending ? "bg-blue-100 text-blue-800" : "bg-secondary text-muted-foreground"}`}
                    >
                      {p.trending ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditTarget(p)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductDialog open={showAdd} brands={brands} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />
      {editTarget && (
        <ProductDialog open brands={brands} product={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted, including all dealer associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductDialog({
  open,
  product,
  brands,
  onClose,
  onSaved,
}: {
  open: boolean;
  product?: CatalogProduct;
  brands: CatalogBrand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<"tyre" | "alloy">(product?.category ?? "tyre");
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [trending, setTrending] = useState(product?.trending ?? false);
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(product?.name ?? "");
    setCategory(product?.category ?? "tyre");
    setBrandId(product?.brand_id ?? "");
    setSize(product?.size ?? "");
    setPrice(String(product?.price ?? ""));
    setTagline(product?.tagline ?? "");
    setFeatured(product?.featured ?? false);
    setTrending(product?.trending ?? false);
    setImageUrl(product?.images?.[0] ?? "");
  }, [product, open]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!brandId) { toast.error("Brand is required"); return; }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { toast.error("Enter a valid price"); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: product?.slug ?? slugify(name.trim()),
      category,
      brand_id: brandId,
      size: size.trim(),
      price: priceNum,
      tagline: tagline.trim(),
      featured,
      trending,
      images: imageUrl ? [imageUrl] : (product?.images ?? []),
    };
    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const id = slugify(name.trim());
      const { error } = await supabase.from("products").insert({ id, ...payload });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(product ? "Product updated" : "Product added");
    setSaving(false);
    onSaved();
  }

  const filteredBrands = brands.filter((b) => b.category === category);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Product image</label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="products"
              label="Upload product photo"
              className="h-36 w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MRF ZLX 185/65 R15" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <Select value={category} onValueChange={(v) => { setCategory(v as "tyre" | "alloy"); setBrandId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tyre">Tyre</SelectItem>
                  <SelectItem value="alloy">Alloy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Brand</label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {filteredBrands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Size</label>
              <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 185/65 R15" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Price (₹)</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 3500" type="number" min={0} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Tagline</label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short selling line" />
          </div>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-4 rounded" />
              Featured
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="size-4 rounded" />
              Trending
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEALERS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function DealersTab() {
  const [dealers, setDealers] = useState<CatalogDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<CatalogDealer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogDealer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("dealers")
      .select("id,name,slug,city,pincode,address,phone,whatsapp,hours_text,logo_initials,storefront_image,membership,rating,since")
      .order("name");
    if (error) toast.error(error.message);
    else setDealers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = dealers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase()) ||
    d.pincode.includes(search)
  );

  async function handleDelete(dealer: CatalogDealer) {
    const { error } = await supabase.from("dealers").delete().eq("id", dealer.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${dealer.name}" deleted`);
    setDeleteTarget(null);
    load();
  }

  const membershipColor: Record<string, string> = {
    free: "bg-secondary text-muted-foreground",
    silver: "bg-slate-100 text-slate-700",
    gold: "bg-amber-100 text-amber-700",
    diamond: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Search dealers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 size-3.5" /> Add dealer
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Photo</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">City</th>
                <th className="py-2 pr-3">Pincode</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Membership</th>
                <th className="py-2 pr-3">Rating</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 pr-3">
                    {d.storefront_image ? (
                      <img src={d.storefront_image} alt={d.name} className="size-10 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="size-10 rounded-lg bg-ink text-background flex items-center justify-center text-xs font-bold">
                        {d.logo_initials || d.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{d.id}</div>
                  </td>
                  <td className="py-3 pr-3 text-xs">{d.city}</td>
                  <td className="py-3 pr-3 text-xs">{d.pincode}</td>
                  <td className="py-3 pr-3 text-xs">{d.phone}</td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${membershipColor[d.membership] ?? ""}`}>
                      {d.membership}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs">{d.rating}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditTarget(d)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => setDeleteTarget(d)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No dealers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <DealerDialog open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />
      {editTarget && (
        <DealerDialog open dealer={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dealer?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted, including all enquiries, service and product associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DealerDialog({
  open,
  dealer,
  onClose,
  onSaved,
}: {
  open: boolean;
  dealer?: CatalogDealer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(dealer?.name ?? "");
  const [city, setCity] = useState(dealer?.city ?? "");
  const [pincode, setPincode] = useState(dealer?.pincode ?? "");
  const [address, setAddress] = useState(dealer?.address ?? "");
  const [phone, setPhone] = useState(dealer?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(dealer?.whatsapp ?? "");
  const [hoursText, setHoursText] = useState(dealer?.hours_text ?? "");
  const [logoInitials, setLogoInitials] = useState(dealer?.logo_initials ?? "");
  const [membership, setMembership] = useState<CatalogDealer["membership"]>(dealer?.membership ?? "free");
  const [since, setSince] = useState(String(dealer?.since ?? new Date().getFullYear()));
  const [storefrontImage, setStorefrontImage] = useState(dealer?.storefront_image ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(dealer?.name ?? "");
    setCity(dealer?.city ?? "");
    setPincode(dealer?.pincode ?? "");
    setAddress(dealer?.address ?? "");
    setPhone(dealer?.phone ?? "");
    setWhatsapp(dealer?.whatsapp ?? "");
    setHoursText(dealer?.hours_text ?? "");
    setLogoInitials(dealer?.logo_initials ?? "");
    setMembership(dealer?.membership ?? "free");
    setSince(String(dealer?.since ?? new Date().getFullYear()));
    setStorefrontImage(dealer?.storefront_image ?? "");
  }, [dealer, open]);

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!city.trim()) { toast.error("City is required"); return; }
    if (!pincode.trim()) { toast.error("Pincode is required"); return; }
    const sinceYear = parseInt(since, 10);
    if (isNaN(sinceYear)) { toast.error("Enter a valid year"); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: dealer?.slug ?? slugify(name.trim()),
      city: city.trim(),
      pincode: pincode.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      hours_text: hoursText.trim(),
      logo_initials: logoInitials.trim() || name.trim().slice(0, 2).toUpperCase(),
      storefront_image: storefrontImage || null,
      membership,
      since: sinceYear,
    };
    if (dealer) {
      const { error } = await supabase.from("dealers").update(payload).eq("id", dealer.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const id = slugify(name.trim());
      const { error } = await supabase.from("dealers").insert({ id, ...payload });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success(dealer ? "Dealer updated" : "Dealer added");
    setSaving(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dealer ? "Edit dealer" : "Add dealer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Storefront photo</label>
            <ImageUpload
              value={storefrontImage}
              onChange={setStorefrontImage}
              folder="dealers"
              label="Upload storefront photo"
              className="h-36 w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Shop name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Delhi Tyres & Alloys" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Delhi" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Pincode</label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="110001" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">WhatsApp</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98xxx xxxxx" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Hours</label>
            <Input value={hoursText} onChange={(e) => setHoursText(e.target.value)} placeholder="Mon–Sat 9am–7pm" />
          </div>
          <div className="grid grid-cols-[1fr_80px_120px] gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Membership</label>
              <Select value={membership} onValueChange={(v) => setMembership(v as CatalogDealer["membership"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Since</label>
              <Input value={since} onChange={(e) => setSince(e.target.value)} placeholder="2010" type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Logo initials</label>
              <Input value={logoInitials} onChange={(e) => setLogoInitials(e.target.value)} placeholder="DT" maxLength={3} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
