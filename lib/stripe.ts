// Temporarily commented out for MVP deployment without Stripe
// Uncomment when Stripe keys are configured

// import Stripe from 'stripe'
//
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('STRIPE_SECRET_KEY is not set')
// }
//
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2025-12-15.clover',
//   typescript: true,
// })

// Temporary export to prevent import errors
export const stripe = null as any
