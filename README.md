# Reservation System (Next.js 14 Fullstack)

A professional, white-label appointment scheduling platform built with Next.js 14, similar to Calendly. It allows users (Owners) to manage services, availability, and payments, while Clients can book appointments seamlessly.

![Dashboard Preview](public/dashboard-preview.png) *Add a screenshot here*

## 🚀 Features

### Core Functionality
- **Authentication**: Secure Login/Register with Magic Links & Google OAuth (NextAuth v5).
- **Role-Based Access**: 
  - **Admin**: Full system oversight.
  - **Owner**: Service providers who manage bookings and services.
  - **Client**: End-users booking the appointments.
- **Internationalization (i18n)**: Support for Spanish (ES) and English (EN).

### Service Management (Owners)
- **Custom Services**: Create unlimited services with:
  - Custom Title, Description, Duration, and Price.
  - **Color Coding**: For easy calendar visualization.
  - **Location Support**: Google Meet (auto-link), Phone, In-Person, or Custom URL (Zoom).
  - **Custom Intake Forms**: Add required questions for clients (Text, Phone, etc.).
- **URL Slugs**: professional public links like `app.com/[username]/[service-slug]`.

### Availability & Calendar
- **Hybrid Availability Engine**:
  - **Weekly Schedule**: Define working hours (e.g., Mon-Fri 9-5).
  - **Exceptions**: Block specific dates or override hours for holidays.
  - **Google Calendar Sync**: Two-way sync. Checks for conflicts in your personal calendar and adds new bookings automatically.
  - **Buffers & Notice**: Set buffer time between appointments and minimum notice periods.
- **Time Zone Intelligence**: Automatically detects and converts time zones for clients and owners.

### Smart Booking Logic
- **Concurrency Control**:
  - **Global Pool**: Limit total simultaneous clients per owner.
  - **Service-Specific**: Set capacity for group classes (e.g., "Yoga Class" for 10 people).
- **Recurrence**: Clients can book recurring sessions (Weekly/Biweekly/Monthly) in one flow.

### Payments & Monetization
- **Stripe Integration**:
  - **Upfront Payments**: Require payment to confirm a booking.
  - **Stripe Connect (Express)**: Owners connect their *own* Stripe accounts to receive payouts directly ("Destination Charges").
  - **Platform Subscriptions**: (Optional) SaaS model where owners pay a subscription to use the platform.

### Notifications
- **Automated Emails**: Powered by Resend.
  - Booking Confirmation (with ICS/Calendar links).
  - Cancellations & Rescheduling updates.
  - 24h Reminders (via Cron Jobs).

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **Database**: PostgreSQL (via Neon / Supabase)
- **ORM**: Prisma
- **Auth**: Auth.js (NextAuth v5)
- **Payments**: Stripe & Stripe Connect
- **Email**: Resend
- **Styling**: TailwindCSS + Shadcn/UI
- **Validations**: Zod + React Hook Form
- **Date Handling**: date-fns + date-fns-tz

## 📦 Getting Started

### 1. Requirements
- Node.js 18+
- PostgreSQL Database
- Stripe Account
- Google Cloud Project (for Calendar API)
- Resend Account (for Emails)

### 2. Environment Setup

Rename `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (NextAuth)
AUTH_SECRET="openssl rand -base64 32"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google Calendar
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev"
```

### 3. Installation

```bash
# Install dependencies
npm install

# Initialize Database
npx prisma generate
npx prisma db push

# Run Development Server
npm run dev
```

Visit `http://localhost:3000`.

## 🚀 Deployment (Vercel)

This project is optimized for Vercel.

1.  **Push to GitHub**: Ensure your code is in a repository.
2.  **Create Project on Vercel**: Import your repository.
3.  **Configure Environment Variables**:
    - Copy all values from your local `.env` to Vercel's Environment Variables settings.
    - **Important**: For `NEXT_PUBLIC_APP_URL`, use your production domain (e.g., `https://my-app.vercel.app`).
4.  **Database**: Ensure your Database provider (e.g., Neon) allows connections from Vercel.
5.  **Build & Deploy**: Vercel will automatically build and deploy.

### Post-Deployment Checks
- **Stripe Webhooks**: Add your Vercel deployment URL (`https://.../api/webhooks/stripe`) to the Stripe Dashboard.
- **Google OAuth**: Add your production domain to the "Authorized Redirect URIs" in Google Cloud Console (`https://.../api/auth/callback/google`).
- **Cron Jobs**: If using Vercel Cron, ensure `vercel.json` is configured (included in project).

## 📜 License

MIT License.
