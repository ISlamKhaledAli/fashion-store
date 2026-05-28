# The Curator - Premium Fashion Commerce

A full-stack fashion eCommerce platform with a cinematic storefront, AI-assisted shopping, a retail-grade admin dashboard, and a hardened Express/Prisma API. The project is built as two deployable apps: a Next.js frontend and a Node.js backend.

Last updated: May 28, 2026

## What Is New

- Refined homepage hero with real navigation CTAs and first-viewport section preview.
- Working mobile navigation menu for the storefront.
- AI shopping assistant that can search catalog tools and respond in the customer's language.
- AI size advisor with saved customer measurements.
- AI product recommendations with cache and Prisma fallback.
- Admin AI tools for product copy, details accordions, storyboard features, analytics insights, and store-management chat.
- Expanded admin surface for customers, inventory, discounts, categories, brands, products, orders, analytics, and settings.
- Updated documentation to match the current codebase, scripts, environment variables, and feature surface.

## Product Surface

### Storefront

- Cinematic homepage with editorial sections, category discovery, featured products, brand story, and conversion CTAs.
- Product listing with filters, search state, category/brand/color/price support, grid/list presentations, and URL-aware discovery flows.
- Product detail pages with image gallery, lightbox, color-linked imagery, accordions, reviews, recommendations, wishlist actions, and size guidance.
- Cart drawer and cart page with guest cart support, authenticated cart sync, promo validation, shipping methods, tax, and centralized pricing.
- Multi-step checkout with shipping, review, Stripe payment, success flow, and order lifecycle support.
- Account area for profile, orders, wishlist, addresses, and settings.
- Static customer trust pages: about, editorial, archives, FAQ, shipping, returns, privacy, terms, and contact.
- Responsive navigation, search overlay, chat assistant, and mobile menu.

### Admin

- Overview dashboard with analytics cards, revenue chart, top products, order breakdown, and AI insights.
- Product management with variants, color swatches, image upload, Cloudinary media, AI-generated product copy, generated features, and detail accordions.
- Order management with detail panels, timeline, fulfillment status, bulk updates, and customer context.
- Inventory management with variant-level stock updates.
- Category tree management with drag/reorder support and nested categories.
- Brand management with logos, status, and product counts.
- Discount/coupon management with minimum order, usage limits, active windows, and validation.
- Customer management with spend/order history and account status controls.
- Admin AI chat that can query live store data through backend tools.

### Backend

- Express 5 API with TypeScript, Prisma 7, PostgreSQL, JWT auth, cookies, CORS, Helmet, request logging, rate limiting, and centralized errors.
- Stripe payments with webhook route mounted before JSON body parsing and webhook idempotency storage.
- Cloudinary image upload service.
- Nodemailer email service.
- OpenRouter-powered AI services for customer chat, size advice, recommendations, copy generation, analytics, and admin chat.
- Node-cron cleanup for abandoned/pending order maintenance.
- Test suite for auth, cart, orders, pricing, and products.

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| UI Motion | Framer Motion, lucide-react |
| State | Zustand |
| Data Client | Axios |
| Payments | Stripe Elements and Stripe.js |
| Admin Charts | Recharts |
| 3D-ready deps | Three.js, React Three Fiber, Drei |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL with Prisma 7 |
| Auth | JWT access and refresh tokens |
| Media | Cloudinary |
| Email | Nodemailer |
| AI | OpenRouter-compatible chat completions |
| Tests | Jest, Supertest, ts-jest |

## Repository Layout

```text
fashion-store/
|-- README.md
|-- vercel.json
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- seed.ts
|   |   `-- migrations/
|   |-- src/
|   |   |-- controllers/
|   |   |-- jobs/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- validators/
|   |   |-- app.module.ts
|   |   `-- server.ts
|   |-- tests/
|   `-- package.json
`-- frontend/
    |-- src/
    |   |-- app/
    |   |-- components/
    |   |-- hooks/
    |   |-- lib/
    |   |-- store/
    |   `-- types/
    |-- next.config.ts
    `-- package.json
```

## Requirements

- Node.js 20.19+ recommended for the current Next.js dependency tree.
- npm 10+
- PostgreSQL database, Supabase works well.
- Stripe account and webhook secret.
- Cloudinary account for product media.
- OpenRouter API key for AI features.
- SMTP credentials if transactional email is enabled.

## Installation

Install each app separately from the repository root.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment

### Backend: `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL pooled connection string |
| `DIRECT_URL` | Optional | Direct database URL for migrations |
| `DATABASE_URL_TEST` | Optional | Test database URL |
| `DIRECT_URL_TEST` | Optional | Direct test database URL |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key, starts with `sk_` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook secret, starts with `whsec_` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CLIENT_URL` | Yes | Frontend URL, for example `http://localhost:3000` |
| `PORT` | Optional | Defaults to `5000` |
| `NODE_ENV` | Optional | `development`, `production`, or `test` |
| `OPENROUTER_API_KEY` | Yes | AI provider key |
| `ANTHROPIC_API_KEY` | Optional | Reserved optional provider key |
| `EMAIL_HOST` | Optional | SMTP host |
| `EMAIL_PORT` | Optional | SMTP port |
| `EMAIL_SECURE` | Optional | SMTP secure flag |
| `EMAIL_USER` | Optional | SMTP username |
| `EMAIL_PASS` | Optional | SMTP password |

### Frontend: `frontend/.env.local`

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL, for example `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_KEY` | Yes | Stripe publishable key |

## Local Development

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Backend health check: `http://localhost:5000/health`

## Database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Useful Prisma commands:

```bash
npm run prisma:studio
npm run prisma:generate
```

## Quality Gates

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm run build
npm test
```

The backend test command prepares the test database before running Jest.

## API Overview

| Module | Base URL | Auth |
| --- | --- | --- |
| Auth | `/api/auth` | Public and user |
| Products | `/api/products` | Public and admin mutation routes |
| Recommendations | `/api/products/:id/recommendations` | Optional user context |
| Categories | `/api/categories` | Public and admin mutation routes |
| Brands | `/api/brands` | Public and admin mutation routes |
| Cart | `/api/cart` | Guest and user |
| Orders | `/api/orders` | User |
| Payment | `/api/payment` | User plus Stripe webhook |
| Reviews | `/api/reviews` | Optional read, authenticated write |
| Wishlist | `/api/wishlist` | User |
| Addresses | `/api/addresses` | User |
| Upload | `/api/upload` | Admin |
| Discounts | `/api/discounts` | Cart validation and admin |
| Chat | `/api/chat` | Guest and user context |
| Size | `/api/size` | Product sizing and saved measurements |
| Admin | `/api/admin` | Admin |
| Admin AI | `/api/admin/ai` | Admin |

## Stripe Webhooks

For local Stripe webhook testing:

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Use Stripe test card `4242 4242 4242 4242` for successful payment simulations.

## Deployment

- Frontend: Vercel is the natural target for the Next.js app.
- Backend: Railway, Render, Fly.io, or another Node.js host.
- Database: Supabase or managed PostgreSQL.
- Media: Cloudinary.
- Payments: Stripe Dashboard webhook endpoint pointed at the production backend.

Configure environment variables separately for frontend and backend. The root `vercel.json` and `backend/vercel.json` exist, but verify deployment routing before production launch because the backend is an Express API and often deploys more cleanly on a dedicated Node runtime.

## Operational Notes

- The frontend rewrites `/api/:path*` to `NEXT_PUBLIC_API_URL`.
- The payment router is mounted before JSON parsing so Stripe can validate the raw webhook body.
- Pricing math is centralized in `backend/src/utils/pricing.ts`.
- AI services require `OPENROUTER_API_KEY`; customer-facing flows should degrade gracefully when the provider is unavailable.
- Guest carts are supported in the UI and can be included in AI shopping assistant context.
- Recommendation results are cached in memory for 10 minutes and fall back to Prisma queries when AI is slow or unavailable.
