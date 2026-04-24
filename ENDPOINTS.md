# Flipside Endpoints

Last updated: 2026-04-01
Source of truth: Next.js App Router files under `app/**/page.tsx` and `app/**/route.ts`

## Web Pages (GET)

- `/`
- `/about`
- `/shop`
- `/product/[slug]`
- `/checkout`
- `/wishlist`
- `/orders`
- `/auth/signin`
- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/analytics`
- `/admin/brands`
- `/admin/orders`
- `/admin/products`
- `/admin/products/new`
- `/admin/settings`

## API Endpoints

### `/api/order/complete`
- Method: `POST`
- Request body:
  - `productId`
  - `customerName`
  - `phone`
  - `address`
  - `city`
  - `paymentMethod`
  - `receiptImageUrl` (optional)
- Response body on success:
  - `order_id`
  - `customer`
  - `shipping`
  - `order` (`name`, `size`, `qty`)
  - `customer_history` (`prior_orders`, `prior_rto`)
- Behavior: creates an order and returns the exact live JSON payload when checkout completes.

### `/api/auth/[...nextauth]`
- Methods: `GET`, `POST`
- Current behavior: returns `410 Gone`
- Response body:

```json
{
  "error": "NextAuth route is disabled. Use Supabase auth endpoints."
}
```

## Notes

- Dynamic segment: `[slug]` means values like `/product/jordan-1-retro-high`.
- App-level `not-found` and `loading` files exist, but they are UI framework handlers, not standalone API endpoints.
