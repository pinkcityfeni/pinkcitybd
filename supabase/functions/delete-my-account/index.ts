import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Self-service account + personal data deletion (GDPR-style right to erasure).
// The calling user can only delete THEIR OWN account. Admins cannot use this
// endpoint to delete other users — use `delete-user` for that.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller by JWT — never trust a client-supplied userId.
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await caller.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Scrub personal data from orders while keeping accounting rows.
    // Orders retain totals & items for business records but PII is removed.
    await admin.from("orders")
      .update({
        user_id: null,
        customer_name: "Deleted user",
        customer_email: null,
        customer_phone: null,
        customer_phone_normalized: null,
        delivery_address: null,
      })
      .eq("user_id", user.id);

    // Detach loyalty points from user id (keep aggregate row anonymized).
    await admin.from("customer_points")
      .update({ user_id: null, name: "Deleted user" })
      .eq("user_id", user.id);

    // profiles + user_roles cascade-delete via FK on auth.users(id).
    // Deleting the auth user removes credentials, sessions, and refresh tokens.
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    return json({ success: true });
  } catch (err: any) {
    console.error("delete-my-account error:", err?.message ? String(err.message).slice(0, 200) : "unknown");
    return json({ error: "Request failed. Please try again." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}