-- Inventory reservation and ledger incremental migration

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'inventory_reservation_status'
  ) THEN
    CREATE TYPE public.inventory_reservation_status AS ENUM (
      'pending',
      'confirmed',
      'cancelled',
      'expired'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'inventory_ledger_event'
  ) THEN
    CREATE TYPE public.inventory_ledger_event AS ENUM (
      'reserve',
      'release',
      'confirm',
      'cancel',
      'expire',
      'adjust'
    );
  END IF;
END;
$$;

create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  session_id text not null,
  status public.inventory_reservation_status not null default 'pending',
  reserved_until timestamptz not null,
  order_id uuid references public.orders(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_inventory_reservations_product_pending on public.inventory_reservations(product_id) where status = 'pending';

create table if not exists public.inventory_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  reservation_id uuid references public.inventory_reservations(id),
  order_id uuid references public.orders(id),
  event_type public.inventory_ledger_event not null,
  before_status public.product_status,
  after_status public.product_status,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_inventory_reservations_updated_at'
  ) THEN
    CREATE TRIGGER trg_inventory_reservations_updated_at
    BEFORE UPDATE ON public.inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

create or replace function public.cancel_reservation(
  p_tenant_id uuid,
  p_product_id uuid,
  p_session_id text
)
returns table (success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_reservation public.inventory_reservations%rowtype;
begin
  select *
  into v_product
  from public.products
  where id = p_product_id
    and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'Product not found';
  end if;

  select *
  into v_reservation
  from public.inventory_reservations
  where tenant_id = p_tenant_id
    and product_id = p_product_id
    and session_id = p_session_id
    and status = 'pending'
  for update;

  if not found then
    return query select false, 'No active reservation found for this session';
  end if;

  update public.inventory_reservations
  set status = 'cancelled',
      updated_at = now()
  where id = v_reservation.id;

  update public.products
  set status = 'available',
      reserved_until = null,
      reserved_by = null,
      updated_at = now()
  where id = p_product_id
    and tenant_id = p_tenant_id
    and status = 'reserved'
    and reserved_by = p_session_id;

  insert into public.inventory_ledger (
    tenant_id,
    product_id,
    reservation_id,
    order_id,
    event_type,
    before_status,
    after_status,
    metadata
  ) values (
    p_tenant_id,
    p_product_id,
    v_reservation.id,
    null,
    'cancel',
    v_product.status,
    'available',
    jsonb_build_object('session_id', p_session_id)
  );

  return query select true, 'Reservation cancelled';
end;
$$;

create or replace function public.confirm_reservation_by_order_id(
  p_tenant_id uuid,
  p_order_id uuid
)
returns table (success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_product public.products%rowtype;
  v_reservation public.inventory_reservations%rowtype;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
    and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'Order not found';
  end if;

  select *
  into v_product
  from public.products
  where id = v_order.product_id
    and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'Product not found';
  end if;

  select *
  into v_reservation
  from public.inventory_reservations
  where tenant_id = p_tenant_id
    and product_id = v_product.id
    and status = 'pending'
  order by reserved_until desc
  limit 1
  for update;

  if found then
    update public.inventory_reservations
    set status = 'confirmed',
        order_id = p_order_id,
        updated_at = now()
    where id = v_reservation.id;
  end if;

  update public.products
  set status = 'sold',
      reserved_by = null,
      reserved_until = null,
      updated_at = now()
  where id = v_product.id
    and tenant_id = p_tenant_id;

  insert into public.inventory_ledger (
    tenant_id,
    product_id,
    reservation_id,
    order_id,
    event_type,
    before_status,
    after_status,
    metadata
  ) values (
    p_tenant_id,
    v_product.id,
    coalesce(v_reservation.id, null),
    p_order_id,
    'confirm',
    v_product.status,
    'sold',
    jsonb_build_object('order_id', p_order_id)
  );

  return query select true, 'Reservation confirmed';
end;
$$;

create or replace function public.cancel_order_reservation_by_order_id(
  p_tenant_id uuid,
  p_order_id uuid
)
returns table (success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_product public.products%rowtype;
  v_reservation public.inventory_reservations%rowtype;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
    and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'Order not found';
  end if;

  select *
  into v_product
  from public.products
  where id = v_order.product_id
    and tenant_id = p_tenant_id
  for update;

  if found then
    update public.products
    set status = 'available',
        reserved_by = null,
        reserved_until = null,
        updated_at = now()
    where id = v_product.id
      and tenant_id = p_tenant_id;
  end if;

  select *
  into v_reservation
  from public.inventory_reservations
  where tenant_id = p_tenant_id
    and product_id = v_order.product_id
    and status = 'pending'
  order by reserved_until desc
  limit 1
  for update;

  if found then
    update public.inventory_reservations
    set status = 'cancelled',
        order_id = p_order_id,
        updated_at = now()
    where id = v_reservation.id;

    insert into public.inventory_ledger (
      tenant_id,
      product_id,
      reservation_id,
      order_id,
      event_type,
      before_status,
      after_status,
      metadata
    ) values (
      p_tenant_id,
      v_product.id,
      v_reservation.id,
      p_order_id,
      'cancel',
      v_product.status,
      'available',
      jsonb_build_object('order_id', p_order_id)
    );
  end if;

  return query select true, 'Reservation cancelled for order';
end;
$$;

create or replace function public.place_order(
  p_tenant_id uuid,
  p_session_id text,
  p_product_id uuid,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_payment_method public.payment_method,
  p_receipt_image_url text
)
returns table (
  success boolean,
  code text,
  message text,
  order_id uuid,
  prior_orders integer,
  prior_rto integer,
  product_brand text,
  product_model text,
  product_size text,
  product_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers%rowtype;
  v_product public.products%rowtype;
  v_order public.orders%rowtype;
  v_reservation public.inventory_reservations%rowtype;
  v_reservation_id uuid;
  v_size text;
  v_prior_orders integer := 0;
  v_prior_rto integer := 0;
begin
  select *
  into v_product
  from public.products
  where id = p_product_id
    and tenant_id = p_tenant_id
  for update;

  if not found then
    return query select false, 'PRODUCT_NOT_FOUND', 'Product not found', null, null, null, null, null, null, null;
  end if;

  if v_product.status = 'dropping_soon' and v_product.drop_time is not null and v_product.drop_time > now() then
    return query select false, 'PRODUCT_NOT_AVAILABLE', 'Product is not available to order', null, null, null, null, null, null, null;
  end if;

  if v_product.status in ('sold', 'archived', 'draft') then
    return query select false, 'PRODUCT_NOT_AVAILABLE', 'Product is not available to order', null, null, null, null, null, null, null;
  end if;

  if v_product.status = 'reserved'
    and v_product.reserved_until is not null
    and v_product.reserved_until > now()
    and coalesce(v_product.reserved_by, '') <> coalesce(p_session_id, '') then
    return query select false, 'PRODUCT_RESERVED', 'Product is currently reserved by another shopper', null, null, null, null, null, null, null;
  end if;

  select *
  into v_customer
  from public.customers
  where tenant_id = p_tenant_id
    and phone = p_phone
  for update;

  if v_customer is not null and p_payment_method = 'cod_with_advance' and v_customer.is_blacklisted then
    return query select false, 'BLACKLISTED_COD', 'Your account is restricted from COD. Please select Full Bank Transfer.', null, v_customer.total_orders, v_customer.returned_parcels, null, null, null, null;
  end if;

  select *
  into v_reservation
  from public.inventory_reservations
  where tenant_id = p_tenant_id
    and product_id = p_product_id
    and status = 'pending'
    and session_id = p_session_id
    and reserved_until > now()
  for update;

  if not found then
    insert into public.inventory_reservations (
      tenant_id,
      product_id,
      session_id,
      status,
      reserved_until
    ) values (
      p_tenant_id,
      p_product_id,
      p_session_id,
      'pending',
      now() + make_interval(mins => 10)
    ) returning * into v_reservation;
  end if;

  v_reservation_id := v_reservation.id;

  insert into public.orders (
    tenant_id,
    customer_name,
    phone,
    address,
    city,
    product_id,
    payment_method,
    advance_paid,
    receipt_image_url,
    order_status
  ) values (
    p_tenant_id,
    p_customer_name,
    p_phone,
    p_address,
    p_city,
    p_product_id,
    p_payment_method,
    false,
    p_receipt_image_url,
    'pending_verification'
  )
  returning id into v_order.id;

  if v_customer is null then
    insert into public.customers (
      tenant_id,
      phone,
      total_orders,
      returned_parcels,
      is_blacklisted,
      created_at,
      updated_at
    ) values (
      p_tenant_id,
      p_phone,
      1,
      0,
      false,
      now(),
      now()
    );
    v_prior_orders := 0;
    v_prior_rto := 0;
  else
    v_prior_orders := v_customer.total_orders;
    v_prior_rto := v_customer.returned_parcels;
    update public.customers
    set total_orders = total_orders + 1,
        updated_at = now()
    where tenant_id = p_tenant_id
      and phone = p_phone;
  end if;

  update public.inventory_reservations
  set status = 'confirmed',
      order_id = v_order.id,
      updated_at = now()
  where id = v_reservation_id;

  update public.products
  set status = 'sold',
      reserved_by = null,
      reserved_until = null,
      updated_at = now()
  where id = p_product_id
    and tenant_id = p_tenant_id;

  insert into public.inventory_ledger (
    tenant_id,
    product_id,
    reservation_id,
    order_id,
    event_type,
    before_status,
    after_status,
    metadata
  ) values (
    p_tenant_id,
    p_product_id,
    v_reservation_id,
    v_order.id,
    'confirm',
    v_product.status,
    'sold',
    jsonb_build_object('order_id', v_order.id, 'session_id', p_session_id)
  );

  if v_product.size_eur is not null then
    v_size := v_product.size_eur::text || ' EUR';
  else
    v_size := v_product.size_uk::text || ' UK';
  end if;

  return query select
    true,
    null,
    'Order created successfully',
    v_order.id,
    v_prior_orders,
    v_prior_rto,
    v_product.brand,
    v_product.model,
    v_size,
    v_product.price;
exception when unique_violation then
  return query select false, 'PRODUCT_ALREADY_ORDERED', 'This item has already been ordered. Please choose another pair.', null, v_prior_orders, v_prior_rto, null, null, null, null;
end;
$$;
