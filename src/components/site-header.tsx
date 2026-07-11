import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/tyres", label: "Find Tyres" },
  { to: "/alloys", label: "Alloy Gallery" },
  { to: "/dealers", label: "Verified Dealers" },
  { to: "/services", label: "Services" },
  { to: "/membership", label: "Membership" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const currentUser = useCurrentUser();

  const dashboardHref =
    session?.role === "admin"
      ? "/admin"
      : session?.role === "vendor"
        ? "/vendor"
        : "/account";

  const displayName =
    currentUser && "name" in currentUser
      ? currentUser.name
      : currentUser && "ownerName" in currentUser
        ? currentUser.ownerName
        : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-sm bg-brand text-brand-foreground">
              <span className="block size-3 rounded-full border-2 border-brand-foreground" />
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
              Auto<span className="text-brand">Verse</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-brand"
              activeProps={{ className: "text-brand" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                to={dashboardHref}
                className="hidden items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
              >
                <User className="size-4" />
                {displayName?.split(" ")[0] ?? "Dashboard"}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="hidden sm:inline-flex"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-95 sm:inline-flex"
            >
              <LogIn className="size-4" />
              Sign in
            </Link>
          )}

          <button
            onClick={() => setOpen((s) => !s)}
            className="grid size-10 place-items-center rounded-md border border-border text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
              activeProps={{ className: "text-brand bg-secondary" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            {session ? (
              <div className="flex flex-col gap-2">
                <Link
                  to={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
                >
                  Open dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="rounded-md border border-border px-3 py-2 text-sm font-semibold"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
