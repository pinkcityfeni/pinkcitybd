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
        console.log("Authenticated user:", userId);
      } catch (e) {
        console.log("Auth check failed (continuing as guest):", e);
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
      0,
    );
    const deliveryCharge = Number(data?.deliveryCharge || 0);
    const discountValue = Number(data?.discount || 0);
    const discountAmount = discountValue
      ? data?.discountType === "percent"
        ? Math.round((subtotal * discountValue) / 100)
        : discountValue
      : 0;
    const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;

    const orderItems = items.map((item: any) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price || 0),
        buyingPrice: Number(item.product.buyingPrice || 0),
        barcode: item.product.barcode || "",
        image: item.product.image || "",
      },
      quantity: Number(item.quantity || 0),
    }));

    console.log("Inserting order, total:", total);

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
      delivery_charge: deliveryCharge,
      payment_method: data?.paymentMethod || null,
      payment_status: data?.paymentStatus || (data?.paymentMethod === "cod" ? "pending" : "paid"),
      split_payment: data?.splitPayment || null,
      discount: discountValue,
      discount_type: data?.discountType || null,
    };

    const { data: orderRow, error: orderError } = await adminClient
      .from("orders")
      .insert(insertPayload)
      .select("id, total")
      .single();

    if (orderError) {
      console.error("Order insert error:", JSON.stringify(orderError));
      throw orderError;
    }

    console.log("Order created:", orderRow.id);

    // Update stock
    for (const item of items) {
      const { data: productRow } = await adminClient
        .from("products")
        .select("stock")
        .eq("id", item.product.id)
        .maybeSingle();

      if (productRow) {
        const nextStock = Math.max(0, Number(productRow.stock || 0) - Number(item.quantity || 0));
        await adminClient
          .from("products")
          .update({ stock: nextStock })
          .eq("id", item.product.id);
      }
    }

    return new Response(JSON.stringify({ id: orderRow.id, total: Number(orderRow.total) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("place-order error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Order failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
