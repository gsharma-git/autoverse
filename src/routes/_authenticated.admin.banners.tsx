import { createFileRoute } from "@tanstack/react-router";
import { useStore, toggleBanner } from "@/data/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const banners = useStore((s) => s.banners);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Homepage banners</h2>
      <div className="mt-6 space-y-3">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="font-semibold">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.subtitle}</p>
            </div>
            <button
              onClick={() => toggleBanner(b.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest",
                b.active ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {b.active ? "Active" : "Off"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
