<<<<<<< HEAD
# Reservation SaaS Platform (Next.js 14)

A professional, white-label appointment scheduling platform built with **Next.js 14**. It empowers professionals (Owners) to manage their services, availability, and payments, while providing Clients with a seamless booking experience. Similar to Calendly, but self-hosted and fully customizable.

![Dashboard Preview](public/dashboard-preview.png)

## 🚀 Key Features

### 🔐 Authentication & Security
- **Multi-Method Auth**: Supports Google OAuth, Email/Password, and Magic Links (via **Auth.js / NextAuth v5**).
- **OTP Verification**: Secure 2-step verification for email registration.
- **Role-Based Access Control (RBAC)**: Distinct portals for **Admins**, **Owners** (Providers), and **Clients**.
- **Security Best Practices**:
  - **Rate Limiting**: Middleware-based protection against abuse.
  - **Spam Prevention**: Honeypot fields and CAPTCHA implementation.
  - **Input Validation**: Strict schema validation using **Zod**.

### 📅 Booking Engine
- **Flexible Services**: Configure duration, price, capacity (1-on-1 or Groups), and location (Google Meet, Phone number for calls, In-Person).
- **Hybrid Availability**:
  - **Weekly Rules**: Set recurring operating hours (e.g., Mon-Fri 9-5).
  - **Date Exceptions**: Override specific dates for holidays or time off.
  - **Google Calendar Sync**: 2-way sync to prevent double bookings.
- **Smart Logic**:
  - **Time Zone conversion**: Auto-detects client timezone.
  - **Concurrency Management**: Global limits (e.g., "max 3 bookings at once") vs Service limits.
  - **Buffer Times**: Automatic gaps between appointments.

### 💰 Payments & Monetization (Stripe)
- **Direct Payments**: Clients pay upfront to confirm bookings.
- **Stripe Connect (Express)**:
  - **Onboarding**: Owners connect their own Stripe accounts via a dedicated onboarding flow.
  - **Automatic Payouts**: Funds are routed directly to the Owner's bank account.
  - **Platform Fees**: (Optional) The platform can take a % cut of every transaction.
- **SaaS Subscriptions**: Build a business model where Owners pay a monthly/annual fee to use the platform.
- **Webhooks**: Real-time status updates (Payment Succeeded, Subscription Updated).

### 🌍 Internationalization (i18n)
- **Multilingual Support**: Fully translated into **English (EN)** and **Spanish (ES)**.
- **Locale Detection**: Middleware automatically redirects users based on browser preference.
- **Localized Content**: All emails, error messages, and UI elements are adapted.

### ⚙️ Automation & Analytics
- **Cron Jobs**: Background tasks for sending **24h and 1h Appointment Reminders** (via Vercel Cron).
- **Email Notifications**: Transactional emails via **Resend** (Confirmations, Cancellations, Reminders).
- **Dashboard Analytics**: Interactive charts (Recharts) for Revenue, Booking Volume, and Popular Services.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [Neon](https://neon.tech) or Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Payments**: [Stripe](https://stripe.com/) & Stripe Connect
- **Email**: [Resend](https://resend.com/) & [Nodemailer](https://nodemailer.com/)
- **UI/Styling**: [TailwindCSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL Database URL
- Stripe Account (with Connect enabled)
- Google Cloud Project (for Calendar API & Auth)
- Resend API Key

### 2. Installation

```bash
# Clone repository
git clone https://github.com/your-username/reservation-system.git
cd reservation-system

# Install dependencies
=======
# 📅 Professional Reservation System

A comprehensive appointment scheduling platform similar to Calendly, built with **Next.js 14**, **React**, **TypeScript**, **Prisma**, and **PostgreSQL**. Features advanced booking management, Google Calendar integration, Stripe payments, and multi-language support.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)](https://tailwindcss.com/)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-provider Auth**: Email/Password, Google OAuth
- **Email Verification**: Automated verification emails with nodemailer
- **Role-based Access**: Admin, Owner, Client roles
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Secure sessions with NextAuth v5

### 📊 Dashboard & Management
- **Advanced Dashboard**: Real-time statistics with charts (Recharts)
  - Revenue tracking
  - Booking analytics
  - Service performance metrics
- **Service Management**: Unlimited services with:
  - Custom duration, pricing, and capacity
  - URL slugs for SEO-friendly booking pages
  - Color customization
  - Custom form fields
  - Buffer time and minimum notice settings
- **Availability Control**:
  - Weekly recurring schedules
  - Date-specific exceptions (overrides/blocks)
  - Timezone-aware scheduling

### 🎯 Booking System
- **Smart Slot Generation**: Real-time availability calculation
- **Multi-location Support**:
  - Google Meet (auto-generated)
  - Zoom
  - Phone calls
  - In-person meetings
  - Custom URLs
- **Recurring Bookings**: Weekly, bi-weekly, monthly recurrence
- **Group Bookings**: Support for multiple attendees (capacity management)
- **Timezone Handling**: Automatic timezone detection and conversion
- **Custom Forms**: Collect additional information from clients

### 📧 Integrations
- **Google Calendar Sync**: Two-way synchronization
  - Automatic event creation
  - Google Meet link generation
  - Calendar conflict prevention
- **Email Notifications**:
  - Booking confirmations
  - Reminders
  - Cancellation notices
  - Custom branding
- **Stripe Payments**:
  - Service payments with Stripe Checkout
  - Subscription management (Monthly/Quarterly/Annual)
  - Stripe Connect for service providers
  - Platform fees (10% default)
  - Webhook handling

### 🎨 User Experience
- **Public Booking Pages**:
  - `/[username]` - Profile page with all services
  - `/[username]/[service-slug]` - Individual service booking
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Dark Mode**: System preference detection
- **Modern UI**: Built with Shadcn/UI components
- **Smooth Animations**: Framer Motion transitions
- **Multi-language**: English & Spanish (i18n)

### 👑 Admin Features
- **User Management**: View and manage all users
- **System Logs**: Track admin actions
- **Analytics**: Platform-wide statistics
- **Settings**: Global configuration

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | Auth.js (NextAuth v5) |
| **Styling** | TailwindCSS + Shadcn/UI |
| **Payments** | Stripe + Stripe Connect |
| **Validation** | Zod |
| **Forms** | React Hook Form |
| **Charts** | Recharts |
| **Email** | Nodemailer / Resend |
| **Calendar** | Google Calendar API |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Project (for OAuth & Calendar)
- Stripe Account (for payments)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reservation-system
>>>>>>> master
npm install

<<<<<<< HEAD
# Initialize Database
npx prisma generate
=======
### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Auth
AUTH_SECRET="your-secret-key" # Run: openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth & Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Nodemailer - Gmail example)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Subscription Price IDs
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_QUARTERLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (Development)
>>>>>>> master
npx prisma db push

# Or run migrations (Production)
npx prisma migrate deploy
```

### 3. Environment Configuration

Rename `.env.example` to `.env` and configure the following:

#### Core
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Use https://your-domain.com in production
```

<<<<<<< HEAD
#### Authentication (NextAuth)
```env
AUTH_SECRET="generate-with-openssl-rand-base64-32"
# Google OAuth
AUTH_GOOGLE_ID="your-client-id"
AUTH_GOOGLE_SECRET="your-client-secret"
```

#### Payments (Stripe)
Go to Stripe Dashboard > Developers > API Keys.
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Product IDs (Create these in Stripe Dashboard Products)
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_QUARTERLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
```

#### Google Calendar Integration
Required for 2-way sync. Enable **Google Calendar API** in Cloud Console.
```env
GOOGLE_CLIENT_ID="same-as-auth-id"
GOOGLE_CLIENT_SECRET="same-as-auth-secret"
```

#### Email (Resend)
```env
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev" # Or your verified domain
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_..."
```

---

## 🚀 Configuration Guide

### Google Cloud Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Calendar API**.
3. Go to **Credentials** > **Create Credentials** > **OAuth Client ID**.
4. Set Authorized Redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`.

### Stripe Connect Setup
1. Go to Stripe Dashboard > **Connect**.
2. Enable **Express** accounts.
3. In **Input Settings** > **Redirects**, add:
   - `http://localhost:3000/api/stripe/connect/refresh`
   - `http://localhost:3000/api/stripe/connect/return`
   - (And the comprehensive production equivalents)
4. Use the `STRIPE_SECRET_KEY` in your `.env`.

### Vercel Deployment & Cron Jobs
1. **Push to GitHub**.
2. **Import to Vercel**: Select the repository.
3. **Environment Variables**: Copy all variables from `.env`.
4. **Cron Jobs**:
   - The project includes a `vercel.json` file defining the cron schedule (`/api/cron/reminders`).
   - Vercel automatically detects this.
   - You can secure the cron endpoint by adding a `CRON_SECRET` env var (optional implementation).

---

## 🏃‍♂️ Running the Project

### Development
```bash
npm run dev
# Visit http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Utility Scripts
The `scripts/` folder contains helper scripts for verification (excluded from build):
- `npm run check-tz`: Verifies timezone handling.
- `npm run verify-all`: runs a full build verification.

---

## 📄 License

MIT License.
=======
Visit `http://localhost:3000`

---

## 📦 Deployment to Vercel

### Step 1: Prepare Your Project

1. **Ensure `.gitignore` includes**:
   ```
   .env
   .env.local
   node_modules
   .next
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Database Setup

1. **Create Production PostgreSQL Database**:
   - **Recommended**: [Neon](https://neon.tech) (free tier available)
   - **Alternatives**: Supabase, Railway, AWS RDS

2. **Get your DATABASE_URL** (should look like):
   ```
   postgresql://user:password@host:5432/dbname?sslmode=require
   ```

### Step 3: Vercel Deployment

1. **Import Project**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   
   Click "Environment Variables" and add all variables from your `.env`:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `DATABASE_URL` | `postgresql://...` | Production database URL |
   | `AUTH_SECRET` | `<random-string>` | Run `openssl rand -base64 32` |
   | `NEXT_PUBLIC_APP_URL` | `https://yourdomain.vercel.app` | Your Vercel URL |
   | `GOOGLE_CLIENT_ID` | `<your-id>` | From Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | `<your-secret>` | From Google Cloud Console |
   | `EMAIL_SERVER_HOST` | `smtp.gmail.com` | Or your email provider |
   | `EMAIL_SERVER_PORT` | `587` | SMTP port |
   | `EMAIL_SERVER_USER` | `<your-email>` | SMTP username |
   | `EMAIL_SERVER_PASSWORD` | `<app-password>` | SMTP password |
   | `EMAIL_FROM` | `noreply@yourdomain.com` | Sender email |
   | `STRIPE_SECRET_KEY` | `sk_live_...` | Production key |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production key |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe Dashboard |
   | `STRIPE_PRICE_MONTHLY` | `price_...` | Create in Stripe |
   | `STRIPE_PRICE_QUARTERLY` | `price_...` | Create in Stripe |
   | `STRIPE_PRICE_ANNUAL` | `price_...` | Create in Stripe |

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 4: Post-Deployment Configuration

#### A. Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://yourdomain.vercel.app/api/auth/callback/google
   ```

#### B. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

#### C. Run Database Migrations

In your local terminal:
```bash
# Set production database URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Step 5: Verify Deployment

1. ✅ Visit your site
2. ✅ Test user registration
3. ✅ Test Google OAuth login
4. ✅ Create a service
5. ✅ Make a test booking
6. ✅ Verify email notifications
7. ✅ Check Google Calendar sync
8. ✅ Test Stripe payment flow

---

## 🔧 Configuration

### Creating Stripe Products & Prices

1. Go to Stripe Dashboard → Products
2. Create three products:
   - **Monthly Plan**: €10/month
   - **Quarterly Plan**: €25.50 every 3 months
   - **Annual Plan**: €84/year
3. Copy the Price IDs and add to `.env`

### Gmail App Password

1. Enable 2-Step Verification on your Google Account
2. Go to Security → App passwords
3. Generate a password for "Mail"
4. Use this as `EMAIL_SERVER_PASSWORD`

---

## 📁 Project Structure

```
reservation-system/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── admin/             # Admin panel
│   └── [username]/        # Public booking pages
├── actions/               # Server Actions
│   ├── auth.ts
│   ├── booking.ts
│   ├── services.ts
│   ├── availability.ts
│   └── subscription.ts
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── auth/             # Auth forms
│   ├── booking/          # Booking calendar
│   ├── dashboard/        # Dashboard components
│   └── services/         # Service management
├── lib/                   # Utility functions
│   ├── auth.ts
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── google.ts
│   └── mail.ts
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── schemas/               # Zod validation schemas
└── middleware.ts         # Route protection
```

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Regenerate Prisma Client
npx prisma generate
npx prisma db push
```

**OAuth Redirect Mismatch**
- Ensure redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`

**Email Not Sending**
- Check Gmail App Password is correct
- Verify 2-Step Verification is enabled
- Consider using Resend for production

**Stripe Webhooks Not Working (Local)**
- Use Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14**
>>>>>>> master
