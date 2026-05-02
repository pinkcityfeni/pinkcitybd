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
    const { code, items, customerPhone, userId } = await req.json();
    if (!code || !Array.isArray(items) || items.length === 0) {
      return json({ valid: false, error: "Code and items required" }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, key);

    const codeUp = String(code).trim().toUpperCase();
    const { data: v, error } = await admin
      .from("vouchers")
      .select("*")
      .eq("code", codeUp)
      .maybeSingle();

    if (error) return json({ valid: false, error: error.message }, 500);
    if (!v) return json({ valid: false, error: "ভাউচার কোড সঠিক নয়" });
    if (!v.active) return json({ valid: false, error: "ভাউচারটি বর্তমানে নিষ্ক্রিয়" });

    const now = new Date();
    if (now < new Date(v.start_at)) return json({ valid: false, error: "ভাউচার এখনো শুরু হয়নি" });
    if (now > new Date(v.expire_at)) return json({ valid: false, error: "ভাউচারের মেয়াদ শেষ" });

    // Scope match
    const cart: CartLine[] = items;
    let eligibleSubtotal = 0;
    if (v.scope_type === "product") {
      const matches = cart.filter(c => c.product_id === v.scope_product_id);
      if (matches.length === 0) return json({ valid: false, error: "এই প্রোডাক্ট কার্টে নেই" });
      eligibleSubtotal = matches.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    } else {
      const cat = String(v.scope_category || "").toLowerCase();
      const matches = cart.filter(c => String(c.category || "").toLowerCase() === cat);
      if (matches.length === 0) return json({ valid: false, error: "এই ক্যাটাগরির প্রোডাক্ট কার্টে নেই" });
      eligibleSubtotal = matches.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    }

    const cartTotal = cart.reduce((s, c) => s + Number(c.price) * Number(c.quantity), 0);
    if (Number(v.min_order_amount) > 0 && cartTotal < Number(v.min_order_amount)) {
      return json({ valid: false, error: `সর্বনিম্ন অর্ডার ৳${Number(v.min_order_amount)} প্রয়োজন` });
    }

    // Per-customer redemption count
    const phoneNorm = normalizePhone(customerPhone);
    if (phoneNorm || userId) {
      let q = admin.from("voucher_redemptions").select("id", { count: "exact", head: true }).eq("voucher_id", v.id);
      if (phoneNorm) q = q.eq("customer_phone_normalized", phoneNorm);
      else q = q.eq("user_id", userId);
      const { count } = await q;
      if ((count || 0) >= Number(v.per_customer_limit)) {
        return json({ valid: false, error: "আপনি এই ভাউচার ইতিমধ্যে ব্যবহার করেছেন" });
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
    return json({ valid: false, error: e?.message || "Validation failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}