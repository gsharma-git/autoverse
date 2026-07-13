import { supabase } from "@/integrations/supabase/client";

export interface VendorRegistrationInput {
  userId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  pincode: string;
}

/**
 * Upserts a vendor registration record with status "pending".
 * A DB trigger (notify_admins_of_new_vendor) handles admin notifications automatically.
 */
export async function registerVendor(input: VendorRegistrationInput): Promise<void> {
  const { error } = await supabase.from("vendors").upsert({
    id: input.userId,
    business_name: input.businessName,
    owner_name: input.ownerName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    pincode: input.pincode,
    status: "pending",
  });
  if (error) throw error;
}
