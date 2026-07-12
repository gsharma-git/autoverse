/**
 * notify-enquiry
 * Called via Supabase Database Webhook (or direct invoke from client) when a
 * new enquiry row is inserted.
 *
 * Sends two emails via Resend:
 *   1. Vendor alert — notifies the dealer of the new enquiry
 *   2. Customer confirmation — reassures the customer their enquiry was sent
 *
 * Required env vars (Supabase dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY         — your Resend.com API key
 *   SITE_URL               — e.g. https://autoverse.in
 *
 * FROM address uses onboarding@resend.dev until a custom domain is verified
 * in Resend. Once domain is verified, update FROM_EMAIL below.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://autoverse.in";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Update to "AutoVerse <notifications@yourdomain.com>" once domain is verified in Resend
const FROM_EMAIL = "AutoVerse <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error("Resend error:", err);
  }
}

serve(async (req) => {
  try {
    const body = await req.json();
    const enquiry = body.record ?? body;

    if (!enquiry?.dealer_id) {
      return new Response(JSON.stringify({ skipped: "no dealer_id" }), { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch dealer
    const { data: dealer } = await supabase
      .from("dealers")
      .select("name, city")
      .eq("id", enquiry.dealer_id)
      .maybeSingle();

    // Fetch vendor email
    const { data: vendor } = await supabase
      .from("vendors")
      .select("email, owner_name")
      .eq("dealer_id", enquiry.dealer_id)
      .maybeSingle();

    // Fetch product or service name
    let productName = "Service enquiry";
    if (enquiry.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", enquiry.product_id)
        .maybeSingle();
      if (product?.name) productName = product.name;
    } else if (enquiry.service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", enquiry.service_id)
        .maybeSingle();
      if (service?.name) productName = service.name;
    }

    const dealerName = dealer?.name ?? "the dealership";
    const promises: Promise<void>[] = [];

    // ── 1. Vendor alert ───────────────────────────────────────────────────────
    if (vendor?.email) {
      const vendorHtml = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#111827;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#FF5F1F;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">AutoVerse</p>
            <h1 style="color:#fff;font-size:22px;margin:8px 0 0">New enquiry received</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px">
            <p style="color:#6b7280;font-size:14px">Hi ${vendor.owner_name ?? "there"},</p>
            <p style="color:#111827;font-size:14px">
              A customer has sent an enquiry for <strong>${productName}</strong> at
              <strong>${dealerName}</strong>.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:120px">Customer</td><td style="color:#111827;font-weight:600">${enquiry.customer_name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="color:#111827;font-weight:600">${enquiry.customer_phone}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Pincode</td><td style="color:#111827">${enquiry.customer_pincode ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Message</td><td style="color:#111827">${enquiry.message}</td></tr>
            </table>
            <a href="${SITE_URL}/vendor/enquiries" style="display:inline-block;background:#FF5F1F;color:#fff;font-weight:700;font-size:13px;padding:12px 24px;border-radius:999px;text-decoration:none">
              View in dashboard →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              You're receiving this because you're a verified dealer on AutoVerse.
            </p>
          </div>
        </div>
      `;
      promises.push(
        sendEmail(
          vendor.email,
          `New enquiry: ${productName} — ${enquiry.customer_name}`,
          vendorHtml,
        )
      );
    }

    // ── 2. Customer confirmation ──────────────────────────────────────────────
    if (enquiry.customer_email) {
      const customerHtml = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#111827;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#FF5F1F;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">AutoVerse</p>
            <h1 style="color:#fff;font-size:22px;margin:8px 0 0">Enquiry sent!</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px">
            <p style="color:#6b7280;font-size:14px">Hi ${enquiry.customer_name},</p>
            <p style="color:#111827;font-size:14px">
              Your enquiry for <strong>${productName}</strong> has been sent to
              <strong>${dealerName}</strong>. They'll call or WhatsApp you back shortly.
            </p>
            <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:20px 0;font-size:13px;color:#374151">
              <p style="margin:0 0 6px;font-weight:700">Your enquiry summary</p>
              <p style="margin:0">Item: ${productName}</p>
              <p style="margin:4px 0 0">Dealer: ${dealerName}${dealer?.city ? `, ${dealer.city}` : ""}</p>
            </div>
            <a href="${SITE_URL}/account/enquiries" style="display:inline-block;background:#FF5F1F;color:#fff;font-weight:700;font-size:13px;padding:12px 24px;border-radius:999px;text-decoration:none">
              Track your enquiries →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              AutoVerse — India's trusted tyre &amp; alloy marketplace.
            </p>
          </div>
        </div>
      `;
      promises.push(
        sendEmail(
          enquiry.customer_email,
          `Your enquiry for ${productName} has been sent`,
          customerHtml,
        )
      );
    }

    await Promise.all(promises);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-enquiry error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
