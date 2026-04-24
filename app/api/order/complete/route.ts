import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createOrderCompletionPayload } from "@/app/actions/storefront";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const {
    productId,
    customerName,
    phone,
    address,
    city,
    paymentMethod,
    receiptImageUrl,
  } = body as {
    productId?: string;
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
    paymentMethod?: string;
    receiptImageUrl?: string;
  };

  if (!productId || !customerName || !phone || !address || !city || !paymentMethod) {
    return jsonResponse(
      { error: "Missing required order fields" },
      400
    );
  }

  const result = await createOrderCompletionPayload({
    productId,
    customerName,
    phone,
    address,
    city,
    paymentMethod: paymentMethod as any,
    receiptImageUrl,
  });

  if (!result.ok) {
    let message = result.message || "Failed to place order";

    if (
      result.code === "ORDER_FAILED" &&
      /(violates row-level security|violates unique constraint|foreign key constraint)/i.test(message)
    ) {
      message =
        "We could not place your order because the item is no longer available. Please choose another pair.";
    }

    return jsonResponse(
      { error: message, code: result.code ?? "ORDER_FAILED" },
      400
    );
  }

  revalidatePath("/shop");
  revalidatePath("/admin/orders");

  return jsonResponse(result.response);
}
