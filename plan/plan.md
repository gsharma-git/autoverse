
## Overview

"My Tyres & Alloys" is a search-and-connect marketplace (not e-commerce) linking Indian customers with verified local tyre/alloy dealers. Customers search → discover nearby dealers → compare → enquire via Call/WhatsApp/form → sale closes offline.

We'll build the full three-sided MVP (Customer, Vendor, Admin) as a frontend app with mock/demo data in TypeScript modules. No real auth, database, or payments — role selection via a simulated "login" that stores the current user in local state so all three panels are explorable. This proves out every screen described in the proposal, and can later be wired to Lovable Cloud without changing the UI.

Design direction: **Industrial Precision** (selected). Space Grotesk display + Inter body, ink black `#111827`, steel grey `#F3F4F6`, white base with an orange brand accent `#FF5F1F` as the automotive punch on top of the black/white core. Rounded 2xl cards, soft shadows, italic uppercase display type, prominent multi-field search.

## Phased build (all delivered in this project)

Because the surface is large, we ship it in three phases within the same codebase. Every phase is fully clickable end-to-end.

### Phase 1 — Design system + Customer public site
- Design tokens in `src/styles.css`: ink/steel/brand palette in oklch, Space Grotesk + Inter loaded via `<link>` in `__root.tsx`, rounded-2xl radius scale, soft shadow tokens.
- Root shell: sticky top nav (Find Tyres / Alloy Gallery / Verified Dealers / Services / Membership / About / Contact) + Dealer Login button, footer with stats strip.
- Public routes: `/` (landing per selected prototype), `/tyres` and `/alloys` (product listing with filters + sort), `/product/$id` (detail with gallery, specs, compatible vehicles, nearby dealers list), `/dealers` (nearby dealer directory with city/pincode filter), `/dealer/$id` (dealer storefront: profile, catalogue, ratings, services), `/services` (services catalogue: alignment, balancing, puncture repair, nitrogen, rotation, installation, cleaning), `/service/$id` (service detail), `/membership` (public plan comparison Free/Silver/Gold/Diamond), `/about`, `/contact`, `/login` (role picker: Customer / Vendor / Admin).
- Global enquiry modal: fields per proposal (name, phone, city/pincode, product/service, message). Call and WhatsApp buttons as primary CTAs everywhere.
- Mock data modules in `src/data/`: `brands.ts`, `products.ts` (tyres + alloys with size, price, rating, images, dealer stock), `dealers.ts` (verified dealers with city/pincode/geo, ratings, catalogue, services, hours), `services.ts`, `membershipPlans.ts`, `enquiries.ts` (seeded), `notifications.ts`.
- Search + filter logic (in-memory): vehicle, brand, size, city, pincode, price range, distance, rating, availability, colour, wheel size; sort by relevance, price, rating, distance.

### Phase 2 — Customer dashboard + Vendor panel
- Simulated auth: `useAuth` context stores `{ role, userId }` in localStorage. `_authenticated` layout gates dashboards. Login page lets you pick a seeded customer, vendor, or admin identity (no passwords — demo data).
- Customer routes under `/_authenticated/account/`: dashboard summary, `enquiries` (history + status), `favourites/products`, `favourites/dealers`, `notifications`, `profile` (vehicle, location, contact).
- Vendor routes under `/_authenticated/vendor/`: registration wizard (business details, docs, location — front-end only, marks as "pending verification"), dashboard (enquiry count, product performance stats, membership status), profile management, product management (CRUD against mock store), service management, enquiries inbox, membership management (upgrade/downgrade with plan cards).

### Phase 3 — Admin panel
- Admin routes under `/_authenticated/admin/`: dashboard (KPIs), vendor management (approve/reject verification, suspend), product moderation, enquiry management (routing + resolution status), banner management (homepage banners), CMS (About/policies/help static content editor), reports (mock exports as CSV download), settings (locations, notification templates, roles).

## Technical details

- **Stack**: TanStack Start (existing template), TanStack Router file-based routes, TanStack Query for in-memory data fetching against the mock store (mirrors the future Cloud shape), Tailwind v4, shadcn/ui components already installed.
- **State**: Auth + role in localStorage; product/enquiry/favourite mutations use TanStack Query with an in-memory mock "backend" (`src/data/store.ts` exposing async `getProducts`, `createEnquiry`, etc.) so a Lovable Cloud swap later is drop-in.
- **Routing**: dot-flat filenames, `_authenticated` layout for gated areas, `_authenticated/vendor/` and `_authenticated/admin/` nested pathless layouts for role-scoped subtrees. Each public route sets its own `head()` (title, description, og:title, og:description).
- **Design system**: extend `src/styles.css` `@theme inline` with `--color-brand`, `--color-ink`, `--color-steel`, `--font-display`, `--font-sans`. Do NOT hardcode Tailwind color classes in components — semantic tokens only.
- **Placeholder images**: generate hero, tyre, alloy, and dealer storefront photos via `imagegen` at build time, saved under `src/assets/`.
- **Mobile-first**: every route responsive; primary Call/WhatsApp CTAs remain thumb-reachable on mobile.

## Explicit non-goals (per your answers)

- No real database / Lovable Cloud — mock data only.
- No real authentication — demo role picker.
- No payment integrations, WhatsApp Business API, SMS/OTP wiring — those are external services listed as "additional charges" in the proposal and are placeholder CTAs here.
- No live geolocation — city/pincode text filter simulates "nearby".

## Deliverable at the end

A fully clickable multi-vendor marketplace prototype covering every module in sections 03–09 of the proposal, ready for stakeholder review and easy to upgrade to real backend later.
