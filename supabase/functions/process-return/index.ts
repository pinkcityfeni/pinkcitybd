import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReturnItemReq {
  product_id: string;
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Auth + role check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roles } = await admin
      .from("user_roles").select("role").eq("user_id", user.id);
    const isStaff = (roles || []).some((r: any) => r.role === "admin" || r.role === "cashier");
    if (!isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { order_id, items, refund_method, reason } = body as {
      order_id: string;
      items: ReturnItemReq[];
      refund_method?: string;
      reason?: string;
    };

    if (!order_id || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "order_id and items are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load order
    const { data: order, error: oErr } = await admin
      .from("orders").select("*").eq("id", order_id).maybeSingle();
    if (oErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.status === "cancelled") {
      return new Response(JSON.stringify({ error: "Order already cancelled" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems: any[] = (order.items as any[]) || [];
    const alreadyReturned: { product_id: string; quantity: number }[] =
      ((order.returned_items as any[]) || []).map((r: any) => ({
        product_id: r.product_id, quantity: Number(r.quantity || 0),
      }));

    // Build return list with names+prices, validate quantities
    const returnItems: { product_id: string; name: string; price: number; quantity: number }[] = [];
    let refundTotal = 0;
    for (const ri of items) {
      const qty = Math.floor(Number(ri.quantity || 0));
      if (qty <= 0) continue;
      const orderItem = orderItems.find((oi: any) => oi.product?.id === ri.product_id);
      if (!orderItem) {
        return new Response(JSON.stringify({ error: `Item not in order: ${ri.product_id}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sold = Number(orderItem.quantity || 0);
      const prevReturned = alreadyReturned.find(a => a.product_id === ri.product_id)?.quantity || 0;
      if (qty + prevReturned > sold) {
        return new Response(JSON.stringify({
          error: `Cannot return ${qty} of ${orderItem.product?.name}. Max allowed: ${sold - prevReturned}`,
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const price = Number(orderItem.product?.price || 0);
      refundTotal += price * qty;
      returnItems.push({
        product_id: ri.product_id,
        name: orderItem.product?.name || "",
        price,
        quantity: qty,
      });
    }

    if (returnItems.length === 0) {
      return new Response(JSON.stringify({ error: "No items to return" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compute proportional points revert
    const pointsEarned = Number(order.points_earned || 0);
    const orderTotal = Number(order.total || 0);
    let pointsRevert = 0;
    if (pointsEarned > 0 && orderTotal > 0) {
      pointsRevert = Math.round((pointsEarned * refundTotal) / orderTotal);
    }

    // Insert return record
    const { data: ret, error: rErr } = await admin.from("pos_returns").insert({
      order_id,
      items: returnItems,
      total_refund: refundTotal,
      refund_method: refund_method || "cash",
      reason: reason || "",
      points_reverted: pointsRevert,
      processed_by: user.id,
    }).select("*").single();
    if (rErr) throw rErr;

    // Restore stock for each returned item
    for (const ri of returnItems) {
      const { data: prod } = await admin
        .from("products").select("stock").eq("id", ri.product_id).maybeSingle();
      if (prod) {
        await admin.from("products")
          .update({ stock: (prod.stock || 0) + ri.quantity })
          .eq("id", ri.product_id);
      }
    }

    // Update order returned_items + status
    const newReturned = [...alreadyReturned];
    for (const ri of returnItems) {
      const idx = newReturned.findIndex(a => a.product_id === ri.product_id);
      if (idx >= 0) newReturned[idx].quantity += ri.quantity;
      else newReturned.push({ product_id: ri.product_id, quantity: ri.quantity });
    }
    // Determine if fully returned
    const fullyReturned = orderItems.every((oi: any) => {
      const r = newReturned.find(a => a.product_id === oi.product?.id)?.quantity || 0;
      return r >= Number(oi.quantity || 0);
    });
    const newStatus = fullyReturned ? "cancelled" : "returned";
    await admin.from("orders").update({
      returned_items: newReturned,
      status: newStatus,
    }).eq("id", order_id);

    // Revert points
    if (pointsRevert > 0 && order.customer_phone_normalized) {
      const { data: cp } = await admin
        .from("customer_points").select("*")
        .eq("phone", order.customer_phone_normalized).maybeSingle();
      if (cp) {
        const newPoints = Math.max(0, (cp.points || 0) - pointsRevert);
        const newEarned = Math.max(0, (cp.total_earned || 0) - pointsRevert);
        await admin.from("customer_points").update({
          points: newPoints, total_earned: newEarned,
        }).eq("id", cp.id);
        await admin.from("point_transactions").insert({
          customer_id: cp.id, order_id, type: "adjust",
          points: -pointsRevert, note: "Return refund",
        });
      }
    }

    return new Response(JSON.stringify({
      id: ret.id,
      total_refund: refundTotal,
      points_reverted: pointsRevert,
      status: newStatus,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("process-return error:", err);
    return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});