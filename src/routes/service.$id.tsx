import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { fetchServiceById, fetchDealersForService } from "@/lib/queries";
import { DealerCard } from "@/components/dealer-card";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "@/components/enquiry-dialog";

export const Route = createFileRoute("/service/$id")({
  loader: async ({ params }) => {
    const [service, offeringDealers] = await Promise.all([
      fetchServiceById(params.id),
      fetchDealersForService(params.id),
    ]);
    if (!service) throw notFound();
    return { service, offeringDealers };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.service.name} · AutoVerse` },
          { name: "description", content: loaderData.service.description },
          { property: "og:title", content: `${loaderData.service.name} · AutoVerse` },
          { property: "og:description", content: loaderData.service.description },
        ]
      : [{ title: "Service · AutoVerse" }, { name: "robots", content: "noindex" }],
  }),
  component: ServiceDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold italic uppercase">Service not found</h1>
      <Button asChild variant="ghost" className="mt-6">
        <Link to="/services"><ArrowLeft className="size-4" /> Back to services</Link>
      </Button>
    </div>
  ),
});

function ServiceDetail() {
  const { service, offeringDealers } = Route.useLoaderData() as Awaited<ReturnType<typeof Route.options.loader>>;
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <div>
      <section className="border-b border-border bg-steel py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/services" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand">
            <ArrowLeft className="size-3" /> All services
          </Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
                <ShieldCheck className="size-3" /> Offered by {offeringDealers.length} verified dealers
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold italic uppercase leading-tight tracking-tight md:text-5xl">
                {service.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{service.description}</p>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand">
                {service.priceFromText}
              </p>
            </div>
            <Button size="lg" onClick={() => setEnquiryOpen(true)} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              Send enquiry
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
          Applicable vehicles
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {service.applicableVehicles.map((v) => (
            <span key={v} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
              {v}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold italic uppercase tracking-tight">
          Dealers offering this service
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {offeringDealers.map((d) => (
            <DealerCard key={d.id} dealer={d} />
          ))}
        </div>
      </section>

      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} service={service} />
    </div>
  );
}
