import { cookies, headers } from "next/headers";
import type { TenantDomainResolution } from "@/lib/db/types";

const DEFAULT_TENANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "00000000-0000-0000-0000-000000000001";

function parseTenantDomainMap(host: string): TenantDomainResolution | null {
  const raw = process.env.TENANT_DOMAIN_MAP;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, TenantDomainResolution>;
    return parsed[host] || null;
  } catch {
    return null;
  }
}

export async function resolveTenantFromHost(host: string): Promise<TenantDomainResolution> {
  const sanitized = host.split(":")[0].toLowerCase();

  const fromMap = parseTenantDomainMap(sanitized);
  if (fromMap) {
    return fromMap;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anon) {
    const endpoint = `${url}/rest/v1/tenant_domains?select=tenant_id,domain,tenants(theme,logo_url)&domain=eq.${encodeURIComponent(
      sanitized
    )}&limit=1`;

    try {
      const res = await fetch(endpoint, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const rows = (await res.json()) as Array<{
          tenant_id: string;
          tenants?: { theme?: string; logo_url?: string };
        }>;
        if (rows.length > 0) {
          return {
            tenantId: rows[0].tenant_id,
            theme: rows[0].tenants?.theme,
            logoUrl: rows[0].tenants?.logo_url,
          };
        }
      }
    } catch {
      // Fall through to default tenant.
    }
  }

  return { tenantId: DEFAULT_TENANT_ID };
}

export async function getTenantIdFromRequest() {
  const headerStore = await headers();
  const cookieStore = await cookies();

  return (
    headerStore.get("x-tenant-id") ||
    cookieStore.get("tenant_id")?.value ||
    DEFAULT_TENANT_ID
  );
}
