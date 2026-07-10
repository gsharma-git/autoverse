import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProductListing } from "@/components/product-listing";

const searchSchema = z.object({
  pincode: z.string().optional(),
  vehicle: z.string().optional(),
  size: z.string().optional(),
});

export const Route = createFileRoute("/alloys")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Alloy Wheels — Design Gallery · My Tyres & Alloys" },
      {
        name: "description",
        content:
          "Browse premium alloy wheels — forged, cast, multi-spoke and monoblock designs from verified Indian dealers.",
      },
      { property: "og:title", content: "Premium alloy wheels · My Tyres & Alloys" },
      { property: "og:description", content: "Discover the alloy that fits your ride and connect with a nearby dealer." },
    ],
  }),
  component: AlloysPage,
});

function AlloysPage() {
  const search = Route.useSearch();
  return (
    <ProductListing
      category="alloy"
      initialPincode={search.pincode}
      initialVehicle={search.vehicle}
      initialSize={search.size}
    />
  );
}
