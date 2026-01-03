# Dreamscape Website

A production website for Dreamscape, a creation center in Pai, Northern Thailand that combines Technology + Circus + Wellness.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon Postgres
- **ORM**: Prisma
- **Authentication**: Clerk
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Features

### Public Features
- Home page with brand messaging
- Venue-wide and per-space schedules (day/week views)
- Spaces browser with individual schedules
- Membership plans with Stripe subscriptions
- Event browsing and ticket purchases
- Cafe menu and contact pages

### Admin Features
- Spaces CRUD with publish/unpublish
- Events CRUD with multi-space assignment
- Products and memberships management
- Admin-only access protection

### Integrations
- Stripe for payments (one-off & subscriptions)
- Clerk for authentication
- Schedule image export API for social media

## Getting Started

### Prerequisites
- Node.js 20.9.0+
- PostgreSQL (Neon recommended)
- Clerk account
- Stripe account

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials

3. Set up database:
```bash
npx prisma migrate dev
npm run db:seed
```

4. Run development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Admin Access

1. Sign up via the website
2. Update user role in database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```
3. Access admin at `/admin`

## Key Routes

- `/` - Home
- `/schedule` - Venue-wide schedule
- `/spaces/[slug]` - Space detail with schedule
- `/memberships` - Membership plans
- `/admin` - Admin dashboard
- `/api/schedule-image?weekStart=YYYY-MM-DD` - Schedule image export

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## Documentation

See `/docs` for detailed project documentation including vision, features, and technical decisions.
