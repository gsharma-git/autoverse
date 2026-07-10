import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · My Tyres & Alloys" },
      { name: "description", content: "India's enquiry-first tyre and alloy marketplace. We connect customers with verified local dealers." },
      { property: "og:title", content: "About · My Tyres & Alloys" },
      { property: "og:description", content: "Built to give verified dealers better visibility and customers a faster route to the right shop." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-steel py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Our story</p>
          <h1 className="mt-3 font-display text-4xl font-bold italic uppercase tracking-tight md:text-6xl">
            Built for the road, not the checkout.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            My Tyres &amp; Alloys is India&apos;s enquiry-first marketplace for tyres and alloy wheels.
            Instead of pushing you through an online checkout that ignores fitment, stock and local
            expertise, we hand you a shortlist of verified dealers within minutes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">Why we built this</h2>
          <p className="mt-3 text-muted-foreground">
            Tyres are a considered purchase — the right fit depends on the car, the driving style, and
            the dealer&apos;s hands-on advice. Alloys are just as personal. Yet the buying experience in
            India today is either dealer-hopping or generic classifieds.
          </p>
          <p className="mt-3 text-muted-foreground">
            We built a platform that respects both sides. Customers get a fast, transparent way to
            compare products and reach a verified dealer nearby. Dealers get a reliable stream of
            qualified enquiries and a proper storefront online — without commissions on offline sales.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified dealers", body: "Every dealer profile is manually vetted before it goes live." },
            { icon: MapPin, title: "Location-first", body: "We surface nearby dealers on every search, not just a filter." },
            { icon: Handshake, title: "Offline sales", body: "The deal closes at the shop, so the dealer keeps the margin." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border p-6">
              <f.icon className="size-6 text-brand" />
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-ink p-10 text-background">
          <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
            Are you a tyre or alloy dealer?
          </h2>
          <p className="mt-2 text-background/70">
            Join 2,500+ verified partners across India. Free to start, upgrade as you grow.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/vendor/register">List your business</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-background/30 bg-transparent text-background hover:bg-background/10">
              <Link to="/membership">Compare plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
