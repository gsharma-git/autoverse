import { supabase } from "@/integrations/supabase/client";

/** Attempts to claim the first-admin role. Returns true if successful, false if an admin already exists. */
export async function claimFirstAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("claim_first_admin");
  if (error) throw error;
  return data as boolean;
}
