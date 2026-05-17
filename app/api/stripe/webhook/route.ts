import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // need raw body for signature verification

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe_disabled" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no_signature" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const paymentId = s.metadata?.paymentId;
        const agentSlug = s.metadata?.agentSlug;
        const clientId = s.metadata?.clientId;

        if (paymentId) {
          await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: "paid",
              paidAt: new Date(),
              stripeIntentId: typeof s.payment_intent === "string" ? s.payment_intent : null,
            },
          });
        }

        // Auto-provision agent ca planned dacă plata e legată de un agent
        if (clientId && agentSlug) {
          await prisma.clientAgent.upsert({
            where: { clientId_agentSlug: { clientId, agentSlug } },
            update: { status: "planned" },
            create: { clientId, agentSlug, status: "planned" },
          });
        }
        break;
      }
      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const obj = event.data.object as { metadata?: { paymentId?: string } };
        const paymentId = obj.metadata?.paymentId;
        if (paymentId) {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: "failed" },
          });
        }
        break;
      }
      default:
        // ignore other events
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
