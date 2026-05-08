import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartLine {
  product_id: string;
  category?: string;
  price: number;
  quantity: number;
}

function normalizePhone(p?: string) {
  return (p || "").toString().replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { code, items, customerPhone } = await req.json();
    if (!code || !Array.isArray(items) || items.length === 0) {
      return json({ valid: false, error: "Code and items required" }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, key);

    // Derive userId from JWT only — never trust client-supplied userId
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const callerClient = createClient(url, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await callerClient.auth.getUser();
        userId = user?.id ?? null;
      } catch (_) { /* anonymous */ }
    }

    const codeUp = String(code).trim().toUpperCase();
    const { data: v, error } = await admin
      .from("vouchers")
      .select("*")
      .eq("code", codeUp)
      .maybeSingle();

    if (error) {
      console.error("validate-voucher lookup error:", error);
      return json({ valid: false, error: "Validation failed. Please try again." }, 500);
    }
    if (!v) return json({ valid: false, error: "Invalid Voucher Code" });
    if (!v.active) return json({ valid: false, error: "Voucher is currently inactive." });

    const now = new Date();
    if (now < new Date(v.start_at)) return json({ valid: false, error: "Voucher has not started yet" });
    if (now > new Date(v.expire_at)) return json({ valid: false, error: "Voucher expired" });

    // Scope match
    const cart: CartLine[] = items;
    let eligibleSubtotal = 0;
    if (v.scope_type === "product") {
      const matches = cart.filter(c => c.product_id === v.scope_product_id);
      if (matches.length === 0) return json({ valid: false, error: "This product is not in cart" });
      eligibleSubtotal = matches.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    } else {
      const cat = String(v.scope_category || "").toLowerCase();
      const matches = cart.filter(c => String(c.category || "").toLowerCase() === cat);
      if (matches.length === 0) return json({ valid: false, error: "No products in this category in cart." });
      eligibleSubtotal = matches.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    }

    const cartTotal = cart.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    if (Number(v.min_order_amount) > 0 && cartTotal < Number(v.min_order_amount)) {
      return json({ valid: false, error: `Minimum Order ৳${Number(v.min_order_amount)} Required` });
    }

    // Per-customer redemption count — check BOTH user and phone (max), prevents fake-phone bypass
    const phoneNorm = normalizePhone(customerPhone);
    if (phoneNorm || userId) {
      const [byUser, byPhone] = await Promise.all([
        userId
          ? admin.from("voucher_redemptions").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("user_id", userId)
          : Promise.resolve({ count: 0 } as any),
        phoneNorm
          ? admin.from("voucher_redemptions").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("customer_phone_normalized", phoneNorm)
          : Promise.resolve({ count: 0 } as any),
      ]);
      const usedCount = Math.max(byUser.count || 0, byPhone.count || 0);
      if (usedCount >= Number(v.per_customer_limit)) {
        return json({ valid: false, error: "You have already used this voucher." });
      }
    }

    const discount = Math.min(Number(v.discount_amount), eligibleSubtotal);
    return json({
      valid: true,
      discountAmount: discount,
      voucherId: v.id,
      code: v.code,
    });
  } catch (e: any) {
    console.error("validate-voucher error:", e);
    return json({ valid: false, error: "Validation failed. Please try again." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}