import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProductListing } from "@/components/product-listing";

const searchSchema = z.object({
  pincode: z.string().optional(),
  vehicle: z.string().optional(),
  size: z.string().optional(),
});

export const Route = createFileRoute("/tyres")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Tyres — Compare & Enquire · My Tyres & Alloys" },
      {
        name: "description",
        content:
          "Compare tyres by brand, vehicle, size, price and rating. See stock at verified dealers near your pincode.",
      },
      { property: "og:title", content: "Find tyres near you · My Tyres & Alloys" },
      { property: "og:description", content: "Verified dealer stock across India. Enquiry-first, no online checkout." },
    ],
  }),
  component: TyresPage,
});

function TyresPage() {
  const search = Route.useSearch();
  return (
    <ProductListing
      category="tyre"
      initialPincode={search.pincode}
      initialVehicle={search.vehicle}
      initialSize={search.size}
    />
  );
}
