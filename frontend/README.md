# The Curator Frontend

The customer and admin interface for The Curator, built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, Axios, Stripe Elements, and Recharts.

## Current Experience

- Cinematic storefront homepage with responsive hero, editorial sections, category carousel, featured products, and conversion CTAs.
- Responsive navigation with search overlay, cart drawer, account entry, and mobile menu.
- Product discovery with filters, search state, URL syncing, grid/list views, and polished product cards.
- Product detail experience with gallery, lightbox, color-linked imagery, reviews, recommendations, wishlist, and AI size advisor.
- Cart and checkout flows with guest support, promo validation, shipping methods, tax, Stripe payment, and success page.
- Account pages for overview, orders, wishlist, addresses, and settings.
- Admin command center for analytics, products, orders, inventory, customers, discounts, categories, brands, settings, and AI tooling.

## Directory Map

```text
src/
|-- app/
|   |-- (auth)/
|   |-- (shop)/
|   `-- admin/
|-- components/
|   |-- account/
|   |-- admin/
|   |-- auth/
|   |-- checkout/
|   |-- home/
|   |-- invoice/
|   |-- layout/
|   |-- shop/
|   `-- ui/
|-- hooks/
|-- lib/
|-- store/
`-- types/
```

## Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key_here
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Backend Contract

The frontend calls the backend through `src/lib/axios.ts` and `src/lib/api.ts`. In development, `next.config.ts` rewrites `/api/:path*` to `NEXT_PUBLIC_API_URL`, which lets client code call the API consistently.

Key API groups used by the UI:

- `authApi`
- `productApi`
- `categoryApi`
- `brandApi`
- `cartApi`
- `orderApi`
- `wishlistApi`
- `reviewApi`
- `addressApi`
- `adminApi`
- `sizeApi`

## UI Notes

- Shared UI primitives live in `src/components/ui`.
- Storefront layout lives in `src/app/(shop)/layout.tsx`.
- Admin layout lives in `src/app/admin/layout.tsx`.
- Global styles and design tokens live in `src/app/globals.css`.
- State stores live in `src/store` and use Zustand.
- The homepage sections live in `src/components/home`.

## Quality Check

Before shipping frontend changes:

```bash
npm run lint
npm run build
```
