# Fashion eCommerce Store

A full-stack, production-ready fashion eCommerce platform designed with a modern, cinematic aesthetic. This project features a scroll-driven frontend, a comprehensive admin dashboard, and a robust backend integrated with Stripe for secure payments.

## Project Overview
- **Visual Excellence**: Modern scroll-driven frontend with cinematic animations using Framer Motion.
- **Full-Stack Core**: Seamless integration between a Next.js frontend and an Express/Prisma backend.
- **Production Ready**: Zero TypeScript errors, high test coverage, and complete feature parity.
- **Admin Command Center**: A powerful, sleek dashboard for managing the entire store.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **API Client**: Axios
- **Payments**: Stripe Elements

### Backend
- **Environment**: Node.js, Express
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Integrations**: Stripe, Cloudinary (Media), Nodemailer (Emails)
- **Scheduler**: node-cron (Automated cleanup jobs)

## Features

### Shop
- **Cinematic Homepage**: Immersive scroll animations and editorial layouts.
- **Product Discovery**: Dynamic listing with advanced category, brand, color, and price filters.
- **Sticky Showcase**: Product detail pages with optimized sticky information panels.
- **Cart System**: High-performance cart supporting both guest and authenticated users.
- **Checkout**: Secure multi-step checkout powered by Stripe.
- **Search**: Real-time product search with URL-synced filtering.
- **Reviews & Wishlist**: User engagement features for social proof and saving favorites.

### Account
- **Personal Dashboard**: Overview of recent activity and order status.
- **Order History**: Detailed tracking and historical record of all purchases.
- **Address Book**: Manage multiple shipping addresses.
- **Wishlist Management**: Personalized collection of saved items.

### Admin Dashboard
- **Analytics**: Revenue charts, top products, and customer geographic data.
- **Product Management**: Full CRUD with Cloudinary image uploads and variant tracking.
- **Order Fulfillment**: Bulk status updates and order tracking.
- **Inventory & Discounts**: Real-time stock management and sophisticated coupon rules.
- **Categories & Brands**: Structural management for store organization.

## Project Structure

### Frontend (`frontend/src`)
```text
src/
├── app/            # Next.js routes (shop, auth, admin)
├── components/     # Atomic UI and feature-specific components
├── hooks/          # Custom React hooks (hydration, product lists, etc.)
├── lib/            # Axios instance, API wrappers, and utilities
├── store/          # Zustand state management (cart, auth, search)
└── types/          # Global TypeScript interfaces
```

### Backend (`backend/src`)
```text
src/
├── controllers/    # Request handlers and business logic
├── jobs/           # Automated background tasks (node-cron)
├── lib/            # Database (Prisma) and library initializations
├── middleware/     # Auth, Admin, Error handling, and Rate limiting
├── routes/         # Express API route definitions
├── services/       # Third-party integrations (Stripe, Cloudinary, Email)
├── utils/          # Pricing logic, JWT, and common helpers
└── validators/     # Zod schema definitions for input validation
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (via Supabase or local)
- Stripe Account
- Cloudinary Account

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/fashion-store.git
cd fashion-store

# Install Backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct connection string for Prisma migrations |
| `JWT_SECRET` | Secret for Access Token generation |
| `JWT_REFRESH_SECRET` | Secret for Refresh Token generation |
| `STRIPE_SECRET_KEY` | Stripe private API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret for local/production events |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `CLIENT_URL` | Frontend URL (e.g., http://localhost:3000) |
| `EMAIL_USER` | SMTP User for Nodemailer |
| `EMAIL_PASS` | SMTP Password for Nodemailer |

### Frontend (`frontend/.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., http://localhost:5000/api) |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe Publishable Key |

## Running Locally

### Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## Database
We use **PostgreSQL via Supabase** with the **Prisma 7 ORM**.

- **Migrate**: `npx prisma migrate dev`
- **Seed**: `npx ts-node prisma/seed.ts`
- **Studio**: `npx prisma studio` (UI for database management)

## API Overview

| Module | Base URL | Auth Required |
| :--- | :--- | :--- |
| Auth | `/api/auth` | No |
| Products | `/api/products` | No |
| Cart | `/api/cart` | Optional (Guest supported) |
| Orders | `/api/orders` | Yes |
| Payment | `/api/payment` | Yes |
| Reviews | `/api/reviews` | Optional |
| Wishlist | `/api/wishlist` | Yes |
| Admin | `/api/admin` | Yes (Admin Only) |

## Stripe Setup
1. Obtain test keys from [Stripe Dashboard](https://dashboard.stripe.com).
2. **Test Card**: Use `4242 4242 4242 4242` for all simulations.
3. **Webhooks**: For local development, use the Stripe CLI:
   `stripe listen --forward-to localhost:5000/api/payment/webhook`

## Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Navigate to the dashboard to find your **Cloud Name**, **API Key**, and **API Secret**.
3. Add these to your backend `.env` file to enable image uploads.

## Deployment
- **Frontend**: Deploy to **Vercel** for optimal Next.js performance.
- **Backend**: Deploy to **Railway** or **Render** (Node.js environment).
- **Environment Variables**: Ensure all `.env` variables listed above are configured in your deployment platform.

## Current Status
- **✓ Feature Complete**: All core eCommerce and Admin features implemented.
- **✓ Type Safe**: 0 TypeScript errors across the entire monorepo.
- **✓ Lint Clean**: 0 ESLint errors in frontend and backend.
- **✓ Mathematical Integrity**: Centralized pricing logic in `pricing.ts` for parity.
- **✓ Resilient Checkout**: Guest cart support and Stripe payment lifecycle integration.
- **✓ Automated Maintenance**: node-cron cleanup jobs connected and operational.
- **✓ Communication**: Email confirmation service fully integrated into the order flow.
