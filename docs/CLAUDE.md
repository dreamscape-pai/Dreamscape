# Dreamscape Website (Pai) — Instructions for Claude Code

## Stack assumptions
- Deploy: Vercel
- Database: Neon Postgres
- ORM: Prisma
- Payments: Stripe (one-off purchases + subscriptions)
- Auth: choose Clerk unless there is a strong reason not to

## Ground truth
- Everything in /docs is factual project context.
- Do not invent venue-specific facts, schedules, or policies beyond /docs.
- Use placeholders when content is unknown.

## Build approach
- Ship an MVP first, then leave hooks for Phase 2 (interactive map, advanced member booking).
- Prefer simple, robust implementations over fancy ones.
- Make sensible defaults when ambiguous; record them in docs/09-open-questions-and-decisions.md.

## Quality
- SEO-friendly pages
- Basic admin capability
- Clear data model for events, spaces, products, memberships
