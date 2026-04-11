import { NextResponse, type NextRequest } from "next/server";
import { resolveTenantFromHost } from "@/lib/tenant";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "localhost";
  const tenant = await resolveTenantFromHost(host);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.tenantId);
  if (tenant.theme) {
    requestHeaders.set("x-tenant-theme", String(tenant.theme));
  }
  if (tenant.logoUrl) {
    requestHeaders.set("x-tenant-logo", tenant.logoUrl);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set("tenant_id", tenant.tenantId, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (tenant.theme) {
    response.cookies.set("tenant_theme", String(tenant.theme), { path: "/" });
  }

  if (tenant.logoUrl) {
    response.cookies.set("tenant_logo", tenant.logoUrl, { path: "/" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
