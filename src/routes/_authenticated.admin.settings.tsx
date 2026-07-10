import { createFileRoute } from "@tanstack/react-router";
import { resetStore } from "@/data/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Platform settings</h3>
        <div className="mt-4 space-y-3 text-sm">
          <SettingRow label="Serviceable cities" value="120" />
          <SettingRow label="Enquiry SLA" value="30 minutes" />
          <SettingRow label="Verification window" value="48 hours" />
          <SettingRow label="Default currency" value="INR (₹)" />
        </div>
      </div>
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight text-destructive">Danger zone</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Reset all demo data (enquiries, notifications, vendors) back to seed state.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => {
            resetStore();
            toast.success("Demo data reset");
          }}
        >
          Reset demo data
        </Button>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
