// Usage: node --env-file=.env scripts/create-admin.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL = "admin@autoverse.in";
const PASSWORD = "Admin@1234";

const { data, error } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
});

if (error) {
  console.error("❌ Failed to create user:", error.message);
  process.exit(1);
}

console.log("✅ User created:", data.user.id);

const { error: roleError } = await supabase
  .from("user_roles")
  .insert({ user_id: data.user.id, role: "admin" });

if (roleError) {
  console.error("❌ Failed to assign role:", roleError.message);
  process.exit(1);
}

console.log("✅ Admin role assigned.");
console.log(`\nLogin with:\n  Email:    ${EMAIL}\n  Password: ${PASSWORD}`);
