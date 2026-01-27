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
  - **Buffer Times**: Automatic gaps between appointments .

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
npm install

# Initialize Database
npx prisma generate
npx prisma db push
```

### 3. Environment Configuration

Rename `.env.example` to `.env` and configure the following:

#### Core
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Use https://your-domain.com in production
```

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
