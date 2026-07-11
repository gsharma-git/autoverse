-- Phase 4: Email notification webhooks via Supabase Database Webhooks
-- ────────────────────────────────────────────────────────────────────
-- Supabase Database Webhooks call Edge Functions over HTTP when rows change.
-- This migration creates the webhook configurations in the supabase_functions schema.
--
-- NOTE: Database Webhooks require the pg_net extension (enabled by default on Supabase).
-- If pg_net is not available, configure the webhooks manually in the Supabase Dashboard:
--   Dashboard → Database → Webhooks → Create webhook

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── Helper function to call an Edge Function via pg_net ────────────────────
-- (Supabase Dashboard webhooks do this automatically; this is the manual SQL path)

-- Webhook: enquiries INSERT → notify-enquiry
-- Fires after every new enquiry row and POSTs the row to the Edge Function.
CREATE OR REPLACE FUNCTION notify_enquiry_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _function_url text;
  _service_key  text;
BEGIN
  -- These are injected as Vault secrets in production.
  -- For local dev, set them as ALTER DATABASE SET app.supabase_url = '...' etc.
  _function_url := current_setting('app.supabase_url', true)
                   || '/functions/v1/notify-enquiry';
  _service_key  := current_setting('app.service_role_key', true);

  -- Fire and forget — don't block the INSERT if email fails
  PERFORM net.http_post(
    url     := _function_url,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || _service_key
               ),
    body    := jsonb_build_object(
                 'type',   'INSERT',
                 'record', row_to_json(NEW)
               )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never fail the INSERT because of email
  RAISE WARNING 'notify-enquiry webhook error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger cleanly
DROP TRIGGER IF EXISTS trg_notify_enquiry ON enquiries;
CREATE TRIGGER trg_notify_enquiry
  AFTER INSERT ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_enquiry_webhook();


-- ── Webhook: vendors UPDATE status→verified → notify-approval ──────────────
CREATE OR REPLACE FUNCTION notify_approval_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _function_url text;
  _service_key  text;
BEGIN
  -- Only fire when transitioning TO verified
  IF NEW.status IS DISTINCT FROM 'verified' OR OLD.status = 'verified' THEN
    RETURN NEW;
  END IF;

  _function_url := current_setting('app.supabase_url', true)
                   || '/functions/v1/notify-approval';
  _service_key  := current_setting('app.service_role_key', true);

  PERFORM net.http_post(
    url     := _function_url,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || _service_key
               ),
    body    := jsonb_build_object(
                 'type',       'UPDATE',
                 'record',     row_to_json(NEW),
                 'old_record', row_to_json(OLD)
               )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify-approval webhook error: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_approval ON vendors;
CREATE TRIGGER trg_notify_approval
  AFTER UPDATE OF status ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION notify_approval_webhook();


-- ── Grant pg_net usage to authenticated + service roles ────────────────────
GRANT USAGE ON SCHEMA net TO service_role;
GRANT USAGE ON SCHEMA net TO authenticated;


-- ══════════════════════════════════════════════════════════════════════════════
-- ALTERNATIVE: Supabase Dashboard Webhooks (no pg_net required)
-- ──────────────────────────────────────────────────────────────────────────
-- If you prefer to use the Dashboard UI instead of this trigger approach:
--
-- 1. Dashboard → Database → Webhooks → Create webhook
--    Name:    notify-enquiry
--    Table:   enquiries
--    Events:  INSERT
--    URL:     https://vdjffnegecfuubwjyuad.supabase.co/functions/v1/notify-enquiry
--    HTTP Headers:
--      Authorization: Bearer <service_role_key>
--
-- 2. Dashboard → Database → Webhooks → Create webhook
--    Name:    notify-approval
--    Table:   vendors
--    Events:  UPDATE
--    URL:     https://vdjffnegecfuubwjyuad.supabase.co/functions/v1/notify-approval
--    HTTP Headers:
--      Authorization: Bearer <service_role_key>
--
-- The Dashboard approach is simpler and does not require pg_net or SQL triggers.
-- ══════════════════════════════════════════════════════════════════════════════
