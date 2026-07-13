import { supabase } from "@/integrations/supabase/client";

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  role: "customer" | "vendor";
  phone: string;
  vehicle: string;
  pincode: string;
}

export async function signUp(input: SignUpInput) {
  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        name: input.name,
        role: input.role,
        phone: input.phone,
        vehicle: input.vehicle,
        pincode: input.pincode,
      },
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
