-- Flipside multi-tenant schema for Supabase PostgreSQL
-- Run in Supabase SQL editor or through Supabase migrations.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create type public.product_status as enum (
  'draft',
  'dropping_soon',
  'available',
  'reserved',
  'sold',
  'archived'
);

create type public.payment_method as enum (
  'cod_with_advance',
  'full_bank_transfer'
);

create type public.order_status as enum (
  'pending_verification',
  'processing',
  'dispatched',
  'delivered',
  'returned_fake'
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  domain text not null unique,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  brand text not null,
  model text not null,
  size_uk numeric(4,1) not null,
  size_eur numeric(4,1) not null,
  condition_grade text not null,
  flaws text[] not null default '{}',
  images text[] not null default '{}',
  video_url text,
  price numeric(12,2) not null check (price >= 0),
  sourcing_cost numeric(12,2) not null check (sourcing_cost >= 0),
  status public.product_status not null default 'draft',
  drop_time timestamptz,
  reserved_until timestamptz,
  reserved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index if not exists idx_products_tenant_status on public.products(tenant_id, status);
create index if not exists idx_products_reserved_until on public.products(reserved_until);

create table if not exists public.customers (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  phone text not null,
  total_orders integer not null default 0,
  returned_parcels integer not null default 0,
  is_blacklisted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, phone)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  product_id uuid not null references public.products(id),
  payment_method public.payment_method not null,
  advance_paid boolean not null default false,
  receipt_image_url text,
  order_status public.order_status not null default 'pending_verification',
  tracking_number text,
  unique (tenant_id, product_id),
  foreign key (tenant_id, phone) references public.customers(tenant_id, phone) on delete restrict
);

create index if not exists idx_orders_tenant_status on public.orders(tenant_id, order_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger trg_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

-- Claims a product reservation atomically.
create or replace function public.reserve_product(
  p_tenant_id uuid,
  p_product_id uuid,
  p_session_id text,
  p_minutes integer default 10
)
returns table (success boolean, message text, reserved_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
  v_until timestamptz;
begin
  select *
  into v_product
  from public.products
  where id = p_product_id and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'Product not found', null::timestamptz;
    return;
  end if;

  if v_product.status = 'dropping_soon' and v_product.drop_time is not null and v_product.drop_time > now() then
    return query select false, 'Drop has not started yet', null::timestamptz;
    return;
  end if;

  if v_product.status in ('sold', 'archived', 'draft') then
    return query select false, 'Product is not purchasable', null::timestamptz;
    return;
  end if;

  if v_product.status = 'reserved'
    and v_product.reserved_until is not null
    and v_product.reserved_until > now()
    and coalesce(v_product.reserved_by, '') <> coalesce(p_session_id, '') then
    return query select false, 'Product is currently reserved by another shopper', v_product.reserved_until;
    return;
  end if;

  v_until := now() + make_interval(mins => p_minutes);

  update public.products
  set status = 'reserved',
      reserved_until = v_until,
      reserved_by = p_session_id
  where id = p_product_id
    and tenant_id = p_tenant_id;

  return query select true, 'Reserved successfully', v_until;
end;
$$;

create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.products
  set status = 'available',
      reserved_until = null,
      reserved_by = null
  where status = 'reserved'
    and reserved_until is not null
    and reserved_until <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from cron.job
    where jobname = 'release-expired-reservations-every-minute'
  ) then
    perform cron.schedule(
      'release-expired-reservations-every-minute',
      '* * * * *',
      $job$select public.release_expired_reservations();$job$
    );
  end if;
end;
$$;

alter table public.tenants enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- A seller's auth.uid() is treated as the tenant_id.
create policy "tenant read tenants"
on public.tenants
for select
using (id = auth.uid());

create policy "tenant update tenants"
on public.tenants
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "public read domains"
on public.tenant_domains
for select
using (true);

create policy "tenant manage domains"
on public.tenant_domains
for all
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());

create policy "public read market products"
on public.products
for select
using (
  status in ('available', 'reserved', 'dropping_soon', 'sold')
);

create policy "tenant manage products"
on public.products
for all
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());

create policy "tenant read orders"
on public.orders
for select
using (tenant_id = auth.uid());

create policy "tenant write orders"
on public.orders
for all
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());

create policy "tenant read customers"
on public.customers
for select
using (tenant_id = auth.uid());

create policy "tenant write customers"
on public.customers
for all
using (tenant_id = auth.uid())
with check (tenant_id = auth.uid());