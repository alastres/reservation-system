# Reservation System (Next.js 14 Fullstack)

A professional appointment scheduling platform similar to Calendly, built with Next.js 14, React, TailwindCSS, Prisma, and PostgreSQL.

## Features

- **Authentication**: Secure Login/Register with Email/Password (NextAuth v5).
- **Dashboard**: Professional dashboard to manage services and availability.
- **Service Management**: Create unlimited services with custom duration, price, and URL slugs.
- **Availability Engine**: Set weekly recurring schedules (e.g., Mon-Fri, 9am-5pm).
- **Public Booking Pages**:
  - Profile Page: `/[username]`
  - Booking Page: `/[username]/[service-slug]`
- **Booking Logic**: Real-time slot generation preventing double bookings.
- **Responsive UI**: Built with Shadcn/UI and TailwindCSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Auth.js (NextAuth v5)
- **Styling**: TailwindCSS + Shadcn/UI
- **Validation**: Zod
- **Forms**: React Hook Form

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` (or create `.env`) and add your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
AUTH_SECRET="your-secret-key" # Run `openssl rand -base64 32` to generate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Initialize the database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to DB (Development)
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start.

## Deployment

1. Push to GitHub.
2. Import project in Vercel.
3. Add `DATABASE_URL` and `AUTH_SECRET` to Vercel Environment Variables.
4. Deploy!

## API Routes

- `/api/auth/*`: Authentication endpoints.
- Server Actions are used for data mutation (Services, Booking, etc.), located in `actions/`.
