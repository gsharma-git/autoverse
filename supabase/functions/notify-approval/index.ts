/**
 * notify-approval
 * Called via Supabase Database Webhook when a vendor's `status` column
 * changes to "verified".  Sends a welcome email to the vendor.
 *
 * Required env vars:
 *   RESEND_API_KEY  — your Resend.com API key
 *   SITE_URL        — e.g. https://autoverse.in
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://autoverse.in";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Update to "AutoVerse <notifications@yourdomain.com>" once domain is verified in Resend
const FROM_EMAIL = "AutoVerse <onboarding@resend.dev>";

serve(async (req) => {
  try {
    const body = await req.json();

    // DB webhook shape: { type: "UPDATE", record: new_row, old_record: old_row }
    const record = body.record ?? body;
    const oldRecord = body.old_record ?? {};

    // Only fire when transitioning TO "verified"
    if (record.status !== "verified" || oldRecord.status === "verified") {
      return new Response(JSON.stringify({ skipped: "not a new verification" }), { status: 200 });
    }

    if (!record.email) {
      return new Response(JSON.stringify({ skipped: "no vendor email" }), { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch dealer name
    let dealerName = "your dealership";
    if (record.dealer_id) {
      const { data: dealer } = await supabase
        .from("dealers")
        .select("name")
        .eq("id", record.dealer_id)
        .maybeSingle();
      if (dealer?.name) dealerName = dealer.name;
    }

    const ownerName = record.owner_name ?? "there";

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#111827;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#FF5F1F;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">AutoVerse</p>
          <h1 style="color:#fff;font-size:22px;margin:8px 0 0">You're live on AutoVerse! 🎉</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px">
          <p style="color:#6b7280;font-size:14px">Hi ${ownerName},</p>
          <p style="color:#111827;font-size:14px">
            Great news — <strong>${dealerName}</strong> has been verified and is now live on AutoVerse.
            Customers can discover your dealership and send you enquiries right away.
          </p>

          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0">
            <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 12px">Next steps to stand out:</p>
            <ul style="color:#374151;font-size:13px;margin:0;padding-left:20px;line-height:1.8">
              <li>Upload high-quality product photos</li>
              <li>Set competitive pricing on your listings</li>
              <li>Add your full product catalogue</li>
              <li>Consider upgrading to Gold or Diamond for priority placement</li>
            </ul>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <a href="${SITE_URL}/vendor" style="display:inline-block;background:#FF5F1F;color:#fff;font-weight:700;font-size:13px;padding:12px 24px;border-radius:999px;text-decoration:none">
              Go to dashboard →
            </a>
            <a href="${SITE_URL}/vendor/membership" style="display:inline-block;background:#f3f4f6;color:#111827;font-weight:700;font-size:13px;padding:12px 24px;border-radius:999px;text-decoration:none">
              Upgrade membership
            </a>
          </div>

          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Welcome to AutoVerse — India's trusted tyre &amp; alloy marketplace.<br>
            Questions? Reply to this email or write to <a href="mailto:hello@autoverse.in" style="color:#9ca3af">hello@autoverse.in</a>
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
        from: FROM_EMAIL,
        to: [record.email],
        subject: `${dealerName} is now live on AutoVerse`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-approval error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
