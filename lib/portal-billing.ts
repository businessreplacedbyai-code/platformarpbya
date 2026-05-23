"use server";
// Server actions pentru abonament Stripe — apelate din /portal/billing.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getClientSession } from "@/lib/auth";

const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

// Map planKey → Stripe priceId (din env). Creezi produsele în Stripe și
// pui ID-urile în .env.local: STRIPE_PRICE_GROWTH=price_xxx etc.
const PRICE_IDS: Record<string, string | undefined> = {
  growth: process.env.STRIPE_PRICE_GROWTH,
  scale: process.env.STRIPE_PRICE_SCALE,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  horeca: process.env.STRIPE_PRICE_HORECA,
  medical: process.env.STRIPE_PRICE_MEDICAL,
  // single-agent prices
  voicebot: process.env.STRIPE_PRICE_VOICEBOT,
  schedulerbot: process.env.STRIPE_PRICE_SCHEDULERBOT,
  supportbot: process.env.STRIPE_PRICE_SUPPORTBOT,
  salesbot: process.env.STRIPE_PRICE_SALESBOT,
  socialbot: process.env.STRIPE_PRICE_SOCIALBOT,
  accountbot: process.env.STRIPE_PRICE_ACCOUNTBOT,
  contentbot: process.env.STRIPE_PRICE_CONTENTBOT,
  reviewbot: process.env.STRIPE_PRICE_REVIEWBOT,
  designbot: process.env.STRIPE_PRICE_DESIGNBOT,
  hrbot: process.env.STRIPE_PRICE_HRBOT,
};

// Setup one-time price IDs — adăugat automat la primul checkout subscription.
// Toate sunt prețuri non-recurring pe același produs.
const SETUP_IDS: Record<string, string | undefined> = {
  growth: process.env.STRIPE_PRICE_GROWTH_SETUP,
  scale: process.env.STRIPE_PRICE_SCALE_SETUP,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_SETUP,
  horeca: process.env.STRIPE_PRICE_HORECA_SETUP,
  medical: process.env.STRIPE_PRICE_MEDICAL_SETUP,
  voicebot: process.env.STRIPE_PRICE_VOICEBOT_SETUP,
  schedulerbot: process.env.STRIPE_PRICE_SCHEDULERBOT_SETUP,
  supportbot: process.env.STRIPE_PRICE_SUPPORTBOT_SETUP,
  salesbot: process.env.STRIPE_PRICE_SALESBOT_SETUP,
  socialbot: process.env.STRIPE_PRICE_SOCIALBOT_SETUP,
  accountbot: process.env.STRIPE_PRICE_ACCOUNTBOT_SETUP,
  contentbot: process.env.STRIPE_PRICE_CONTENTBOT_SETUP,
  reviewbot: process.env.STRIPE_PRICE_REVIEWBOT_SETUP,
  designbot: process.env.STRIPE_PRICE_DESIGNBOT_SETUP,
  hrbot: process.env.STRIPE_PRICE_HRBOT_SETUP,
};

async function ensureCustomer(clientId: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("stripe_disabled");
  const c = await prisma.client.findUnique({ where: { id: clientId } });
  if (!c) throw new Error("client_not_found");
  if (c.stripeCustomerId) return { stripe, customerId: c.stripeCustomerId, client: c };

  const customer = await stripe.customers.create({
    email: c.email,
    name: c.businessName,
    phone: c.phone,
    metadata: { clientId: c.id, slug: c.slug },
  });
  await prisma.client.update({
    where: { id: c.id },
    data: { stripeCustomerId: customer.id },
  });
  return { stripe, customerId: customer.id, client: c };
}

export async function startCheckout(formData: FormData) {
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/billing");

  const planKey = String(formData.get("planKey") || "");
  const priceId = PRICE_IDS[planKey];
  if (!priceId) redirect("/portal/billing?status=missing_price");

  const { stripe, customerId, client } = await ensureCustomer(session.sub);

  // Construim line_items: abonament lunar + setup one-time (doar la primul checkout).
  type LineItem = { price: string; quantity: number };
  const line_items: LineItem[] = [{ price: priceId, quantity: 1 }];
  const setupId = SETUP_IDS[planKey];
  const isFirstCheckout = !client.stripeSubscriptionId;
  if (setupId && isFirstCheckout) {
    line_items.push({ price: setupId, quantity: 1 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${APP_URL}/portal/billing?status=success`,
    cancel_url: `${APP_URL}/portal/billing?status=cancel`,
    subscription_data: { metadata: { clientId: session.sub, planKey } },
    metadata: { clientId: session.sub, planKey },
  });

  if (checkout.url) redirect(checkout.url);
  redirect("/portal/billing?status=error");
}

export async function openBillingPortal() {
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/billing");
  const stripe = getStripe();
  if (!stripe) redirect("/portal/billing?status=disabled");

  const c = await prisma.client.findUnique({ where: { id: session.sub } });
  if (!c?.stripeCustomerId) redirect("/portal/billing?status=no_customer");

  const portal = await stripe.billingPortal.sessions.create({
    customer: c.stripeCustomerId,
    return_url: `${APP_URL}/portal/billing`,
  });
  redirect(portal.url);
}
