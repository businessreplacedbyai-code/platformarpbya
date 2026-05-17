import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, {
    // Use the SDK's pinned API version
    typescript: true,
  });
  return cached;
}

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
