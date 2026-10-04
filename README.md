# D2C Storefront Template

An animated, full-stack e-commerce store for the Indian market. Each store owner
deploys **their own copy** (own database, own payment and shipping accounts) and
customizes everything from the admin panel. Brand, colors, homepage, shipping
rules and pages are all edited there, with no code changes or redeploys.

**Stack:** Next.js 16 (App Router, TS) · Tailwind v4 + shadcn/ui · Motion + Lenis
(animations) · Prisma + PostgreSQL (Neon) · Clerk (auth) · Cloudinary (images) ·
Razorpay (payments) · Shiprocket (shipping) · Zustand (cart).

## What store owners can change in `/admin`

| Screen | What it controls |
|--------|------------------|
| **Settings → Store & SEO** | Store name, logo, favicon, tagline, contact details, WhatsApp, social links, search title/description, share image, website address, shop page heading |
| **Settings → Theme** | Color palette (4 presets or custom colors, with a readability check and live preview) |
| **Settings → Homepage** | Turn sections on/off; hero text and buttons, announcement strip, “why shop with us” cards, review heading, offer banner, FAQ |
| **Settings → Shipping & Discounts** | Shipping fee, free-shipping threshold, up to 5 “spend more, save more” tiers, delivery time, return window |
| **Pages** | About, policy pages and any custom page: markdown content, URL, SEO title/description, publish and footer toggles |
| **Products / Orders** | Catalog, images, sizes, stock; orders, Shiprocket shipments and labels |

---

## Deploying your own store

### 1. Get the code running locally
```bash
npm install
cp .env.example .env
npm run dev
```
With an empty `.env` the site runs in **demo mode** (sample catalog, read-only admin)
so you can look around. Fill in the services below to go live.

### 2. Database (Neon PostgreSQL)
1. Create a project at https://neon.tech and copy the connection strings.
2. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in `.env`.
3. Create the tables and the starter pages:
   ```bash
   npm run db:push
   npm run db:seed-store   # About, Contact, Shipping, Refund, Privacy, Terms
   ```
4. Optional: `npm run db:seed` adds a few sample products to try checkout with.
   Delete them in **Admin → Products** before launch.

### 3. Clerk (sign-in and admin access)
1. Create an application at https://clerk.com and copy the API keys into
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
2. Put the store owner's email in `ADMIN_EMAILS` (comma-separate several).
3. Sign in with that email and open `/admin`.

Until Clerk is configured, the admin is a read-only preview: saving and image uploads are refused.

### 4. Cloudinary (images)
Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
Logo, product and review photo uploads then work from the admin. Without these keys you can
paste https image links instead.

### 5. Razorpay (payments)
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`. Start with
**test** keys (test card `4111 1111 1111 1111`, any future expiry/CVV). Add a webhook to
`/api/webhooks/razorpay` (event `payment.captured`) and set `RAZORPAY_WEBHOOK_SECRET`.

Razorpay reviews your Terms, Privacy, Refund, Shipping and Contact pages before enabling live
mode. The starter pages from step 2 cover these. Fill in your contact details under
**Settings → Store & SEO** and read every page before applying.

### 6. Shiprocket (shipping)
Set `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD` and `SHIPROCKET_PICKUP_LOCATION` (the pickup
nickname from your Shiprocket dashboard). Shipping a paid order from **Admin → Orders**
creates the shipment and label.

### 7. Resend (order emails)
Customers get an order confirmation email when their payment goes through. Create an API key at
https://resend.com, verify your domain there, and set `RESEND_API_KEY`. Then enter the sender
address (e.g. `orders@mystore.com`) under **Settings → Store & SEO → Order emails**. Emails go
out under your store name, and use your logo, colors and contact details from **Settings**. Use a PNG or JPG logo, because Gmail and Outlook
don't display SVG. Replies go to the contact email set in Settings.

### 8. Make it yours
In **Admin → Settings**: set the store name, upload a logo, pick colors, write the homepage,
set shipping rules, and enter your live domain under *Website address* (used for share links
and `sitemap.xml`). Then add products.

### 9. Deploy
Deploy to Vercel (or any Node host). Copy every `.env` value into the host's environment
variables and set `NEXT_PUBLIC_APP_URL` to your domain. `npm run build` runs `prisma generate`.

---

## Caching

Storefront reads (settings, products, categories, reviews, pages) are cached and shared
across requests. Saving in the admin refreshes the affected pages immediately. If you change
data outside the admin (bulk import, editing the database directly), use **Refresh store
data** on the Settings screen. Otherwise caches expire on their own within an hour.

Checkout always reads prices from the database. It never uses the cache.

## Upgrading

Store content lives in the database (`SiteSetting`, `Page`, products), not in code. Pulling a
newer version of the template therefore doesn't touch a store's customizations. New settings
come with defaults, and a stored value that no longer validates falls back to its default
instead of breaking the page. If the schema changes, run `npm run db:push`.

## Architecture notes

- **Backend is Next.js itself**: Route Handlers (`app/api/*`) and Server Actions. No separate server.
- **Settings** are one JSON row per section, validated by the zod schemas in
  `lib/settings/schema.ts`, which hold the types, the validation and the defaults.
- **Prices** are integer paise end to end. Checkout re-computes totals on the server with
  the same rules the cart preview uses (`lib/cart-totals.ts`), so the client is never trusted.
- **Theme colors** are injected as CSS variables (`lib/settings/theme-css.ts`), so color changes
  need no rebuild.
- **Page content** is markdown. Raw HTML and `javascript:` links are not rendered.
- **Graceful degradation**: every integration has an `*Enabled` flag, and the app falls back to
  demo data or flows when a service isn't configured.

## Key paths

| Area | Path |
|------|------|
| Settings (schema, loading, theme) | `lib/settings/*`, `app/admin/settings/*`, `components/admin/settings/*` |
| Content pages | `app/[slug]/page.tsx`, `lib/pages.ts`, `app/admin/pages/*` |
| Storefront home | `app/page.tsx`, `components/home/*` |
| Catalog | `app/products/*`, `components/product/*`, `lib/products.ts` |
| Cart and pricing | `store/cart.ts`, `lib/cart-totals.ts`, `components/cart/*` |
| Checkout and payments | `app/checkout/*`, `app/api/checkout`, `app/api/razorpay/*` |
| Orders and shipping | `app/orders/*`, `lib/orders.ts`, `lib/shiprocket.ts` |
| Caching | `lib/cache-tags.ts` (tags), `unstable_cache` wrappers in `lib/*` |
| Data model | `prisma/schema.prisma` |
