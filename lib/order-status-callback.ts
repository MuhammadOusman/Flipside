export type ExternalOrderStatus = "confirm" | "cancelled" | "manual";

export type OrderStatusCallbackPayload = {
  orderId: string;
  status: ExternalOrderStatus;
  reason?: string | null;
  timestamp?: string;
  source?: string;
};

export async function sendOrderStatusCallback(payload: OrderStatusCallbackPayload) {
  const callbackUrl = process.env.ORDER_STATUS_CALLBACK_URL;
  if (!callbackUrl) {
    return { ok: false, skipped: true, message: "ORDER_STATUS_CALLBACK_URL is not configured" };
  }

  const body = {
    order_id: payload.orderId,
    status: payload.status,
    reason: payload.reason || null,
    timestamp: payload.timestamp || new Date().toISOString(),
    source: payload.source || "flipside_backend",
  };

  try {
    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const responseText = await res.text().catch(() => "");
      return {
        ok: false,
        skipped: false,
        status: res.status,
        message: responseText || res.statusText || "Callback request failed",
      };
    }

    return { ok: true, skipped: false };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      message: error instanceof Error ? error.message : "Callback request failed",
    };
  }
}
