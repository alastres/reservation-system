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
npm install
```

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
npx prisma db push

# Or run migrations (Production)
npx prisma migrate deploy
```

### 4. Run Development Server

```bash
npm run dev
```

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
