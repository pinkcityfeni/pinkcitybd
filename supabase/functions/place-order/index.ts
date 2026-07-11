import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, items, data } = body;

    console.log("place-order called", JSON.stringify({ type, itemCount: items?.length }));

    if (!type || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Type and items are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (type !== "online" && type !== "pos") {
      return new Response(JSON.stringify({ error: "Invalid order type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Optionally get user id from auth header
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const callerClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await callerClient.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // continuing as guest — do not log auth details
      }
    }

    // POS orders require staff auth
    if (type === "pos") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Authentication required for POS orders" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roleRow } = await adminClient
        .from("user_roles").select("role").eq("user_id", userId);
      const roles = (roleRow || []).map((r: any) => r.role);
      if (!roles.includes("admin") && !roles.includes("cashier")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ─── Server-side price lookup (never trust client prices) ───
    const productIds: string[] = Array.from(new Set(items.map((it: any) => it?.product?.id).filter(Boolean)));
    if (productIds.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid items" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: dbProducts, error: prodErr } = await adminClient
      .from("products")
      .select("id, name, price, buying_price, category, subcategory, image, barcode")
      .in("id", productIds);
    if (prodErr) {
      console.error("place-order product lookup error:", prodErr);
      return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const productMap = new Map<string, any>((dbProducts || []).map((p: any) => [p.id, p]));
    for (const it of items) {
      if (!productMap.has(it?.product?.id)) {
        return new Response(JSON.stringify({ error: "One or more products no longer exist" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // Authoritative item shape using DB prices
    const authItems = items.map((it: any) => {
      const p = productMap.get(it.product.id);
      const qty = Math.max(0, Math.floor(Number(it.quantity || 0)));
      return { product: p, quantity: qty, price: Number(p.price || 0) };
    });
    const subtotal = authItems.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );
    const deliveryCharge = Number(data?.deliveryCharge || 0);
    const discountValue = Number(data?.discount || 0);
    const discountAmount = discountValue
      ? data?.discountType === "percent"
        ? Math.round((subtotal * discountValue) / 100)
        : discountValue
      : 0;
    // Points redeem (1 point = 1 taka) — applied like extra discount
    const requestedRedeem = Math.max(0, Math.floor(Number(data?.redeemPoints || 0)));
    const phoneRaw: string = (data?.customerPhone || "").toString().trim();
    const phoneNorm = phoneRaw.replace(/\D/g, "");

    // ─── COD Outside Feni: require advance delivery charge payment ───
    const isCODOutsideFeni =
      (data?.paymentMethod === "cod") &&
      data?.deliveryDistrict &&
      String(data?.deliveryDistrict).toLowerCase() !== "feni";
    const advanceTrxId: string = (data?.advanceTrxId || "").toString().trim();
    if (isCODOutsideFeni && !advanceTrxId) {
      return new Response(JSON.stringify({
        error: "Feni-Outside this COD For orders, first delivery charge bKash/Nagad-Sent to Transaction ID must be given।",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Voucher validation (server-side, never trust client) ───
    const voucherCodeRaw: string = (data?.voucherCode || "").toString().trim().toUpperCase();
    let voucher: any = null;
    let voucherDiscount = 0;
    if (voucherCodeRaw) {
      const { data: v } = await adminClient
        .from("vouchers")
        .select("*")
        .eq("code", voucherCodeRaw)
        .maybeSingle();
      if (!v || !v.active) {
        return new Response(JSON.stringify({ error: "Voucher code is incorrect or inactive." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const now = new Date();
      if (now < new Date(v.start_at) || now > new Date(v.expire_at)) {
        return new Response(JSON.stringify({ error: "Voucher Expired" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Scope check
      let eligibleSubtotal = 0;
      if (v.scope_type === "product") {
        const m = authItems.filter((it: any) => it.product?.id === v.scope_product_id);
        if (m.length === 0) {
          return new Response(JSON.stringify({ error: "Voucher is not applicable for this product." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        eligibleSubtotal = m.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
      } else {
        const cat = String(v.scope_category || "").toLowerCase();
        const m = authItems.filter((it: any) => String(it.product?.category || "").toLowerCase() === cat);
        if (m.length === 0) {
          return new Response(JSON.stringify({ error: "Voucher is not applicable for this category." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        eligibleSubtotal = m.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
      }
      if (Number(v.min_order_amount) > 0 && subtotal < Number(v.min_order_amount)) {
        return new Response(JSON.stringify({ error: `Minimum Order ৳${Number(v.min_order_amount)}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Per-customer limit — check BOTH user id and phone (take max) so attackers can't bypass with fake phone
      if (phoneNorm || userId) {
        const limit = Number(v.per_customer_limit);
        const [byUser, byPhone] = await Promise.all([
          userId
            ? adminClient.from("voucher_redemptions").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("user_id", userId)
            : Promise.resolve({ count: 0 } as any),
          phoneNorm
            ? adminClient.from("voucher_redemptions").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("customer_phone_normalized", phoneNorm)
            : Promise.resolve({ count: 0 } as any),
        ]);
        const usedCount = Math.max(byUser.count || 0, byPhone.count || 0);
        if (usedCount >= limit) {
          return new Response(JSON.stringify({ error: "You have already used this voucher." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      voucher = v;
      voucherDiscount = Math.min(Number(v.discount_amount), eligibleSubtotal);
    }

    // Find/load customer if we have a phone OR a logged-in user
    let customer: any = null;
    if (phoneNorm) {
      const { data: cp } = await adminClient
        .from("customer_points")
        .select("*")
        .eq("phone", phoneNorm)
        .maybeSingle();
      customer = cp;
    }
    if (!customer && userId) {
      const { data: cp } = await adminClient
        .from("customer_points")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      customer = cp;
    }

    // Validate redeem
    let redeemPoints = 0;
    if (requestedRedeem > 0) {
      if (!customer) {
        return new Response(JSON.stringify({ error: "No customer account for redeem" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (customer.points < 200) {
        return new Response(JSON.stringify({ error: "Minimum 200 points required to redeem" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      redeemPoints = Math.min(requestedRedeem, customer.points, Math.max(0, subtotal - discountAmount - voucherDiscount));
    }

    const totalAfterDiscount = Math.max(0, subtotal - discountAmount - voucherDiscount - redeemPoints);
    const total = totalAfterDiscount + deliveryCharge;

    // Earn points: 1 point per 100 taka spent (on goods value AFTER discount & redeem, excluding delivery)
    const pointsEarned = Math.floor(totalAfterDiscount / 100);

    const orderItems = authItems.map((it: any) => ({
      product: {
        id: it.product.id,
        name: it.product.name,
        price: Number(it.product.price || 0),
        barcode: it.product.barcode || "",
        image: it.product.image || "",
      },
      quantity: it.quantity,
    }));

    // Insert order — do not log PII (name/phone/address)

    const insertPayload = {
      user_id: userId,
      items: orderItems,
      total,
      status: "pending",
      type,
      customer_name: data?.customerName || (type === "pos" ? "Walk-in Customer" : "Guest"),
      customer_email: data?.customerEmail || null,
      customer_phone: data?.customerPhone || null,
      delivery_address: data?.deliveryAddress || null,
      delivery_zone: data?.deliveryZone || null,
      delivery_district: data?.deliveryDistrict || null,
      delivery_area: data?.deliveryArea || null,
      delivery_charge: deliveryCharge,
      payment_method: data?.paymentMethod || null,
      payment_status: isCODOutsideFeni
        ? "partial"
        : (data?.paymentStatus || (data?.paymentMethod === "cod" ? "pending" : "paid")),
      split_payment: data?.splitPayment || null,
      discount: discountValue,
      discount_type: data?.discountType || null,
      customer_phone_normalized: phoneNorm || null,
      points_earned: pointsEarned,
      points_redeemed: redeemPoints,
      voucher_code: voucher ? voucher.code : null,
      voucher_discount: voucherDiscount,
      advance_trx_id: advanceTrxId || null,
    };

    const { data: orderRow, error: orderError } = await adminClient
      .from("orders")
      .insert(insertPayload)
      .select("id, total")
      .single();

    if (orderError) {
      console.error("Order insert error:", JSON.stringify(orderError));
      return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Order created — id available in response

    // Record voucher redemption
    if (voucher) {
      await adminClient.from("voucher_redemptions").insert({
        voucher_id: voucher.id,
        order_id: orderRow.id,
        user_id: userId,
        customer_phone_normalized: phoneNorm || null,
        discount_applied: voucherDiscount,
      });
    }

    // Upsert customer_points row + log transactions
    if (phoneNorm || userId) {
      let cpId = customer?.id as string | undefined;
      if (!customer) {
        const { data: created, error: cpErr } = await adminClient
          .from("customer_points")
          .insert({
            user_id: userId,
            phone: phoneNorm || `user-${userId}`,
            name: data?.customerName || "",
            points: 0,
            total_earned: 0,
            total_redeemed: 0,
          })
          .select("*")
          .single();
        if (cpErr) console.error("customer_points insert error:", cpErr);
        customer = created;
        cpId = created?.id;
      } else if (userId && !customer.user_id) {
        await adminClient.from("customer_points").update({ user_id: userId }).eq("id", customer.id);
      }

      if (cpId) {
        const newBalance = (customer?.points || 0) - redeemPoints + pointsEarned;
        await adminClient.from("customer_points").update({
          points: newBalance,
          total_earned: (customer?.total_earned || 0) + pointsEarned,
          total_redeemed: (customer?.total_redeemed || 0) + redeemPoints,
        }).eq("id", cpId);

        if (redeemPoints > 0) {
          await adminClient.from("point_transactions").insert({
            customer_id: cpId, order_id: orderRow.id, type: "redeem", points: -redeemPoints,
            note: `Redeemed on order ${orderRow.id.slice(0,8)}`,
          });
        }
        if (pointsEarned > 0) {
          await adminClient.from("point_transactions").insert({
            customer_id: cpId, order_id: orderRow.id, type: "earn", points: pointsEarned,
            note: `Earned on order ${orderRow.id.slice(0,8)}`,
          });
        }
      }
    }

    // Update stock
    for (const it of authItems) {
      const { data: productRow } = await adminClient
        .from("products")
        .select("stock")
        .eq("id", it.product.id)
        .maybeSingle();

      if (productRow) {
        const nextStock = Math.max(0, Number(productRow.stock || 0) - it.quantity);
        await adminClient
          .from("products")
          .update({ stock: nextStock })
          .eq("id", it.product.id);
      }
    }

    return new Response(JSON.stringify({
      id: orderRow.id,
      total: Number(orderRow.total),
      pointsEarned,
      pointsRedeemed: redeemPoints,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("place-order error:", error?.message ? String(error.message).slice(0, 200) : "unknown");
    return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
