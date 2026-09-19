# The Curator — Fashion E-Commerce Platform

> AI Agent Context File — Read this ENTIRELY before writing any code.

## Project Overview

Full-stack premium fashion e-commerce platform. Two deployable apps:
- **Backend**: Express 5 + TypeScript + Prisma 7 + PostgreSQL (in `backend/`)
- **Frontend**: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 (in `frontend/`)

---

## Architecture & Stack

| Layer        | Technology                                                    |
|--------------|---------------------------------------------------------------|
| Frontend     | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4   |
| State        | Zustand (persisted stores for auth, cart, chat, wishlist)     |
| HTTP Client  | Axios with interceptor-based token refresh                    |
| UI Motion    | Framer Motion, lucide-react icons                             |
| Payments     | Stripe Elements + Stripe.js                                  |
| Charts       | Recharts                                                      |
| Backend      | Express 5, TypeScript, Node.js                                |
| Database     | PostgreSQL via Prisma 7 with `@prisma/adapter-pg` (pg Pool)  |
| Auth         | JWT access (1h) + refresh (7d) tokens via HttpOnly cookies    |
| Media        | Cloudinary                                                    |
| Email        | Nodemailer                                                    |
| AI Services  | OpenRouter API (Claude models) for chat, sizing, recs, admin  |
| Tests        | Jest + Supertest + ts-jest                                    |
| Validation   | Zod v4                                                        |

---

## Critical Conventions & Rules

### Backend Patterns

1. **Response Format**: ALL endpoints use `sendResponse()` from `utils/apiResponse.ts`. The response shape is:
   ```json
   { "success": true/false, "message": "...", "data": {...}, "pagination": {...} }
   ```

2. **Error Handling**: Use AppError subclasses (`AuthError`, `NotFoundError`, `ValidationError`, `ConflictError`, `ForbiddenError`) from `utils/AppError.ts`. The centralized `errorHandler` middleware catches them all.

3. **Controller Pattern**: Every controller function is `async (req, res, next)` with `try/catch` calling `next(error)`. Do NOT use `res.json()` directly — use `sendResponse()`.

4. **Validation**: Use Zod schemas in `validators/`. Parse with `.parse()` or `.safeParse()` in the controller.

5. **Authentication**: Three middleware levels in `middleware/auth.ts`:
   - `authMiddleware` — requires valid JWT cookie
   - `adminMiddleware` — requires `role === 'ADMIN'` (must chain after authMiddleware)
   - `optionalAuthMiddleware` — attaches user if cookie exists, continues as guest otherwise

6. **Pricing**: ALL financial calculations MUST go through `utils/pricing.ts`. The `calculateOrderTotals()` and `calculateDiscount()` are the single source of truth. **Never compute totals inline**.

7. **Stripe Webhook**: The payment route is mounted BEFORE `express.json()` in `app.module.ts` so Stripe can validate raw body. Do NOT move it.

8. **AI Services**: All AI calls go to OpenRouter (`https://openrouter.ai/api/v1/chat/completions`). Headers require `Authorization`, `Content-Type`, `HTTP-Referer`, `X-Title`. Models used:
   - `anthropic/claude-3-haiku` — customer chat, admin chat, recommendations
   - `anthropic/claude-haiku-4.5` — product description, features, accordions
   - `anthropic/claude-3.5-haiku` — analytics insights

9. **Database**: Prisma 7 with `@prisma/adapter-pg`. Schema at `backend/prisma/schema.prisma`. Run `prisma generate` after schema changes.

10. **Logging**: Use `winston` logger from `utils/logger.ts` for structured logging. Reserve `console.log` only for temporary debugging (and clean them up).

### Frontend Patterns

1. **Next.js 16**: This is NOT the Next.js you know. APIs, conventions, and file structure may differ from training data. Read `node_modules/next/dist/docs/` before writing code.

2. **Route Groups**: 
   - `(shop)` — storefront pages (products, cart, checkout, static pages)
   - `(auth)` — login/register
   - `admin` — admin dashboard (NOT a route group, real segment)

3. **API Layer**: All API calls go through `lib/api.ts` which uses the axios instance from `lib/axios.ts`. The axios instance has:
   - Client: baseURL = `/api` (proxied by Next.js rewrite)
   - Server: baseURL = `NEXT_PUBLIC_API_URL` directly
   - Auto token refresh interceptor on 401

4. **State Management**: Zustand stores in `store/`:
   - `authStore` — user, isAuthenticated, login/logout
   - `cartStore` — items, promo, drawer state (persisted to localStorage)
   - `chatStore` — chat messages and streaming state
   - `wishlistStore` — wishlist items
   - `searchStore` — search overlay state

5. **Styling**: Tailwind CSS v4 with custom theme tokens in `globals.css`. Uses `@theme` directive (v4 syntax). Color system follows Material Design 3 naming.

6. **Tailwind v4 Alert**: Do NOT use `tailwind.config.js/ts` — Tailwind v4 uses CSS-based config (`@theme` in globals.css). PostCSS config uses `@tailwindcss/postcss`.

7. **Components Structure**:
   - `components/ui/` — reusable primitives (Button, Input, Modal, etc.)
   - `components/shop/` — storefront-specific (ProductCard, FilterSidebar, etc.)
   - `components/admin/` — admin dashboard components
   - `components/layout/` — navigation, footer, etc.
   - `components/home/` — homepage sections
   - `components/checkout/` — checkout flow
   - `components/chat/` — AI shopping assistant
   - `components/account/` — user account pages

---

## Database Schema (Key Models)

| Model             | Key Fields / Notes                                                |
|-------------------|-------------------------------------------------------------------|
| User              | email (unique), password, role (CUSTOMER/ADMIN), status           |
| Product           | slug (unique), categoryId (required), brandId (optional), status  |
| Variant           | productId, size, color, stock, sku (unique)                       |
| ProductImage      | productId, url, publicId, position, isMain, variantColor          |
| Cart / CartItem   | userId (unique cart), variantId, compound unique [cartId+variantId]|
| Order / OrderItem | userId, addressId, pricing fields, status, paymentStatus          |
| Discount          | code (unique), type (percentage/fixed), value, usage tracking     |
| Review            | unique [userId+productId], rating, title, body                    |
| Wishlist          | compound PK [userId+productId]                                    |
| UserMeasurements  | userId (unique), body measurements for AI sizing                  |
| WebhookEvent      | Stripe webhook idempotency storage                                |

---

## Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` — PostgreSQL connection string (required)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing (required)
- `STRIPE_SECRET_KEY` (sk_), `STRIPE_WEBHOOK_SECRET` (whsec_) — Stripe (required)
- `CLOUDINARY_*` — cloud name, api key, api secret (required)
- `CLIENT_URL` — frontend URL for CORS (required)
- `OPENROUTER_API_KEY` — AI services (required)
- `PORT` — defaults to 5000

### Frontend (`frontend/.env`)
- `NEXT_PUBLIC_API_URL` — backend API URL
- `NEXT_PUBLIC_STRIPE_KEY` — Stripe publishable key

---

## Known Issues & Technical Debt

### 🔴 Duplicated Rate Limiters
Two rate limiting files exist with overlapping functionality:
- `middleware/rateLimit.ts` — exports `generalRateLimit`, `authRateLimit`
- `middleware/rateLimiter.ts` — exports `generalLimiter`, `chatLimiter`

Only `rateLimiter.ts` is imported in `app.module.ts`. The `rateLimit.ts` file is **dead code** but `authRateLimit` might be needed for auth routes.

### 🔴 Excessive `as any` Usage
40+ instances of `as any` across controllers. Many are workarounds for Prisma enum types that should be properly typed.

### 🔴 `@ts-ignore` Directives
4 instances in `order.controller.ts` and `payment.controller.ts` labeled "Bypass frozen TS dev cache". These indicate stale Prisma client types — run `prisma generate` to fix.

### 🟡 Debug Console.log Statements
10+ files contain `console.log` debug statements that should use `winston` logger or be removed.

### 🟡 OpenRouter Boilerplate Duplication
The OpenRouter API call pattern (headers, URL, error handling, streaming) is copy-pasted across 5 controllers:
- `chat.controller.ts`
- `adminAi.controller.ts` (×5 endpoints)
- `recommendation.controller.ts`
- `size.controller.ts`

Should be extracted into a shared AI service.

### 🟡 Stream Handling Duplication
The SSE streaming pattern (getReader + for-await fallback) is duplicated 6 times across chat, admin AI, size, and analytics controllers.

### 🟡 Prisma Error Handling Pattern
The `(error as any).code === "P2025"` pattern is used in 6+ controllers instead of using `Prisma.PrismaClientKnownRequestError`.

### 🟢 ProductFormPanel Size
`components/admin/ProductFormPanel.tsx` is 72KB — a massive single component that should be decomposed.

---

## File Map (Key Files)

```
backend/
  src/
    app.module.ts          — Express app setup, middleware, route mounting
    server.ts              — Server startup, DB connect, cron jobs
    controllers/           — Request handlers (17 files)
    routes/                — Route definitions (17 files)
    middleware/
      auth.ts              — JWT auth + admin + optional auth middleware
      errorHandler.ts      — Centralized error handler
      rateLimiter.ts       — Rate limiting (active)
      rateLimit.ts         — Rate limiting (DEAD CODE)
      sanitizeChat.ts      — Chat input sanitization
    lib/
      prisma.ts            — Prisma client singleton with pg adapter
      tools.ts             — Customer chat AI tools (search, details)
      adminTools.ts        — Admin chat AI tools (summary, stock, orders)
    utils/
      pricing.ts           — ⚠️ CRITICAL: Single source of truth for pricing
      AppError.ts          — Error class hierarchy
      apiResponse.ts       — Standard response helper
      validateEnv.ts       — Zod-based env validation
      jwt.ts               — Token generation/verification
      logger.ts            — Winston logger
    validators/            — Zod schemas for request validation
    services/
      stripe.ts            — Stripe client + helpers
      cloudinary.ts        — Cloudinary config
      email.ts             — Nodemailer service
  prisma/
    schema.prisma          — Database schema
    seed.ts                — Seed script

frontend/
  src/
    app/
      layout.tsx           — Root layout
      globals.css          — Tailwind v4 theme + custom styles
      (shop)/              — Storefront routes
      (auth)/              — Auth routes
      admin/               — Admin dashboard
    components/
      ui/                  — Reusable primitives
      shop/                — Store components
      admin/               — Admin components (ProductFormPanel = 72KB!)
      layout/              — Nav, footer
    lib/
      api.ts               — API layer (typed endpoints)
      axios.ts             — Axios instance with refresh interceptor
    store/                 — Zustand stores (auth, cart, chat, wishlist, search)
    types/index.ts         — All TypeScript interfaces
    middleware.ts          — Next.js middleware
```

---

## Development Commands

```bash
# Backend
cd backend && npm run dev          # Dev server (nodemon + ts-node)
cd backend && npm run build        # prisma generate + tsc
cd backend && npm test             # Prepare test DB + Jest
cd backend && npm run seed         # Seed database

# Frontend
cd frontend && npm run dev         # Next.js dev server
cd frontend && npm run build       # Production build
cd frontend && npm run lint        # ESLint

# Database
cd backend && npm run prisma:generate  # Regenerate Prisma client
cd backend && npm run prisma:migrate   # Run migrations
cd backend && npm run prisma:studio    # Visual DB browser
```

---

## Rules for AI Agents

1. **Never modify pricing logic** without updating both `pricing.ts` and all consuming controllers.
2. **Never move the payment webhook route** — it must stay before `express.json()`.
3. **Always use `sendResponse()`** for API responses, never raw `res.json()`.
4. **Always run `prisma generate`** after schema changes.
5. **Use AppError subclasses** for error throwing, never generic `throw new Error()`.
6. **Tailwind v4 uses CSS-based config** — no `tailwind.config.ts` file exists.
7. **Frontend API calls** go through `lib/api.ts`, not direct axios/fetch.
8. **Cart pricing** is server-authoritative via `/api/cart/calculate`. Frontend NEVER computes totals.
9. **Auth flows** use HttpOnly cookies, not Authorization headers or localStorage tokens.
10. **Test before committing**: `npm run build` in both apps, `npm test` in backend.
