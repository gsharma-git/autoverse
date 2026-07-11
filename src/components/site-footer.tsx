import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-sm bg-ink">
                <span className="block size-3 rounded-full border-2 border-background" />
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-tight">
                Auto<span className="text-brand">Verse</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              India&apos;s enquiry-first marketplace for tyres, alloys and local dealer connection.
            </p>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Discover
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/tyres" className="text-foreground/80 hover:text-brand">Find Tyres</Link></li>
              <li><Link to="/alloys" className="text-foreground/80 hover:text-brand">Alloy Gallery</Link></li>
              <li><Link to="/dealers" className="text-foreground/80 hover:text-brand">Verified Dealers</Link></li>
              <li><Link to="/services" className="text-foreground/80 hover:text-brand">Services</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              For dealers
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/membership" className="text-foreground/80 hover:text-brand">Membership Plans</Link></li>
              <li><Link to="/login" className="text-foreground/80 hover:text-brand">Dealer Login</Link></li>
              <li><Link to="/vendor/register" className="text-foreground/80 hover:text-brand">List your business</Link></li>
              <li><Link to="/about" className="text-foreground/80 hover:text-brand">Why AutoVerse</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Company
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-foreground/80 hover:text-brand">About</Link></li>
              <li><Link to="/contact" className="text-foreground/80 hover:text-brand">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-8">
            <div>
              <p className="font-display text-xl font-bold">45,000+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tyres Compared</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">2,500+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Verified Dealers</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">120</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Cities Covered</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AutoVerse India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
