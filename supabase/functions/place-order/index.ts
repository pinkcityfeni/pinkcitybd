import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  type: "online" | "pos";
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      buyingPrice?: number;
      barcode?: string;
      image?: string;
    };
    quantity: number;
  }>;
  data?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryZone?: string;
    deliveryCharge?: number;
    paymentMethod?: string;
    paymentStatus?: "pending" | "paid";
    splitPayment?: Record<string, unknown>;
    discount?: number;
    discountType?: "fixed" | "percent";
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { type, items, data } = body;

    if (!type || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Type and items are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const callerClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const {
        data: { user },
      } = await callerClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
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

    const orderItems = items.map((item) => ({
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

    const { data: orderRow, error: orderError } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        items: orderItems as never,
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
        split_payment: (data?.splitPayment as never) || null,
        discount: discountValue,
        discount_type: data?.discountType || null,
      })
      .select("id,total")
      .single();

    if (orderError) throw orderError;

    for (const item of items) {
      const { data: productRow, error: productError } = await adminClient
        .from("products")
        .select("stock")
        .eq("id", item.product.id)
        .maybeSingle();

      if (productError) throw productError;
      if (!productRow) continue;

      const nextStock = Math.max(0, Number(productRow.stock || 0) - Number(item.quantity || 0));
      const { error: updateError } = await adminClient
        .from("products")
        .update({ stock: nextStock })
        .eq("id", item.product.id);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ id: orderRow.id, total: Number(orderRow.total) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Order failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
