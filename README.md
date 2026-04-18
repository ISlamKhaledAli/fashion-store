# Fashion Store Monorepo

Full-stack fashion e-commerce project with:
- `frontend/`: Next.js app (customer + admin interfaces)
- `backend/`: Express + Prisma REST API

This README now documents both apps and includes a real codebase audit snapshot.

## Audit Snapshot (April 18, 2026)

### Verification Run

- Backend `npm run build`: Passed
- Backend `npm test`: Passed (`5` suites, `19` tests)
- Frontend `npm run build`: Failed (`EPERM` unlink on `.next/app-path-routes-manifest.json`)
- Frontend `npm run lint`: Failed (`41` errors, `123` warnings)

### Clean Architecture Status

Current backend is layered but not strict Clean Architecture.

What exists:
- Presentation layer: routes + middleware
- Input validation: Zod validators
- Infra: Prisma client, Stripe, Cloudinary services
- Shared utilities: pagination, pricing, auth helpers

What is missing for strict Clean Architecture:
- No dedicated application/use-case layer
- No repository abstraction between controllers and Prisma
- Business rules still live directly inside controllers
- Domain logic and infrastructure concerns are mixed in some flows

Conclusion:
- Practical MVC-style architecture with good modular separation
- Not a pure Clean Architecture implementation yet

### Items Present But Not Wired / Not Used

- `backend/src/jobs/cleanupAbandonedOrders.ts`
  - Exists but is not scheduled or invoked by app startup.
- `backend/src/services/email.ts`
  - Implemented but not used by runtime flows.
- `frontend/src/app/admin/inventory/page.tsx`
  - Placeholder page (`Coming Soon`), no API integration.
- `frontend/src/app/admin/discounts/page.tsx`
  - Placeholder page (`Coming Soon`), no API integration.
- `frontend/src/lib/api.ts` -> `reviewApi.getMine`
  - Not used and points to `/reviews/mine/:productId` (route does not exist in backend).
- `frontend/src/lib/api.ts` -> `authApi.refresh`
  - Not used (token refresh is handled by Axios interceptor directly).
- Frontend root lint artifacts:
  - `lint_report.txt`, `lint_output.txt`, `lint_final.txt`, `lint_errors.txt`, `eslint-report.json`, `all_errors.txt`, `cat1_errors.json`
  - Generated diagnostics, not part of runtime.

### Items That Are Currently Risky / Not Working

- Frontend build can fail on locked `.next` artifacts (Windows/OneDrive lock issue).
- Lint quality gate currently fails with many TypeScript and hook-rule issues.
- Checkout flow risk:
  - In `PaymentStep`, payment is confirmed before order creation.
  - If order creation fails after successful charge, payment can succeed without created order.
- Payment intent refresh risk:
  - `PaymentStep` effect does not re-run when `shippingMethod` or `promoCode` changes, so intent amount may get stale.

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (auth/cart/search/wishlist state)
- Axios
- Stripe Elements
- Framer Motion

### Backend

- Node.js + Express 5
- TypeScript
- Prisma 7 + PostgreSQL
- JWT (access + refresh)
- Stripe (Payment Intents + webhooks)
- Cloudinary uploads
- Zod validation
- Winston logging
- Jest + Supertest integration tests

## Repository Structure

```text
fashion-store/
|-- frontend/
|   |-- src/app/               # Next.js routes (shop, auth, admin)
|   |-- src/components/        # UI + feature components
|   |-- src/store/             # Zustand stores
|   |-- src/lib/               # Axios client + API wrappers + helpers
|   `-- src/types/             # Shared frontend types
|-- backend/
|   |-- prisma/                # Schema + migrations + seed
|   |-- src/routes/            # Express routes
|   |-- src/controllers/       # Request handlers + orchestration
|   |-- src/middleware/        # Auth/admin/rate-limit/error/logging/upload
|   |-- src/services/          # Stripe/Cloudinary/email integrations
|   |-- src/utils/             # Env/JWT/bcrypt/pagination/pricing/helpers
|   |-- src/validators/        # Zod schemas
|   `-- tests/                 # Integration tests
|-- vercel.json
`-- README.md
```

## Local Setup

### 1) Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure Environment

#### Backend (`backend/.env`)

Required:
- `DATABASE_URL`
- `DIRECT_URL` (used by Prisma config)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLIENT_URL`

Optional:
- `DATABASE_URL_TEST`
- `DIRECT_URL_TEST`
- `PORT` (default `5000`)
- `NODE_ENV` (`development` | `production` | `test`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`

#### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL` (example: `http://localhost:5000/api`)
- `NEXT_PUBLIC_STRIPE_KEY` (publishable Stripe key)

### 3) Database

```bash
cd backend
npm run prisma:migrate
npm run seed
```

### 4) Run Both Apps

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Backend API Overview

Base URL (local): `http://localhost:5000/api`

Key route groups:
- Auth: `/auth/*`
- Products: `/products/*`
- Categories: `/categories/*`
- Brands: `/brands/*`
- Cart: `/cart/*`
- Orders: `/orders/*`
- Reviews: `/reviews/*`
- Wishlist: `/wishlist/*`
- Addresses: `/addresses/*`
- Upload: `/upload/*`
- Payments: `/payment/*`
- Admin: `/admin/*`
- Discounts validation: `/discounts/validate`

Health endpoint:
- `GET /health`

## Tests and Quality Commands

### Backend

```bash
cd backend
npm run build
npm test
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

If `npm run build` fails with `EPERM` on `.next`, ensure no running Next.js process is locking the file and clear stale build cache safely.

## Recommended Refactor Path

1. Stabilize frontend quality gate
- Fix `no-explicit-any` errors and hook dependency issues.
- Resolve `react-hooks/set-state-in-effect` violations.

2. Harden checkout ordering sequence
- Create order draft (or stock reservation) before payment confirmation.
- Ensure failed order creation after payment triggers automatic compensation/refund.

3. Move toward cleaner architecture
- Introduce use-case/service layer (application layer).
- Introduce repository layer for Prisma access.
- Keep controllers thin (HTTP only).

4. Remove or wire inactive modules
- Either schedule `cleanupAbandonedOrders` or remove it.
- Either implement email flow usage or document it as planned.
- Either build admin inventory/discount UI or hide links until ready.
