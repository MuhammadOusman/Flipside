import type { OrderRow, ProductRow, PublicProduct } from "@/lib/db/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type PublicProductSortOption = "newest" | "price_asc" | "price_desc";

export type PublicProductSearchOptions = {
  limit?: number;
  q?: string;
  brand?: string;
  sizeUk?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: PublicProductSortOption;
};

function normalizePublicProductOptions(
  options?: number | PublicProductSearchOptions
): PublicProductSearchOptions {
  if (typeof options === "number") {
    return { limit: options };
  }

  return options || {};
}

function sanitizeSearchTerm(input?: string) {
  if (!input) {
    return "";
  }

  return input
    .replace(/[%_]/g, "")
    .replace(/,/g, " ")
    .trim();
}

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

export async function getPublicProducts(
  tenantId: string,
  options?: number | PublicProductSearchOptions
) {
  const supabase = getSupabaseAdminClient();
  const normalized = normalizePublicProductOptions(options);

  let query = supabase
    .from("products")
    .select(
      "id,slug,brand,model,size_uk,size_eur,condition_grade,flaws,images,video_url,price,status,drop_time,reserved_until,created_at"
    )
    .eq("tenant_id", tenantId)
    .in("status", ["available", "reserved", "dropping_soon", "sold"]);

  if (normalized.brand) {
    query = query.ilike("brand", normalized.brand);
  }

  if (typeof normalized.sizeUk === "number" && Number.isFinite(normalized.sizeUk)) {
    query = query.eq("size_uk", normalized.sizeUk);
  }

  if (typeof normalized.minPrice === "number" && Number.isFinite(normalized.minPrice)) {
    query = query.gte("price", normalized.minPrice);
  }

  if (typeof normalized.maxPrice === "number" && Number.isFinite(normalized.maxPrice)) {
    query = query.lte("price", normalized.maxPrice);
  }

  const searchTerm = sanitizeSearchTerm(normalized.q);
  if (searchTerm) {
    query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
  }

  switch (normalized.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true }).order("created_at", { ascending: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  if (typeof normalized.limit === "number" && Number.isFinite(normalized.limit)) {
    query = query.limit(Math.max(1, Math.floor(normalized.limit)));
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

export async function getPublicProductFilterOptions(tenantId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("brand,size_uk")
    .eq("tenant_id", tenantId)
    .in("status", ["available", "reserved", "dropping_soon", "sold"]);

  if (error) {
    if (isMissingProductsTableError(error)) {
      return { brands: [] as string[], sizes: [] as number[] };
    }
    throw new Error(error.message);
  }

  const brandSet = new Set<string>();
  const sizeSet = new Set<number>();

  for (const row of data || []) {
    if (row.brand) {
      brandSet.add(String(row.brand));
    }

    const numericSize = Number(row.size_uk);
    if (Number.isFinite(numericSize)) {
      sizeSet.add(numericSize);
    }
  }

  return {
    brands: Array.from(brandSet).sort((a, b) => a.localeCompare(b)),
    sizes: Array.from(sizeSet).sort((a, b) => a - b),
  };
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
