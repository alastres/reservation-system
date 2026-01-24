---
title: Project Tasks
completedColumns:
  - Done
columns:
  - id: todo
    name: Todo
  - id: in-progress
    name: In Progress
  - id: done
    name: Done
---

# Todo

- [ ] Vercel Deployment Prep
  id: vercel-prep
  description: Configure standalone build, cron jobs, and caching.
  tag: devops
  checklist:
    - [ ] Update next.config.ts (standalone)
    - [ ] Create vercel.json (cron)
    - [ ] Implement Reminder Cron API
    - [ ] Implement Caching (unstable_cache)
    - [ ] Add Global Error Boundary

# In Progress

# Done

# Done

- [x] Implement OTP Email Verification
  id: otp-verification
  description: Replace email link with 6-digit OTP code for verification.
  tag: feature
  completed: true

- [x] Add Spam Prevention
  id: spam-prevention
  description: Add CAPTCHA/Turnstile to register/booking forms.
  tag: security
  completed: true

- [x] Robust Double Booking Prevention
  id: double-booking
  description: Refactor createBooking to use Prisma Interactive Transactions.
  tag: security
  completed: true

  id: double-booking
  description: Refactor createBooking to use Prisma Interactive Transactions.
  tag: security

- [ ] Add Spam Prevention
  id: spam-prevention
  description: Add CAPTCHA/Turnstile to register/booking forms.
  tag: security

# In Progress

# Done

- [x] Implement Rate Limiting (Middleware)
  id: rate-limiting
  description: Add Token Bucket rate limiting to /api/auth and public endpoints.
  tag: security
  tag: security

# In Progress

# Done

- [x] Security Audit
  id: security-audit
  description: Evaluate current security posture.
  tag: security
  completed: true

- [x] Settings Page Localization
  id: settings-localization
  description: Localize settings/profile/integrations pages.
  tag: i18n
  completed: true
