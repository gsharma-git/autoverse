/**
 * notify-enquiry
 * Called via Supabase Database Webhook (or direct invoke from client) when a
 * new enquiry row is inserted.  Sends an email to the vendor who owns the
 * dealer that the enquiry targets.
 *
 * Required env vars (set in Supabase dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY  — your Resend.com API key
 *   SITE_URL        — e.g. https://autoverse.in
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://autoverse.in";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  try {
    const body = await req.json();

    // Support both direct invoke (body = enquiry row) and DB webhook
    // (body = { type: "INSERT", record: enquiry_row })
    const enquiry = body.record ?? body;

    if (!enquiry?.dealer_id) {
      return new Response(JSON.stringify({ skipped: "no dealer_id" }), { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch dealer + vendor email
    const { data: dealer } = await supabase
      .from("dealers")
      .select("name, city")
      .eq("id", enquiry.dealer_id)
      .maybeSingle();

    const { data: vendor } = await supabase
      .from("vendors")
      .select("email, owner_name")
      .eq("dealer_id", enquiry.dealer_id)
      .maybeSingle();

    if (!vendor?.email) {
      return new Response(JSON.stringify({ skipped: "no vendor email" }), { status: 200 });
    }

    // Fetch product name if present
    let productName = "Service enquiry";
    if (enquiry.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", enquiry.product_id)
        .maybeSingle();
      if (product?.name) productName = product.name;
    }

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#111827;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#FF5F1F;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">AutoVerse</p>
          <h1 style="color:#fff;font-size:22px;margin:8px 0 0">New enquiry received</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px">
          <p style="color:#6b7280;font-size:14px">Hi ${vendor.owner_name ?? "there"},</p>
          <p style="color:#111827;font-size:14px">
            A customer has sent an enquiry for <strong>${productName}</strong> at
            <strong>${dealer?.name ?? "your dealership"}</strong>.
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
            You're receiving this because you're a verified dealer on AutoVerse.<br>
            <a href="${SITE_URL}/vendor/profile" style="color:#9ca3af">Manage notification preferences</a>
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AutoVerse <notifications@autoverse.in>",
        to: [vendor.email],
        subject: `New enquiry: ${productName} — ${enquiry.customer_name}`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-enquiry error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
