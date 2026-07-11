import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/queries";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "In-shop Services · AutoVerse" },
      { name: "description", content: "Wheel alignment, balancing, puncture repair, nitrogen filling and more — offered by verified dealers near you." },
      { property: "og:title", content: "Auto Services · AutoVerse" },
      { property: "og:description", content: "Every service is enquiry-first: connect with a nearby dealer in one tap." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
          In-shop services
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold italic uppercase tracking-tight md:text-5xl">
          More than just tyres
        </h1>
        <p className="mt-3 text-muted-foreground">
          Ten essential automotive services offered across our verified dealer network. Every service
          is enquiry-first — no online bookings, just a fast route to the right expert nearby.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link
            key={s.id}
            to="/service/$id"
            params={{ id: s.id }}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">{s.name}</h2>
              <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                {s.priceFromText}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
   