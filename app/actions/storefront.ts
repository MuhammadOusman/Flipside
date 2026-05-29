"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@/lib/db/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getTenantIdFromRequest } from "@/lib/tenant";

async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("cart_session_id")?.value;
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  cookieStore.set("cart_session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return sessionId;
}

export async function reserveProductAction(productId: string) {
  const tenantId = await getTenantIdFromRequest();
  const sessionId = await getOrCreateSessionId();
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.rpc("reserve_product", {
    p_tenant_id: tenantId,
    p_product_id: productId,
    p_session_id: sessionId,
    p_minutes: 10,
  });

  if (error || !data || data.length === 0 || !data[0].success) {
    return {
      ok: false,
      message: data?.[0]?.message || error?.message || "Could not reserve product",
      reservedUntil: data?.[0]?.reserved_until || null,
    };
  }

  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");

  return {
    ok: true,
    message: "Reserved successfully",
    reservedUntil: data[0].reserved_until as string,
  };
}

export async function releaseProductReservationAction(productId: string) {
  const tenantId = await getTenantIdFromRequest();
  const sessionId = await getOrCreateSessionId();
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.rpc("cancel_reservation", {
    p_tenant_id: tenantId,
    p_product_id: productId,
    p_session_id: sessionId,
  });

  const result = Array.isArray(data) ? data[0] : data;

  if (error || !result || !result.success) {
    return {
      ok: false,
      message: result?.message || error?.message || "Could not release reservation",
    };
  }

  revalidatePath("/shop");
  return { ok: true };
}

type PlaceOrderPayload = {
  productId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  receiptImageUrl?: string;
};

export type OrderCompletionResponse = {
  order_id: string;
  customer: {
    name: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
  };
  order: {
    name: string;
    size: string;
    qty: number;
    price: number;
  };
  customer_history: {
    prior_orders: number;
    prior_rto: number;
  };
};

async function sendOrderWebhook(payload: OrderCompletionResponse) {
  const webhookUrl = process.env.THIRD_PARTY_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.THIRD_PARTY_WEBHOOK_SECRET) {
    headers["Authorization"] = `Bearer ${process.env.THIRD_PARTY_WEBHOOK_SECRET}`;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        `Order webhook failed: ${res.status} ${res.statusText} for ${webhookUrl}`
      );
    }
  } catch (error) {
    console.error("Order webhook delivery error:", error);
  }
}

export async function createOrderCompletionPayload(
  payload: PlaceOrderPayload
): Promise<
  | { ok: false; message: string; code?: string }
  | { ok: true; orderId: string; response: OrderCompletionResponse }
> {
  const tenantId = await getTenantIdFromRequest();
  const sessionId = await getOrCreateSessionId();
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.rpc("place_order", {
    p_tenant_id: tenantId,
    p_session_id: sessionId,
    p_product_id: payload.productId,
    p_customer_name: payload.customerName,
    p_phone: payload.phone,
    p_address: payload.address,
    p_city: payload.city,
    p_payment_method: payload.paymentMethod,
    p_receipt_image_url: payload.receiptImageUrl || null,
  });

  const result = Array.isArray(data) ? data[0] : data;

  if (error || !result || !result.success) {
    const code = result?.code || error?.code;
    const message = result?.message || error?.message || "Failed to create order";

    return {
      ok: false,
      code,
      message,
    };
  }

  const response: OrderCompletionResponse = {
    order_id: result.order_id,
    customer: {
      name: payload.customerName,
      phone: payload.phone,
    },
    shipping: {
      address: payload.address,
      city: payload.city,
    },
    order: {
      name: `${result.product_brand || ""} ${result.product_model || ""}`.trim(),
      size: result.product_size || "",
      qty: 1,
      price: Number(result.product_price || 0),
    },
    customer_history: {
      prior_orders: result.prior_orders ?? 0,
      prior_rto: result.prior_rto ?? 0,
    },
  };

  await sendOrderWebhook(response);

  return {
    ok: true,
    orderId: result.order_id,
    response,
  };
}

export async function placeOrderAction(payload: PlaceOrderPayload) {
  const result = await createOrderCompletionPayload(payload);
  if (!result.ok) {
    return result;
  }

  revalidatePath("/shop");
  revalidatePath("/admin/orders");

  return { ok: true, orderId: result.orderId };
}
