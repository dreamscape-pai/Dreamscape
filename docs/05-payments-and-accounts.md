# Payments & Accounts

## Known context
- Stripe has been set up recently
- A prior festival ticketing site was built using Claude
- Stack used previously:
  - Neon for database
  - Vercel for deployment / hosting

## Requirements
Users can pay online for:
- memberships (monthly recurring)
- event tickets (one-off)
- workshops (one-off)

Pricing needs:
- early bird tickets (time-limited or limited quantity)
- discount codes

Membership admin needs:
- allow "cash/manual" memberships (tracked but not paid through Stripe)
- allow Stripe subscriptions

Accounts/auth:
- Likely need login/profiles for:
  - members
  - admins
- Public users should browse schedule without login

