import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getTenantIdFromRequest } from "@/lib/tenant";
import type { OrderStatus } from "@/lib/db/types";

type ExternalOrderStatus = "confirm" | "cancelled" | "manual";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
  });
}

function mapExternalToInternalStatus(status: ExternalOrderStatus): OrderStatus {
  switch (status) {
    case "confirm":
      return "processing";
    case "cancelled":
      return "returned_fake";
    case "manual":
      return "pending_verification";
    default:
      return "pending_verification";
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { order_id, status, reason, timestamp, source } = body as {
    order_id?: string;
    status?: string;
    reason?: string;
    timestamp?: string;
    source?: string;
  };

  if (!order_id || !status) {
    return jsonResponse({ error: "order_id and status are required" }, 400);
  }

  const normalizedStatus = status.toLowerCase() as ExternalOrderStatus;
  if (!["confirm", "cancelled", "manual"].includes(normalizedStatus)) {
    return jsonResponse(
      {
        error: "Unsupported status",
        allowed_statuses: ["confirm", "cancelled", "manual"],
      },
      400
    );
  }

  const tenantId = await getTenantIdFromRequest();
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,product_id,order_status")
    .eq("tenant_id", tenantId)
    .eq("id", order_id)
    .maybeSingle();

  if (orderError) {
    return jsonResponse({ error: orderError.message }, 400);
  }

  if (!order) {
    return jsonResponse({ error: "Order not found" }, 404);
  }

  const internalStatus = mapExternalToInternalStatus(normalizedStatus);

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ order_status: internalStatus })
    .eq("tenant_id", tenantId)
    .eq("id", order_id);

  if (updateOrderError) {
    return jsonResponse({ error: updateOrderError.message }, 400);
  }

  if (normalizedStatus === "confirm") {
    await supabase
      .from("products")
      .update({ status: "sold", reserved_by: null, reserved_until: null })
      .eq("tenant_id", tenantId)
      .eq("id", order.product_id);
  }

  if (normalizedStatus === "cancelled") {
    await supabase
      .from("products")
      .update({ status: "available", reserved_by: null, reserved_until: null })
      .eq("tenant_id", tenantId)
      .eq("id", order.product_id);
  }

  revalidatePath("/shop");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");

  return jsonResponse({
    ok: true,
    order_id,
    external_status: normalizedStatus,
    internal_status: internalStatus,
    accepted_at: new Date().toISOString(),
    metadata: {
      reason: reason || null,
      timestamp: timestamp || null,
      source: source || null,
    },
  });
}
