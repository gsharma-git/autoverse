import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { markNotificationRead, useStore } from "@/data/store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account/notifications")({
  component: Notifications,
});

function Notifications() {
  const { session } = useAuth();
  const notifications = useStore((s) => s.notifications);
  const items = notifications.filter((n) => n.userId === session?.userId);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">Notifications</h2>
      <div className="mt-4 space-y-2">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-colors",
              n.read ? "border-border bg-background" : "border-brand/40 bg-brand/5",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{n.title}</p>
              <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
          </button>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>}
      </div>
    </div>
  );
}
