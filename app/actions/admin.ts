"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getTenantIdFromRequest } from "@/lib/tenant";
import { sendOrderStatusCallback } from "@/lib/order-status-callback";

type NewProductPayload = {
  slug: string;
  brand: string;
  model: string;
  sizeUk: number;
  sizeEur: number;
  conditionGrade: string;
  flaws: string[];
  images: string[];
  videoUrl?: string;
  price: number;
  sourcingCost: number;
  status: "draft" | "dropping_soon" | "available" | "reserved" | "sold" | "archived";
  dropTime?: string;
};

export async function createProductAction(payload: NewProductPayload) {
  const tenantId = await getTenantIdFromRequest();
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("products").insert({
    tenant_id: tenantId,
    slug: payload.slug,
    brand: payload.brand,
    model: payload.model,
    size_uk: payload.sizeUk,
    size_eur: payload.sizeEur,
    condition_grade: payload.conditionGrade,
    flaws: payload.flaws,
    images: payload.images,
    video_url: payload.videoUrl || null,
    price: payload.price,
    sourcing_cost: payload.sourcingCost,
    status: payload.status,
    drop_time: payload.dropTime || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function approvePaymentAction(orderId: string) {
  const tenantId = await getTenantIdFromRequest();
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,product_id")
    .eq("tenant_id", tenantId)
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { ok: false, message: "Order not found" };
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ order_status: "processing", advance_paid: true })
    .eq("tenant_id", tenantId)
    .eq("id", order.id);

  if (updateErr) {
    return { ok: false, message: updateErr.message };
  }

  await supabase
    .from("products")
    .update({ status: "sold", reserved_by: null, reserved_until: null })
    .eq("tenant_id", tenantId)
    .eq("id", order.product_id);

  await sendOrderStatusCallback({
    orderId: order.id,
    status: "confirm",
    reason: "payment approved",
    source: "approvePaymentAction",
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  revalidatePath("/shop");

  return { ok: true };
}

function buildCourierPayload(input: {
  name: string;
  phone: string;
  address: string;
  city: string;
  codAmount: number;
}) {
  return {
    consignee_name: input.name,
    consignee_phone: input.phone,
    consignee_address: input.address,
    destination_city: input.city,
    cod_amount: Math.max(0, input.codAmount),
  };
}

async function sendDispatchWhatsApp(params: {
  phone: string;
  name: string;
  shoeName: string;
  courier: string;
  trackingNumber: string;
  remainingCod: number;
}) {
  const token = process.env.WHATSAPP_META_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return;
  }

  const text = `Hi ${params.name}! Your ${params.shoeName} have been dispatched via ${params.courier}. Track here: ${params.trackingNumber}. Total remaining COD is Rs. ${params.remainingCod}. Enjoy your kicks!`;

  await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.phone,
      type: "text",
      text: { body: text },
    }),
  });
}

export async function generateTrackingAction(orderId: string) {
  const tenantId = await getTenantIdFromRequest();
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*, products(brand,model,price)")
    .eq("tenant_id", tenantId)
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return { ok: false, message: "Order not found" };
  }

  const courierApi = process.env.COURIER_API_URL;
  const courierApiKey = process.env.COURIER_API_KEY;
  const courierName = process.env.COURIER_NAME || "Courier";
  let trackingNumber = `CN-${Date.now()}`;

  if (courierApi && courierApiKey) {
    try {
      const res = await fetch(courierApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${courierApiKey}`,
        },
        body: JSON.stringify(
          buildCourierPayload({
            name: order.customer_name,
            phone: order.phone,
            address: order.address,
            city: order.city,
            codAmount: Number(order.products?.price || 0),
          })
        ),
      });

      if (res.ok) {
        const body = (await res.json()) as { consignment_number?: string; cn?: string };
        trackingNumber = body.consignment_number || body.cn || trackingNumber;
      }
    } catch {
      // Use fallback consignment number.
    }
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ tracking_number: trackingNumber, order_status: "dispatched" })
    .eq("tenant_id", tenantId)
    .eq("id", orderId);

  if (updateErr) {
    return { ok: false, message: updateErr.message };
  }

  const shoeName = `${order.products?.brand || "Shoe"} ${order.products?.model || ""}`.trim();
  await sendDispatchWhatsApp({
    phone: order.phone,
    name: order.customer_name,
    shoeName,
    courier: courierName,
    trackingNumber,
    remainingCod: Number(order.products?.price || 0),
  });

  revalidatePath("/admin/orders");
  return { ok: true, trackingNumber };
}
