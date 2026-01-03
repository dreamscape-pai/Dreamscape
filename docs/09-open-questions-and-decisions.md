# Open Questions & Decisions Log

Use this file to track decisions made during implementation.

## Decisions (fill in as you go)
- Auth provider: Clerk (as specified in CLAUDE.md)
- Admin roles model: Using UserRole enum (PUBLIC, MEMBER, ADMIN) stored in User model
- Schedule UI library: Custom React components (simple table/grid views for MVP)
- Schedule export implementation: Planned - API route using canvas or Puppeteer to generate PNG

## Open questions (answer later)
- Do we keep Google Calendar as the source of truth initially, or migrate scheduling fully into the admin dashboard?
- Do memberships include any booking entitlements in MVP, or only Phase 2?
- Ticket capacity rules: per event only, or per space per event?
- Refund policy / terms pages needed?
- Required languages (English only initially)?
- Photo/media source: manual uploads, Instagram embeds, or both?

