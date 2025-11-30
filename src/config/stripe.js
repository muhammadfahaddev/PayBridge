const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required in environment variables');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;