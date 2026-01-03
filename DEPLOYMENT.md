# Dreamscape MVP - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup

#### Neon Postgres
1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add to `.env` as `DATABASE_URL`

#### Clerk Authentication
1. Create a new application at [clerk.com](https://clerk.com)
2. Get your publishable and secret keys
3. Add to `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Configure allowed redirect URLs in Clerk dashboard:
   - `http://localhost:3000` (dev)
   - `https://your-domain.com` (production)

#### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Add to `.env`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
4. Set up webhook:
   - Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Database Migration

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run db:seed
```

### 3. Create Admin User

After deploying and signing up through the website:

```sql
-- Connect to your Neon database
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 4. Stripe Products Setup

For each product/membership you want to sell:

1. Create product in Stripe Dashboard
2. Create price for that product
3. Copy Product ID and Price ID
4. In admin panel (`/admin`):
   - For one-off items: Create Product with Stripe IDs
   - For memberships: Create Membership Plan with Stripe IDs

## Vercel Deployment

### Initial Setup

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial Dreamscape MVP"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure project:
   - Framework: Next.js
   - Root directory: `./`
   - Build command: `npm run build`
   - Output directory: `.next`

### Environment Variables

Add all environment variables from `.env` to Vercel:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

5. Deploy

### Post-Deployment

1. Update Clerk allowed domains
2. Update Stripe webhook URL
3. Test full flow:
   - Browse schedules
   - Sign up
   - Make yourself admin
   - Create spaces and events
   - Test checkout flow
   - Test membership subscription

## Content Setup

### 1. Create Spaces

In `/admin/spaces/new`, create all your spaces:
- The Aerial Shala
- The Dance Studio
- The Dome
- The Amphitheater
- The Bamboo Circle
- The Cafe
- Sauna Lounge
- The Micro Gym
- The Stretch Tent
- Bamboo Shala

### 2. Create Events

In `/admin/events/new`, create your upcoming events:
- Set title, description, times
- Assign to one or multiple spaces
- Set capacity
- Link to products (if ticketed)
- Publish when ready

### 3. Set Up Products

If selling tickets or workshop spots:
1. Create product in Stripe
2. Create matching product in admin
3. Link to events

### 4. Set Up Memberships

1. Create subscription products in Stripe
2. Create membership plans in admin with Stripe IDs
3. Plans will appear on `/memberships` page

## Testing

### Public Flow
1. Browse schedule at `/schedule`
2. View spaces at `/spaces`
3. Sign up for membership at `/memberships`
4. Complete Stripe checkout
5. Verify webhook received
6. Check order in database

### Admin Flow
1. Sign in as admin
2. Access `/admin`
3. Create/edit spaces
4. Create/edit events with multi-space assignment
5. Verify schedules update
6. Test publish/unpublish

### Schedule Export
Test the image export:
```
https://your-domain.com/api/schedule-image?weekStart=2026-01-06
```

Use this for Instagram posts!

## Monitoring

### Key Metrics
- Stripe Dashboard: Payment success rate
- Clerk Dashboard: User signups
- Vercel Analytics: Page views, performance
- Neon Dashboard: Database usage

### Error Monitoring
Check Vercel logs for:
- API route errors
- Build failures
- Runtime errors

## Maintenance

### Regular Tasks
- Review Stripe payments weekly
- Check user signups and upgrade admins as needed
- Update schedule regularly
- Export weekly schedule images for social media

### Database Backups
Neon provides automatic backups. Configure retention period in dashboard.

## Support

For issues:
1. Check Vercel deployment logs
2. Check Stripe webhook logs
3. Check browser console for client errors
4. Review database queries in Neon

## Future Enhancements (Phase 2)

- Interactive birds-eye map homepage
- Member booking system for training slots
- Equipment-level availability
- Residency/festival applications
- Photo galleries
- Press kit page
- Advanced admin analytics
