# ProcureLink

ProcureLink is a B2B procurement marketplace built with Next.js, Prisma, PostgreSQL-ready schemas, Redis-backed OTP authentication, and a modern shadcn/ui interface. It connects buyers and suppliers in a single workflow for onboarding, verification, profile management, and future procurement operations.

## Overview

The app currently includes:

- OTP-based registration and verification
- JWT-based authenticated sessions
- Buyer and supplier profile management through `/api/me`
- Role-based dashboard UI
- Brand-aligned landing page, sign up, sign in, OTP verification, and profile screens
- Redis-backed OTP storage with expiration
- Prisma ORM with a structured schema for buyers, suppliers, bids, ratings, messages, subscriptions, and KYC
- Docker Compose setup for Redis and PostgreSQL

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 6
- SQLite for local development
- PostgreSQL-ready schema and Docker Compose support
- Redis 7 for OTP storage
- JWT for authentication
- bcryptjs for password hashing
- shadcn/ui, Radix UI, lucide-react
- Tailwind CSS v4
- Sonner for toasts
- Zod for validation
- Nodemailer and BullMQ installed for future messaging and background jobs

## Features

### Authentication

- Register with email, password, role, and entity type
- Generate and store a 6-digit OTP in Redis
- Verify OTP and receive a JWT token
- Resend OTP with a cooldown flow
- Sign in page ready for login endpoint integration

### Profile Management

- Fetch current user data from `/api/me`
- Update buyer profile fields:
  - company name
  - location
  - Aadhaar
  - PAN
  - GST
  - CIN
  - MOA
  - work order
- Update supplier profile fields:
  - company name
  - location
  - GST
  - year established
  - supplier type

### UI

- Brand colors:
  - Primary: `#1E3A5F`
  - Accent: `#2563EB`
- Custom landing page with buyer/supplier CTAs
- Sign up and sign in screens with proper form states
- OTP screen with six separate inputs and resend countdown
- Profile page with a save/update workflow
- Dashboard page with role-based cards

## Project Structure

```text
app/
  api/
    auth/
      login/
      register/
      resend-otp/
      verify-otp/
    me/
  dashboard/
  profile/
  signin/
  signup/
  verify-otp/
components/
  profile/
  ui/
lib/
prisma/
public/
```

## API Routes

### Auth

- `POST /api/auth/register` - create a user and generate OTP
- `POST /api/auth/verify-otp` - verify OTP and return JWT
- `POST /api/auth/resend-otp` - generate a fresh OTP
- `POST /api/auth/login` - login endpoint currently available in the app

### Profile

- `GET /api/me` - get the current user with buyer/supplier profile data
- `PUT /api/me` - update buyer or supplier profile data based on role

## Environment Variables

Create a `.env.local` file in the project root with:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="supersecretkey"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="superjwtsecret"
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 3. Start Redis and PostgreSQL with Docker

```bash
docker compose up -d
```

### 4. Start the dev server

```bash
npm run dev
```

The app will run at:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npx prisma studio # Open Prisma Studio
```

## Database Notes

- Prisma is configured for local SQLite development with `prisma/dev.db`
- The schema is already prepared for PostgreSQL usage
- One-to-one relations are defined using unique fields where required
- Buyer and supplier profile models are linked to `User`

## Docker Services

The repository includes Docker Compose definitions for:

- Redis
- PostgreSQL

These are useful for local development and for matching the app's intended production infrastructure.

## Current UI Pages

- `/` - Landing page
- `/signup` - Registration page
- `/signin` - Sign in page
- `/verify-otp` - OTP verification page
- `/profile` - Profile editor
- `/dashboard` - Role-based dashboard

## Notes

- The OTP flow is wired to Redis and JWT generation.
- The profile page uses the `/api/me` contract for both viewing and updating user data.
- Some business features like requirements, bids, messaging, and KYC flows are scaffolded in the schema and UI direction, but not fully implemented yet.

## License

This project is currently private and internal to ProcureLink development.
