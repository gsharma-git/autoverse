import { createFileRoute } from "@tanstack/react-router";
import { useStore, updateCms } from "@/data/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: AdminCms,
});

function AdminCms() {
  const cms = useStore((s) => s.cms);
  const [active, setActive] = useState(cms[0]?.id ?? "");
  const [body, setBody] = useState("");
  const current = cms.find((c) => c.id === active);

  useEffect(() => {
    if (current) setBody(current.body);
  }, [current?.id]);

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-3">
        {cms.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${active === c.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
          >
            {c.label}
          </button>
        ))}
      </aside>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">{current?.label}</h3>
        <Textarea rows={12} className="mt-4" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button
          className="mt-4 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => {
            if (current) updateCms(current.id, body);
            toast.success("Content saved");
          }}
        >
          Save content
        </Button>
      </div>
    </div>
  );
}
