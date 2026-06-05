// Stripe Payment Links — creează linkuri custom pentru deal-uri pe teren.
import { getStripe } from "@/lib/stripe";

export type CreatePaymentLinkOpts = {
  description: string;
  amount: number;       // cenți (în moneda dată)
  currency?: string;    // "eur" | "ron"
  mode?: "payment" | "subscription";
  recurringInterval?: "month" | "year"; // doar dacă mode = subscription
  clientId?: string | null;
  agentSlug?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  internalNote?: string | null;
};

export type CreatePaymentLinkResult = {
  ok: boolean;
  id?: string;       // stripe payment link id (plink_xxx)
  url?: string;      // URL public Stripe pentru plată
  productId?: string;
  priceId?: string;
  error?: string;
};

const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.replacedbyai.ro";

/**
 * Creează un Stripe Payment Link unic:
 *  1. produs ad-hoc (cu descrierea dată)
 *  2. preț ad-hoc (one-time SAU recurring)
 *  3. payment_link cu metadata pentru webhook (clientId, agentSlug, paymentLinkId-ul DB)
 */
export async function createPaymentLink(
  opts: CreatePaymentLinkOpts,
  paymentLinkDbId: string
): Promise<CreatePaymentLinkResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "stripe_disabled" };

  const currency = (opts.currency ?? "eur").toLowerCase();
  const mode = opts.mode ?? "payment";

  try {
    // 1. Produs ad-hoc
    const product = await stripe.products.create({
      name: opts.description.slice(0, 250),
      metadata: {
        type: "custom_deal",
        paymentLinkDbId,
        ...(opts.clientId ? { clientId: opts.clientId } : {}),
        ...(opts.agentSlug ? { agentSlug: opts.agentSlug } : {}),
      },
    });

    // 2. Preț
    const priceParams: Record<string, unknown> = {
      product: product.id,
      unit_amount: opts.amount,
      currency,
    };
    if (mode === "subscription") {
      priceParams.recurring = { interval: opts.recurringInterval ?? "month" };
    }
    const price = await stripe.prices.create(priceParams as never);

    // 3. Payment Link
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      after_completion: {
        type: "redirect",
        redirect: { url: `${APP_URL}/portal/billing?status=success` },
      },
      ...(opts.customerEmail
        ? { customer_creation: "always" as const }
        : {}),
      metadata: {
        paymentLinkDbId,
        mode: "custom_link",
        ...(opts.clientId ? { clientId: opts.clientId } : {}),
        ...(opts.agentSlug ? { agentSlug: opts.agentSlug } : {}),
        ...(opts.customerEmail ? { prefilledEmail: opts.customerEmail } : {}),
      },
      payment_intent_data:
        mode === "payment"
          ? {
              metadata: {
                paymentLinkDbId,
                mode: "custom_link",
                ...(opts.clientId ? { clientId: opts.clientId } : {}),
                ...(opts.agentSlug ? { agentSlug: opts.agentSlug } : {}),
              },
            }
          : undefined,
      subscription_data:
        mode === "subscription"
          ? {
              metadata: {
                paymentLinkDbId,
                mode: "custom_link",
                ...(opts.clientId ? { clientId: opts.clientId } : {}),
                ...(opts.agentSlug ? { agentSlug: opts.agentSlug } : {}),
              },
            }
          : undefined,
    });

    return {
      ok: true,
      id: link.id,
      url: link.url,
      productId: product.id,
      priceId: price.id,
    };
  } catch (e) {
    const msg = (e as { message?: string })?.message ?? String(e);
    return { ok: false, error: msg };
  }
}

/** Dezactivează un payment link existent (nu se mai pot face plăți noi). */
export async function deactivatePaymentLink(stripeLinkId: string): Promise<{ ok: boolean; error?: string }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "stripe_disabled" };
  try {
    await stripe.paymentLinks.update(stripeLinkId, { active: false });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e as { message?: string })?.message ?? e) };
  }
}
