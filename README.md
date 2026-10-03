# Joy Rush — Animated D2C Storefront

A custom, animation-heavy e-commerce store (inspired by drinkjoyrush.com) built as a
full-stack Next.js app for the Indian market.

**Stack:** Next.js 16 (App Router, TS) · Tailwind v4 + shadcn/ui · Lenis + GSAP +
Motion (animations) · Prisma + PostgreSQL (Neon) · Clerk (auth) · Cloudinary
(images) · Razorpay (payments) · Shiprocket (shipping) · Zustand (cart).

## Runs out of the box (demo mode)

With **no configuration**, the site runs in demo mode using a built-in catalog:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you get the animated storefront, product pages, cart,
checkout UI (draft orders), and a read-only admin preview. Add the keys below to go
fully live.

## Go live — configuration

Copy `.env.example` to `.env` and fill in the values.

### 1. Database (Neon PostgreSQL)
1. Create a free project at https://neon.tech and copy the connection string.
2. Set `DATABASE_URL` and `DIRECT_URL` in `.env`.
3. Create the schema and seed products:
   ```bash
   npm run db:push      # or: npm run db:migrate
   npm run db:seed
   ```
   Inspect data anytime with `npm run db:studio`.

### 2. Clerk (auth)
1. Create an app at https://clerk.com and copy the API keys.
2. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. (Optional) Add a **Webhook** → endpoint `/api/webhooks/clerk`, subscribe to
   `user.*`, and set `CLERK_WEBHOOK_SIGNING_SECRET`.
4. Add your email to `ADMIN_EMAILS` to unlock `/admin`.

### 3. Cloudinary (images)
Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`. The admin product form then uploads images directly.
(Without it, paste image URLs or use the built-in illustration fallback.)

### 4. Razorpay (payments)
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`. Use
**test** keys to try the flow. Add a webhook to `/api/webhooks/razorpay`
(event `payment.captured`) and set `RAZORPAY_WEBHOOK_SECRET`.

Test card: `4111 1111 1111 1111`, any future expiry/CVV.

### 5. Shiprocket (shipping)
Set `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, and `SHIPROCKET_PICKUP_LOCATION`
(a pickup nickname from your Shiprocket dashboard). Fulfilling a paid order in
`/admin/orders` creates the shipment.

## Architecture notes

- **Backend is Next.js itself** — Route Handlers (`app/api/*`) + Server Actions
  (`app/admin/actions.ts`). No separate server.
- **Prices** live in paise (integer) end-to-end and are always re-computed
  server-side at checkout (`lib/cart-totals.ts`) — the client is never trusted.
- **Graceful degradation**: every integration has an `*Enabled` flag; the app
  falls back to demo data / demo flows when a service isn't configured
  (`lib/db.ts`, `lib/auth-config.ts`, `lib/razorpay.ts`, etc.).
- **Animations** respect `prefers-reduced-motion` (see `globals.css` and
  `SmoothScrollProvider`).

## Key paths

| Area | Path |
|------|------|
| Storefront home | `app/page.tsx`, `components/home/*` |
| Catalog | `app/products/*`, `components/product/*` |
| Cart | `store/cart.ts`, `components/cart/cart-drawer.tsx` |
| Checkout + payments | `app/checkout/*`, `app/api/checkout`, `app/api/razorpay/*` |
| Orders + shipping | `app/orders/*`, `lib/orders.ts`, `lib/shiprocket.ts` |
| Admin | `app/admin/*`, `components/admin/*` |
| Data model | `prisma/schema.prisma` |
