export type ProductStatus =
  | "draft"
  | "dropping_soon"
  | "available"
  | "reserved"
  | "sold"
  | "archived";

export type PaymentMethod = "cod_with_advance" | "full_bank_transfer";

export type OrderStatus =
  | "pending_verification"
  | "confirm"
  | "cancelled"
  | "manual"
  | "processing"
  | "dispatched"
  | "delivered"
  | "returned_fake";

export interface ProductRow {
  id: string;
  tenant_id: string;
  slug: string;
  brand: string;
  model: string;
  size_uk: number;
  size_eur: number;
  condition_grade: string;
  flaws: string[];
  images: string[];
  video_url: string | null;
  price: number;
  sourcing_cost: number;
  status: ProductStatus;
  drop_time: string | null;
  reserved_until: string | null;
  reserved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProduct {
  id: string;
  slug: string;
  brand: string;
  model: string;
  size_uk: number;
  size_eur: number;
  condition_grade: string;
  flaws: string[];
  images: string[];
  video_url: string | null;
  price: number;
  status: ProductStatus;
  drop_time: string | null;
  reserved_until: string | null;
}

export interface OrderRow {
  id: string;
  tenant_id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  product_id: string;
  payment_method: PaymentMethod;
  advance_paid: boolean;
  receipt_image_url: string | null;
  order_status: OrderStatus;
  tracking_number: string | null;
}

export interface CustomerRow {
  tenant_id: string;
  phone: string;
  total_orders: number;
  returned_parcels: number;
  is_blacklisted: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantDomainResolution {
  tenantId: string;
  theme?: string | Record<string, unknown>;
  logoUrl?: string;
}
