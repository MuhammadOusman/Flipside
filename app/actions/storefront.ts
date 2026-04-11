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

  const { error } = await supabase
    .from("products")
    .update({ status: "available", reserved_until: null, reserved_by: null })
    .eq("tenant_id", tenantId)
    .eq("id", productId)
    .eq("reserved_by", sessionId)
    .eq("status", "reserved");

  if (error) {
    return { ok: false, message: error.message };
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

export async function placeOrderAction(payload: PlaceOrderPayload) {
  const tenantId = await getTenantIdFromRequest();
  const sessionId = await getOrCreateSessionId();
  const supabase = getSupabaseAdminClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("is_blacklisted,total_orders")
    .eq("tenant_id", tenantId)
    .eq("phone", payload.phone)
    .maybeSingle();

  if (payload.paymentMethod === "cod_with_advance" && customer?.is_blacklisted) {
    return {
      ok: false,
      code: "BLACKLISTED_COD",
      message: "Your account is restricted from COD. Please select Full Bank Transfer.",
    };
  }

  const { data: product, error: productErr } = await supabase
    .from("products")
    .select("id,status,reserved_by,reserved_until")
    .eq("tenant_id", tenantId)
    .eq("id", payload.productId)
    .single();

  if (productErr || !product) {
    return { ok: false, message: "Product not found" };
  }

  const reservedByOther =
    product.status === "reserved" &&
    product.reserved_until &&
    new Date(product.reserved_until).getTime() > Date.now() &&
    product.reserved_by !== sessionId;

  if (reservedByOther || product.status === "sold") {
    return {
      ok: false,
      message: "This pair is no longer available. Please pick another item.",
    };
  }

  const { error: customerUpsertError } = await supabase.from("customers").upsert(
    {
      tenant_id: tenantId,
      phone: payload.phone,
      total_orders: (customer?.total_orders || 0) + 1,
      is_blacklisted: customer?.is_blacklisted || false,
    },
    {
      onConflict: "tenant_id,phone",
    }
  );

  if (customerUpsertError) {
    return { ok: false, message: customerUpsertError.message };
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      tenant_id: tenantId,
      customer_name: payload.customerName,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      product_id: payload.productId,
      payment_method: payload.paymentMethod,
      advance_paid: false,
      receipt_image_url: payload.receiptImageUrl || null,
      order_status: "pending_verification",
    })
    .select("id")
    .single();

  if (orderErr) {
    return { ok: false, message: orderErr.message };
  }

  await supabase
    .from("products")
    .update({ status: "reserved", reserved_by: sessionId, reserved_until: null })
    .eq("tenant_id", tenantId)
    .eq("id", payload.productId);

  revalidatePath("/shop");
  revalidatePath("/admin/orders");

  return { ok: true, orderId: order.id };
}
