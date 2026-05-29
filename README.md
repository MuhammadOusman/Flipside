# Flipside

Flipside is a Supabase-backed Next.js storefront and admin system for selling one-of-one thrift sneakers. It is built around the way limited second-hand shoe drops actually work: each pair is unique, inventory must not be oversold, buyers need trust signals before purchasing, and admins need a fast verification workflow after an order is placed.

The app combines a public comic-inspired sneaker shop, a slide-up reservation checkout flow, customer wishlist/auth features, and an admin control panel for products, orders, analytics, settings, and operational review.

## What This Project Is

Flipside is an ecommerce platform for thrift and preloved footwear, especially limited sneaker inventory such as Jordans, Dunks, Yeezys, Adidas, Nike, Lacoste, Reebok, and similar one-off pairs.

Unlike a typical ecommerce store where one product can have many stock units and variants, this project treats every shoe pair as a single sellable unit. That affects the entire architecture:

- A product is usually one exact pair, not a reusable SKU.
- A buyer can reserve a pair for a limited time before checkout.
- Another buyer cannot take the same pair while it is reserved.
- Checkout is optimized for one-pair purchases.
- Product pages show condition, flaws, images, and optional 360 video to reduce buyer uncertainty.
- Admins verify payments manually before dispatch.
- Inventory status is controlled through database functions to reduce race conditions.

The project currently works best as a single-store or early multi-tenant storefront foundation. The database schema and tenant resolver support multi-tenant concepts, but some admin and analytics areas are still local/client-side or placeholder-level and should be hardened before selling it as a complete SaaS product.

## Core Stack

- Framework: Next.js 16 App Router
- UI: React 19, Tailwind CSS 4, Framer Motion
- Database/Auth/Storage: Supabase
- State management: Zustand
- Charts: Recharts
- Icons: Lucide React
- Language: TypeScript

## Main Capabilities

### Public Storefront

The storefront is the customer-facing part of Flipside.

Key pages:

- `/` - homepage with featured products and latest drops
- `/shop` - product listing with search, filters, sorting, and product cards
- `/product/[slug]` - detailed product page
- `/wishlist` - locally persisted wishlist
- `/checkout` - informational redirect page because checkout now lives in the cart drawer
- `/auth/signin` - customer magic-link sign-in through Supabase
- `/orders` - customer order page UI, currently using mock order data
- `/about` - static brand/about page

### Homepage

The homepage introduces the store with a bold comic-style visual direction and pulls the latest public products from Supabase.

It displays:

- Brand/store hero section
- Main call to action to shop
- Latest drop grid
- Empty inventory state if no products exist
- Sunday drop messaging

Products are loaded through `getPublicProducts(tenantId, 6)`, so the homepage is tenant-aware and only shows products for the resolved tenant.

### Shop Page

The shop page is the main catalog browsing experience.

It supports:

- Text search by brand or model
- Brand filter
- UK size filter
- Minimum price filter
- Maximum price filter
- Sort by newest
- Sort by price low to high
- Sort by price high to low
- Active filter indicator
- Empty-state messaging
- Reset filters link

The filter options are generated from available product data, so brand and size dropdowns reflect the current tenant inventory instead of a hardcoded list.

Public products shown in the shop can have these statuses:

- `available`
- `reserved`
- `dropping_soon`
- `sold`

Draft and archived products are not shown in the public catalog.

### Product Cards

Product cards are used on the homepage and shop page. They display the core information shoppers need before opening a product:

- Product image
- Brand and model
- UK size
- Price
- Condition grade
- Product status
- Drop timing or reservation timing where relevant

Cards link into the product detail page using the product slug.

### Product Detail Page

The product detail page is designed for trust and urgency.

It includes:

- Image gallery
- Optional video inserted into the second gallery slot
- Thumbnail navigation
- Product name
- UK and EU sizes
- Price
- Drop countdown for `dropping_soon` products
- Reservation countdown for `reserved` products
- Condition grade
- Listed flaws
- Wishlist toggle
- WhatsApp quick contact button
- One-click Instagram caption export
- Add-to-cart reservation action

The page automatically refreshes when a scheduled drop time has passed, allowing a `dropping_soon` product to become buyable without the customer navigating away.

### 360 Video Support

When a product has `video_url`, the PDP gallery inserts the video after the first image. This gives buyers a more realistic inspection path for used shoes, where condition and shape matter.

The gallery supports:

- Image slides
- Video slide
- Previous/next controls
- Thumbnail selection
- Auto-playing muted video

### Trust Check

Each PDP has a trust panel that shows:

- Condition grade, such as `9/10`
- Flaws, such as `no box`, `light scuff`, or `minor creasing`
- A note that the 360 video is available in the gallery when present

This matters because thrift sneaker buyers need more evidence than a normal retail product page.

### Wishlist

Wishlist is implemented with Zustand persistence. Items are saved in browser storage under the `flipside-wishlist` key.

Wishlist items include:

- Product ID
- Name
- Brand
- Price
- Image
- Slug
- Size
- Condition score

Current behavior:

- Add product to wishlist from PDP
- Remove product from wishlist from PDP or wishlist page
- Wishlist count appears in the navbar
- Wishlist persists locally in the browser

Because this is local storage, wishlist data is not yet shared across devices or persisted in Supabase.

### Customer Authentication

Customer auth uses Supabase magic links from `/auth/signin`.

The sign-in page:

- Accepts an email address
- Sends a Supabase OTP magic link
- Shows success and error messages
- Powers the navbar user menu when a session exists

When signed in, the navbar can show:

- User menu
- Wishlist link
- Orders link
- Sign out action

The `/orders` page currently uses mock data and should be connected to real Supabase orders before being treated as production customer order history.

### WhatsApp Contact

The product page builds a WhatsApp deep link using `NEXT_PUBLIC_WHATSAPP_NUMBER`.

The generated message includes:

- Product brand
- Product model
- Size
- Price

This lets shoppers ask about a pair quickly, which is especially useful for social-commerce style sneaker selling.

### Instagram Export

The PDP includes a one-click Instagram export button. It copies a caption-like product summary to the clipboard.

The copied text includes:

- Brand
- Model
- UK and EU size
- Condition grade
- Price

This is useful for admins or sellers who want to reuse product details in social posts or stories.

## Reservation And Checkout System

The checkout system is one of the most important parts of Flipside.

### One-Of-One Reservation Model

Flipside prevents the same one-off pair from being purchased by multiple shoppers at the same time.

When a shopper clicks `Add to Cart`:

1. The app checks whether the pair is already in the local cart.
2. The app prevents reserving a second different pair at the same time.
3. A server action calls the Supabase `reserve_product` RPC.
4. The database locks the product row.
5. If available, the product becomes `reserved`.
6. The product gets a `reserved_until` timestamp.
7. The browser receives the reservation expiry time.
8. The cart drawer opens.

Reservations last 10 minutes by default.

### Session-Based Reservations

Reservation ownership is tracked with a `cart_session_id` cookie.

The cookie is:

- HTTP-only
- SameSite lax
- Secure in production
- Valid for 30 days

This lets the database know whether the current shopper is the same shopper who reserved the product.

### Reservation Expiry

The database includes a `release_expired_reservations` function. It marks expired pending reservations as `expired` and returns expired products to `available`.

The initial migration attempts to schedule this through `pg_cron` to run every minute:

```sql
select public.release_expired_reservations();
```

If using a Supabase plan or environment where `pg_cron` is unavailable, reservation expiry should be handled through a scheduled job or admin task.

### Cancel Reservation

When a shopper removes an item from the cart, the app calls `cancel_reservation`.

That function:

- Confirms the product belongs to the tenant
- Confirms the current session owns the pending reservation
- Marks the reservation as cancelled
- Returns the product to `available`
- Clears `reserved_by`
- Clears `reserved_until`
- Writes to the inventory ledger

### Cart Drawer

Checkout now runs in a global slide-up drawer instead of a separate checkout page.

The drawer includes:

- Current reserved pair
- Reservation countdown
- Remove item action
- Order total
- Four-step checkout progress
- Contact number step
- Payment selection step
- Receipt step
- Final order placement step

The drawer is animated with Framer Motion and is mounted from the navbar so it can open from anywhere in the storefront.

### Checkout Steps

Step 1: Contact number

- User enters a phone number.
- Pakistani local numbers such as `03xxxxxxxxx` are normalized to `+92xxxxxxxxxx`.
- International-style input with `+` is preserved after removing non-digits.
- OTP UI exists behind a feature flag, but OTP is currently disabled.

Step 2: Payment selection

Supported payment methods:

- `cod_with_advance`
- `full_bank_transfer`

For COD, the UI communicates that an advance payment is required. For full transfer, it communicates that the full amount must be paid before dispatch.

Step 3: Receipt

Receipt upload code exists, but `RECEIPT_UPLOAD_ENABLED` is currently set to `false`.

When enabled, the intended behavior is:

- Upload image receipt to the `payment-receipts` Supabase Storage bucket
- Store the public receipt URL on the order
- Require receipt for full bank transfer

Current behavior:

- Receipt upload is skipped.
- The user can continue without attaching a receipt.

Step 4: Place order

The user enters:

- Full name
- Phone
- City
- Address

Then the app posts to `/api/order/complete`.

### Order Creation

Order placement is handled through the Supabase `place_order` RPC.

That function:

- Locks the product row
- Rejects unavailable products
- Rejects products reserved by another active session
- Checks customer blacklist status for COD orders
- Creates or updates the customer record
- Creates the order
- Confirms the active reservation
- Marks the product as sold
- Writes an inventory ledger event
- Returns customer history and product summary

The API response includes:

```json
{
  "order_id": "uuid",
  "customer": {
    "name": "Customer Name",
    "phone": "+923001234567"
  },
  "shipping": {
    "address": "Street address",
    "city": "Karachi"
  },
  "order": {
    "name": "Nike Air Jordan 1",
    "size": "42 EUR",
    "qty": 1,
    "price": 45000
  },
  "customer_history": {
    "prior_orders": 0,
    "prior_rto": 0
  }
}
```

### COD Blacklist Check

The `customers` table tracks:

- Total orders
- Returned parcels
- Blacklist flag

If a customer is blacklisted and chooses `cod_with_advance`, `place_order` rejects the checkout with `BLACKLISTED_COD`.

The customer can be directed to use full bank transfer instead.

### Order Webhook

After successful order creation, the server can send the order payload to `THIRD_PARTY_WEBHOOK_URL`.

If `THIRD_PARTY_WEBHOOK_SECRET` is configured, the request includes:

```http
Authorization: Bearer <secret>
```

This allows another service to receive completed order data.

## Admin Panel

The admin panel is available under `/admin`.

Admin pages:

- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/orders`
- `/admin/analytics`
- `/admin/brands`
- `/admin/settings`

### Admin Authentication

Admin auth uses Supabase email/password sign-in.

The admin layout checks for a Supabase session. If no session exists and the user is not already on `/admin/login`, it redirects to `/admin/login`.

Admin users can:

- Sign in with email and password
- View the admin sidebar
- See the signed-in email
- Sign out

Important note: the current RLS policy model assumes `auth.uid()` maps directly to a tenant ID. That is a simple early model and should be replaced with a tenant membership and roles model for serious multi-user SaaS use.

### Admin Dashboard

The dashboard is the operational overview.

It shows:

- Current tenant ID
- Available pair count
- Pending verification count
- Total revenue from sold products
- Gross profit from sold products
- Verification queue preview

Gross profit is calculated as:

```text
sum(product.price where status = sold) - sum(product.sourcing_cost where status = sold)
```

### Product Inventory

The products page shows an admin inventory table.

It displays:

- Brand and model
- Slug
- UK and EU size
- Condition grade
- Price
- Sourcing cost
- Status

Product statuses include:

- `draft`
- `dropping_soon`
- `available`
- `reserved`
- `sold`
- `archived`

### Add Product

The add-product page lets admins create new inventory.

Fields:

- Brand
- Model
- Slug
- UK size
- EU size
- Condition grade
- Comma-separated flaws
- Price
- Sourcing cost
- Status
- Drop time
- Product images
- Optional 360 video

The form uploads media to the `product-media` Supabase Storage bucket, gets public URLs, then creates the product through `createProductAction`.

Supported creation statuses in the UI:

- `draft`
- `dropping_soon`
- `available`
- `archived`

The product type also supports `reserved` and `sold`, but those are normally controlled by reservation and order flows rather than manual creation.

### Drop Scheduling

Products can be created with:

- `status = dropping_soon`
- `drop_time = timestamp`

On the PDP:

- Price is hidden behind a countdown-style drop panel while the drop is in the future.
- The product refreshes automatically after the countdown completes.
- The reserve action only appears once the product is available.

### Order Verification

The admin orders page shows orders pending verification or manual review.

It includes:

- Pending order list
- Refresh button
- Selected order detail panel
- Customer name
- Phone
- City
- Address
- Payment method
- Current order status
- Tracking number if present
- Receipt image if present
- Approve payment action
- Generate tracking action

### Approve Payment

Approving payment runs `approvePaymentAction`.

That action:

- Loads the order by tenant and ID
- Updates the order to `processing`
- Sets `advance_paid` to `true`
- Calls `confirm_reservation_by_order_id`
- Sends an optional order status callback
- Revalidates admin and shop pages

Because `place_order` currently already confirms the reservation and marks the product sold, this action mostly acts as an operational payment-verification step and status transition.

### Generate Tracking

Generating tracking runs `generateTrackingAction`.

That action:

- Loads the order and related product
- Builds a courier payload
- Calls `COURIER_API_URL` if configured
- Uses `COURIER_API_KEY` as a bearer token if configured
- Falls back to a generated tracking number if no courier response is available
- Updates the order to `dispatched`
- Stores the tracking number
- Sends a WhatsApp dispatch message if WhatsApp Cloud API credentials are configured

Courier payload fields:

- Consignee name
- Consignee phone
- Consignee address
- Destination city
- COD amount

### WhatsApp Dispatch Message

If these variables are configured:

- `WHATSAPP_META_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

Then dispatch can send a WhatsApp message through Meta's Graph API.

The message includes:

- Customer name
- Shoe name
- Courier name
- Tracking number
- Remaining COD amount

### Order Status Callback

The app has an outbound callback helper and an inbound status endpoint.

Outbound callback:

- Helper: `sendOrderStatusCallback`
- Env: `ORDER_STATUS_CALLBACK_URL`
- Used when payment is approved

Inbound endpoint:

- Route: `/api/order/status`
- Method: `POST`
- Accepts status updates from external systems
- Supported statuses: `confirm`, `cancelled`, `manual`

Inbound behavior:

- `confirm` updates the order and confirms inventory
- `cancelled` updates the order and cancels/restores inventory
- `manual` updates the order to manual review

Expected request body:

```json
{
  "order_id": "uuid",
  "status": "confirm",
  "reason": "payment approved",
  "timestamp": "2026-05-29T12:00:00.000Z",
  "source": "external_system"
}
```

Current note: `.env.local.example` mentions `ORDER_STATUS_CALLBACK_TOKEN`, but the current route does not enforce token authentication yet.

### Admin Analytics

The analytics page uses the local Zustand analytics store.

Tracked events:

- Page views
- Product views
- Cart adds
- Checkout starts
- Purchases

Displayed metrics:

- Page views
- Unique visitors
- Returning visitors
- Product views
- Cart adds
- Checkouts
- Purchases
- Traffic overview chart
- Top pages
- Conversion funnel
- Recent activity
- Active carts

Important note: analytics are currently browser-local, not centralized in Supabase. This means the admin analytics view reflects events stored in the current browser, not authoritative traffic across all customers.

### Brand Management

The brands page is a client-side brand management UI.

It supports:

- Add brand
- Edit brand
- Delete brand
- Generate slug from brand name
- Toggle active/inactive state
- Confirmation modal before delete

Current limitation:

- Brand data is local React state only.
- It does not persist to Supabase yet.
- It starts with an empty brand list.

### Settings

The settings page provides a UI for store and configuration values.

Sections:

- Store information
- Supabase environment checklist
- Notification preferences
- Low-stock threshold
- Admin auth reminder

Current limitation:

- Saving settings currently shows an alert.
- Settings are not persisted to the database yet.
- Environment values still need to be managed through `.env.local` or the deployment platform.

## Multi-Tenant Foundation

Flipside includes tenant-aware data access.

Tenant resolution happens in `proxy.ts` and `lib/tenant.ts`.

Resolution sources:

1. `TENANT_DOMAIN_MAP` JSON environment variable
2. `tenant_domains` table in Supabase
3. `NEXT_PUBLIC_DEFAULT_TENANT_ID` fallback

The proxy:

- Reads the request host
- Resolves a tenant
- Sets `x-tenant-id` request header
- Stores `tenant_id` cookie
- Optionally stores tenant theme and logo cookies

Queries then call `getTenantIdFromRequest()` and scope reads/writes by tenant ID.

Important production note: a default tenant fallback is convenient for local development, but production SaaS deployments should fail closed for unknown domains to avoid routing unknown traffic into the wrong tenant.

## Database Schema

The main migration is:

```text
supabase/migrations/20260330_init_multi_tenant_flipside.sql
```

Additional migrations:

```text
supabase/migrations/20260425_add_manual_order_status.sql
supabase/migrations/20260512_inventory_reservation_command_center.sql
```

### Main Tables

`tenants`

- Stores seller/store tenants.
- Includes name, slug, logo URL, and theme JSON.

`tenant_domains`

- Maps domains to tenants.
- Used by tenant resolution.

`products`

- Stores one-of-one shoe inventory.
- Includes brand, model, sizes, condition, flaws, images, video, price, sourcing cost, status, drop time, reservation fields, and timestamps.

`customers`

- Stores customer phone history per tenant.
- Tracks total orders, returned parcels, and blacklist status.

`orders`

- Stores checkout orders.
- Links one order to one product.
- Tracks customer info, payment method, advance state, receipt URL, order status, and tracking number.

`inventory_reservations`

- Tracks active, confirmed, cancelled, and expired reservations.
- Links reservations to products, sessions, and orders.

`inventory_ledger`

- Audits inventory transitions.
- Stores event type, before/after product status, related reservation/order, and metadata.

### Database Enums

Product statuses:

- `draft`
- `dropping_soon`
- `available`
- `reserved`
- `sold`
- `archived`

Payment methods:

- `cod_with_advance`
- `full_bank_transfer`

Order statuses:

- `pending_verification`
- `confirm`
- `cancelled`
- `manual`
- `processing`
- `dispatched`
- `delivered`
- `returned_fake`

Inventory reservation statuses:

- `pending`
- `confirmed`
- `cancelled`
- `expired`

Inventory ledger events:

- `reserve`
- `release`
- `confirm`
- `cancel`
- `expire`
- `adjust`

### Important RPC Functions

`reserve_product`

- Atomically reserves a product for a session.
- Rejects unavailable, sold, archived, draft, or future-drop products.
- Prevents another session from taking an active reservation.
- Writes inventory ledger event.

`cancel_reservation`

- Cancels a pending reservation owned by the current session.
- Returns product to available.
- Writes inventory ledger event.

`release_expired_reservations`

- Expires old pending reservations.
- Returns expired reserved products to available.

`place_order`

- Creates customer and order records.
- Enforces one-product order uniqueness.
- Checks COD blacklist.
- Confirms inventory.
- Marks product sold.
- Returns order summary and customer history.

`confirm_reservation_by_order_id`

- Confirms inventory for a given order.
- Marks product sold.
- Writes inventory ledger event.

`cancel_order_reservation_by_order_id`

- Cancels order-linked reservation.
- Returns product to available.
- Writes inventory ledger event.

## API Routes

### `POST /api/order/complete`

Creates an order after checkout.

Required body:

```json
{
  "productId": "uuid",
  "customerName": "Customer Name",
  "phone": "+923001234567",
  "address": "Street address",
  "city": "Karachi",
  "paymentMethod": "cod_with_advance"
}
```

Optional body field:

```json
{
  "receiptImageUrl": "https://..."
}
```

Success response:

- `order_id`
- `customer`
- `shipping`
- `order`
- `customer_history`

Failure examples:

- Invalid request body
- Missing fields
- Product already ordered
- Product reserved by another shopper
- Product unavailable
- COD blacklisted customer

### `POST /api/order/status`

Accepts external order status updates.

Required body:

```json
{
  "order_id": "uuid",
  "status": "confirm"
}
```

Allowed statuses:

- `confirm`
- `cancelled`
- `manual`

### `OPTIONS /api/order/complete`

CORS preflight response.

### `OPTIONS /api/order/status`

CORS preflight response.

### `/api/auth/[...nextauth]`

This route is intentionally disabled and returns `410 Gone`.

Current response:

```json
{
  "error": "NextAuth route is disabled. Use Supabase auth endpoints."
}
```

## Environment Variables

Create `.env.local` from `.env.local.example`.

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DEFAULT_TENANT_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Optional tenant mapping:

```bash
TENANT_DOMAIN_MAP={"localhost":{"tenantId":"00000000-0000-0000-0000-000000000001"}}
```

Optional courier integration:

```bash
COURIER_API_URL=
COURIER_API_KEY=
COURIER_NAME=Leopards
```

Optional WhatsApp Cloud API:

```bash
WHATSAPP_META_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

Optional order completion webhook:

```bash
THIRD_PARTY_WEBHOOK_URL=
THIRD_PARTY_WEBHOOK_SECRET=
```

Optional order status callback:

```bash
ORDER_STATUS_CALLBACK_URL=
ORDER_STATUS_CALLBACK_TOKEN=
```

Current note: `ORDER_STATUS_CALLBACK_TOKEN` is documented in the example env file, but token validation is not implemented in `/api/order/status` yet.

Optional seed variables:

```bash
SEED_TENANT_DOMAINS=localhost,127.0.0.1
SEED_IMAGE_DIR=C:\path\to\images
SEED_ADMIN_EMAIL=admin@flipside.local
SEED_ADMIN_PASSWORD=Flipside123!
SEED_MAX_PRODUCTS=24
```

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local`.

```bash
cp .env.local.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

3. Create or connect a Supabase project.

4. Run the SQL migrations in Supabase.

Apply these in order:

```text
supabase/migrations/20260330_init_multi_tenant_flipside.sql
supabase/migrations/20260425_add_manual_order_status.sql
supabase/migrations/20260512_inventory_reservation_command_center.sql
```

5. Create required Supabase Storage buckets.

Required buckets:

- `product-media`
- `payment-receipts`

The current upload code expects these buckets to be public so product image and receipt URLs can be displayed directly.

6. Configure Supabase Auth.

For customer auth:

- Enable email magic links.

For admin auth:

- Enable email/password auth.
- Create an admin user.

7. Seed data if needed.

```bash
npm run seed
```

8. Start the dev server.

```bash
npm run dev
```

9. Open the app.

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Builds the production app.

```bash
npm run start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run seed
```

Runs the Supabase seed script.

## Project Structure

```text
app/
  actions/
    admin.ts                 Admin server actions
    storefront.ts            Reservation and checkout server actions
  admin/                     Admin panel routes
  api/
    order/complete/route.ts  Order completion API
    order/status/route.ts    External order status API
  auth/signin/page.tsx       Customer magic-link sign-in
  product/[slug]/page.tsx    Product detail route
  shop/page.tsx              Public shop route
  page.tsx                   Homepage

components/
  AdminOrdersClient.tsx      Admin order verification UI
  CartDrawer.tsx             Slide-up checkout drawer
  Navbar.tsx                 Store navigation and cart drawer host
  ProductCard.tsx            Product grid card
  ProductPdpClient.tsx       Product detail client UI

lib/
  db/types.ts                Shared TypeScript row types
  queries.ts                 Supabase read queries
  supabase/                  Supabase server/browser clients
  tenant.ts                  Tenant resolution helpers
  order-status-callback.ts   External status callback helper

store/
  analytics.ts               Local analytics event store
  cart.ts                    Local cart state
  ui.ts                      UI state
  wishlist.ts                Local persisted wishlist

supabase/migrations/
  SQL schema and RPC migrations

scripts/
  seed-supabase.js           Supabase seed script
```

## Data Flow Summary

### Browse To Product

1. Request enters through Next proxy.
2. Proxy resolves tenant from host or fallback.
3. Storefront query reads products for that tenant.
4. Product cards render public inventory.
5. Shopper opens `/product/[slug]`.

### Reserve Pair

1. Shopper clicks `Add to Cart`.
2. Server action gets or creates `cart_session_id`.
3. Server action calls `reserve_product`.
4. Database locks and updates product.
5. Cart drawer opens with countdown.

### Place Order

1. Shopper completes drawer checkout.
2. Client posts to `/api/order/complete`.
3. API calls `place_order`.
4. Database creates order and customer history.
5. Product is marked sold.
6. Optional third-party webhook fires.
7. Admin sees the order in pending verification.

### Admin Verify And Dispatch

1. Admin opens `/admin/orders`.
2. Admin reviews customer and payment details.
3. Admin approves payment.
4. Order becomes `processing`.
5. Admin generates tracking.
6. Courier integration is called if configured.
7. Order becomes `dispatched`.
8. Optional WhatsApp dispatch message is sent.

## Current Limitations And Important Notes

The following areas exist but should be treated carefully:

- `/orders` uses mock data and is not yet connected to real customer orders.
- Admin analytics are browser-local, not tenant-wide server analytics.
- Brand management is local React state only and does not persist.
- Settings are UI-only and do not save to Supabase.
- OTP checkout code exists but is disabled with `OTP_ENABLED = false`.
- Receipt upload code exists but is disabled with `RECEIPT_UPLOAD_ENABLED = false`.
- `ORDER_STATUS_CALLBACK_TOKEN` is listed in env examples but not enforced by the route.
- Tenant fallback is useful locally but should be fail-closed in production.
- RLS policies use a simplified tenant model and should become membership/role-based for multi-user SaaS.
- The service role key is required for server operations and must never be exposed to the browser.

## Deployment Checklist

Before production deployment:

- Set all required environment variables in the hosting platform.
- Apply Supabase migrations.
- Create storage buckets.
- Confirm storage policies match the desired public/private behavior.
- Create admin users.
- Configure Supabase Auth redirect URLs.
- Configure domain to tenant mapping.
- Confirm unknown domains cannot access the wrong tenant.
- Enable or remove OTP and receipt-upload flows intentionally.
- Configure webhook and courier secrets only on the server.
- Run `npm run build`.
- Test reservation expiry.
- Test order placement with available, reserved, sold, and blacklisted customer cases.
- Test admin payment approval and tracking generation.

## Why The App Is Designed This Way

Flipside is shaped around urgency, trust, and operational speed.

For shoppers:

- They can inspect the exact pair.
- They can see condition and flaws.
- They can reserve the pair before checkout.
- They can contact the seller through WhatsApp.
- They can save pairs to a wishlist.

For sellers:

- They can create inventory quickly.
- They can upload real product media.
- They can schedule drops.
- They can verify payments.
- They can prevent double-selling.
- They can track gross profit.
- They can dispatch with courier and WhatsApp integrations.

For future SaaS growth:

- Tenant tables already exist.
- Domain resolution already exists.
- Inventory reservation ledger already exists.
- Order callbacks and webhooks already exist.
- The app has a clear path toward stronger tenant roles, centralized analytics, persistent brand/settings modules, and production-grade customer order history.

