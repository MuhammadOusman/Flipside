import type { OrderRow, ProductRow, PublicProduct } from "@/lib/db/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

function isMissingProductsTableError(error: { message?: string; code?: string } | null) {
  if (!error) {
    return false;
  }

  // Supabase/PostgREST returns PGRST205 when relation is missing from schema cache.
  return (
    error.code === "PGRST205" ||
    (error.message || "").includes("Could not find the table 'public.products' in the schema cache")
  );
}

export async function getPublicProducts(tenantId: string, limit?: number) {
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("products")
    .select(
      "id,slug,brand,model,size_uk,size_eur,condition_grade,flaws,images,video_url,price,status,drop_time,reserved_until,created_at"
    )
    .eq("tenant_id", tenantId)
    .in("status", ["available", "reserved", "dropping_soon", "sold"])
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingProductsTableError(error)) {
      return [] as PublicProduct[];
    }
    throw new Error(error.message);
  }

  return (data || []) as PublicProduct[];
}

export async function getPublicProductBySlug(tenantId: string, slug: string) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,brand,model,size_uk,size_eur,condition_grade,flaws,images,video_url,price,status,drop_time,reserved_until"
    )
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data as PublicProduct;
}

export async function getAdminProducts(tenantId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ProductRow[];
}

export async function getAdminOrders(tenantId: string, onlyPending = false) {
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("orders")
    .select("*, products(id, brand, model, price, size_uk)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (onlyPending) {
    query = query.eq("order_status", "pending_verification");
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as (OrderRow & {
    products?: { id: string; brand: string; model: string; price: number; size_uk: number };
  })[];
}

export async function getGrossProfit(tenantId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("price,sourcing_cost")
    .eq("tenant_id", tenantId)
    .eq("status", "sold");

  if (error) {
    throw new Error(error.message);
  }

  const totals = (data || []).reduce(
    (acc: { revenue: number; cost: number }, row: { price: number; sourcing_cost: number }) => {
      acc.revenue += Number(row.price || 0);
      acc.cost += Number(row.sourcing_cost || 0);
      return acc;
    },
    { revenue: 0, cost: 0 }
  );

  return {
    revenue: totals.revenue,
    cost: totals.cost,
    grossProfit: totals.revenue - totals.cost,
  };
}
