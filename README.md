# Fashion Store REST API

Production-ready e-commerce backend for a fashion store platform, built with Node.js, Express, TypeScript, Prisma 7, PostgreSQL, JWT authentication, Stripe payments, Cloudinary uploads, and Zod validation. The repository also contains a frontend app, but this README focuses on the backend REST API in `backend/`.

## Tech Stack

- Node.js
- Express 5
- TypeScript
- Prisma 7 with `prisma.config.ts`
- PostgreSQL / Supabase
- JWT access + refresh tokens
- Stripe Payment Intents + webhooks
- Cloudinary
- Nodemailer
- Zod
- Winston logging
- Jest + Supertest + ts-jest

## Features

- JWT authentication with access and refresh token flow
- Product catalog with category, brand, search, filtering, sorting, and pagination
- Variant-aware inventory management
- Customer cart management
- Order creation from cart with stock validation and transactional checkout
- Stripe payment intent generation and webhook-based payment status updates
- Product reviews and wishlists
- Address book management
- Admin-only product, category, brand, upload, analytics, inventory, and discount endpoints
- Cloudinary-based image uploads
- Structured API responses and centralized error handling
- Integration test suite with isolated test database support and mocked external services

## Project Structure

```text
fashion-store/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/         # Prisma migrations
|   |   `-- schema.prisma       # Database schema
|   |-- src/
|   |   |-- controllers/        # Route handlers and business orchestration
|   |   |-- lib/                # Shared Prisma client setup
|   |   |-- middleware/         # Auth, admin, upload, rate limit, logger, errors
|   |   |-- routes/             # Express route registration
|   |   |-- services/           # Stripe, Cloudinary, email integrations
|   |   |-- types/              # Express request typing
|   |   |-- utils/              # Env validation, JWT, bcrypt, logger, API response helpers
|   |   |-- validators/         # Zod request schemas
|   |   |-- app.module.ts       # Express application composition
|   |   `-- server.ts           # Runtime bootstrap / listener startup
|   |-- tests/
|   |   |-- helpers/            # Test factories and auth helpers
|   |   |-- scripts/            # Test database preparation
|   |   |-- auth.test.ts        # Auth integration tests
|   |   |-- products.test.ts    # Product integration tests
|   |   |-- cart.test.ts        # Cart integration tests
|   |   |-- orders.test.ts      # Order integration tests
|   |   |-- setup-env.ts        # Test env bootstrap
|   |   `-- setup-tests.ts      # DB cleanup and service mocks
|   |-- jest.config.js          # Jest runner configuration
|   |-- prisma.config.ts        # Prisma 7 configuration
|   |-- tsconfig.json
|   `-- tsconfig.test.json
`-- frontend/                   # Separate client application
```

## Installation

1. Clone the repository.
2. Move into the backend directory:

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Create your environment file:

```bash
cp .env.example .env
```

5. Update the values in `.env`.
6. Apply database migrations:

```bash
npm run prisma:migrate
```

7. Start the API in development mode:

```bash
npm run dev
```

## Environment Variables

Create `backend/.env` with the following keys:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Runtime PostgreSQL connection string used by the app. |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection string used by Prisma CLI and migrations. |
| `DATABASE_URL_TEST` | Recommended | Dedicated PostgreSQL test database URL used by Jest. Keep this isolated from production data. |
| `DIRECT_URL_TEST` | Recommended | Direct connection string for the test database used by Prisma during test setup. |
| `JWT_SECRET` | Yes | Secret used to sign short-lived access tokens. |
| `JWT_REFRESH_SECRET` | Yes | Secret used to sign refresh tokens. |
| `STRIPE_SECRET_KEY` | Yes | Secret Stripe API key used to create payment intents. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret for `/api/payment/webhook`. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS. |
| `PORT` | No | HTTP port for the API. Defaults to `5000`. |
| `NODE_ENV` | No | Runtime mode: `development`, `production`, or `test`. |
| `EMAIL_HOST` | Optional | SMTP host for transactional emails. |
| `EMAIL_PORT` | Optional | SMTP port. |
| `EMAIL_SECURE` | Optional | SMTP TLS flag (`true` / `false`). |
| `EMAIL_USER` | Optional | SMTP username / sender identity. |
| `EMAIL_PASS` | Optional | SMTP password. |

## Running The Project

### Development

```bash
cd backend
npm run dev
```

### Production

```bash
cd backend
npm run build
npm start
```

## API Overview

Base URL in local development:

```text
http://localhost:5000
```

### Health

- `GET /health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin, archives product)

### Categories

- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

### Brands

- `GET /api/brands`
- `POST /api/brands` (admin)
- `PUT /api/brands/:id` (admin)
- `DELETE /api/brands/:id` (admin)

### Cart

- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/:cartItemId`
- `DELETE /api/cart/clear`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PUT /api/orders/:id/cancel`

### Reviews

- `GET /api/reviews/product/:productId`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

### Wishlist

- `GET /api/wishlist`
- `POST /api/wishlist/add`
- `DELETE /api/wishlist/remove/:productId`

### Addresses

- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/:id`
- `DELETE /api/addresses/:id`

### Uploads

- `POST /api/upload/image` (admin)
- `DELETE /api/upload/image` (admin)

### Payments

- `POST /api/payment/webhook`

### Admin

- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id`
- `GET /api/admin/customers`
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/revenue`
- `GET /api/admin/analytics/top-products`
- `GET /api/admin/inventory`
- `POST /api/admin/discounts`
- `GET /api/admin/discounts`

## Authentication Flow

The API uses stateless JWT authentication:

1. `POST /api/auth/register` or `POST /api/auth/login` returns:
   - `accessToken`
   - `refreshToken`
   - sanitized user object
2. Send the access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

3. When the access token expires, call `POST /api/auth/refresh` with the refresh token in the request body:

```json
{
  "refreshToken": "your-refresh-token"
}
```

4. Use the returned access token for subsequent protected requests.
5. `POST /api/auth/logout` is currently stateless and returns a success response; token invalidation is managed client-side unless you later add token persistence / revocation storage.

## Stripe Webhook Setup

The backend creates Stripe payment intents during order creation and expects webhook events to finalize payment state changes.

### Local Development

1. Start the API:

```bash
npm run dev
```

2. Start Stripe CLI forwarding:

```bash
stripe listen --forward-to http://localhost:5000/api/payment/webhook
```

3. Copy the generated webhook signing secret and store it in `.env` as:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Trigger test events:

```bash
stripe trigger payment_intent.succeeded
```

### Webhook Behavior

- `payment_intent.succeeded` marks the order as `PAID` and moves status to `PROCESSING`
- `payment_intent.payment_failed` marks the order payment as `FAILED`

## Cloudinary Setup

1. Create a Cloudinary account.
2. Collect:
   - cloud name
   - API key
   - API secret
3. Add them to `.env`.
4. Use the admin upload endpoint:

```text
POST /api/upload/image
```

The upload middleware stores files in memory and sends them to the `fashion-store` Cloudinary folder.

## Example API Response Format

Successful responses follow the shared `sendResponse` shape:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "pagination": null,
  "errors": null,
  "stack": null
}
```

Validation and error responses keep the same top-level contract and populate `message`, `errors`, and optionally `stack` in development.

## Testing

The backend includes Jest + Supertest integration tests for:

- auth: register, login, refresh token, `/me`
- products: catalog listing and admin product creation
- cart: add, update, remove
- orders: create and cancel

### Run Tests

```bash
cd backend
npm test
```

### Coverage

```bash
npm run test:coverage
```

### Test Database Behavior

- Tests never use the primary runtime database connection directly.
- The test harness prefers `DATABASE_URL_TEST` and `DIRECT_URL_TEST`.
- If those are not provided, the setup derives a schema-scoped fallback URL from the main connection string so test data stays isolated.
- The test runner applies migrations before execution and truncates all application tables between tests.
- Stripe, Cloudinary, and Nodemailer are mocked in the Jest setup so the suite never calls external services.

## Deployment Notes

- Build before deploy:

```bash
npm run build
```

- Use production-safe environment variables in your hosting platform.
- Make sure both `DATABASE_URL` and `DIRECT_URL` are configured in production.
- Run migrations against the production database before switching traffic:

```bash
npx prisma migrate deploy
```

- Expose the public webhook endpoint for Stripe:

```text
POST /api/payment/webhook
```

- Configure `CLIENT_URL` to the real frontend origin so CORS allows browser requests.
- Keep secrets out of version control and rotate any values that were previously exposed.
