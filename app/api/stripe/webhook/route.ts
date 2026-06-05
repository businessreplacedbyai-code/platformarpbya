import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { createInvoice, fromStripeAmount, smartBillEnabled } from "@/lib/smartbill";
import { provisionForPlan, provisionAgent } from "@/lib/provisioning";

export const runtime = "nodejs"; // need raw body for signature verification

// Emite factură SmartBill pentru un client (după plată). Nu blochează webhook-ul.
async function issueInvoice(opts: {
  clientId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  amount: number;        // cenți Stripe
  currency: string;
  description: string;
}) {
  if (!smartBillEnabled() || opts.amount <= 0) return;
  try {
    let name = opts.customerName ?? null;
    let email = opts.customerEmail ?? null;
    let vatCode: string | null = null;
    let address: string | null = null;
    let city: string | null = null;

    if (opts.clientId) {
      const c = await prisma.client.findUnique({ where: { id: opts.clientId } });
      if (c) {
        name = c.businessName || name;
        email = c.email || email;
        vatCode = (c as { cui?: string | null }).cui ?? null;
        city = (c as { city?: string | null }).city ?? null;
      }
    }
    if (!name) name = email || "Client";

    const res = await createInvoice({
      client: { name, email, vatCode, address, city, isTaxPayer: !!vatCode },
      items: [{
        name: opts.description,
        price: fromStripeAmount(opts.amount),
        currency: opts.currency.toUpperCase(),
        measuringUnit: "serviciu",
        isTaxIncluded: true,
        taxPercentage: 19,
      }],
      currency: opts.currency.toUpperCase(),
      sendEmail: true,
    });
    if (!res.ok) console.error("SmartBill invoice failed:", res.error);
    else console.log("SmartBill invoice issued:", res.series, res.number);
  } catch (e) {
    console.error("SmartBill issueInvoice error:", e);
  }
}

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
        const paymentLinkDbId = s.metadata?.paymentLinkDbId;

        // ─── Stripe Payment Link custom (deal pe teren) ─────────────────
        if (paymentLinkDbId) {
          try {
            await prisma.paymentLink.update({
              where: { id: paymentLinkDbId },
              data: {
                status: "paid",
                paidAt: new Date(),
                stripeSessionId: s.id,
                customerEmail: s.customer_details?.email ?? undefined,
                customerName: s.customer_details?.name ?? undefined,
              },
            });
            // Emite factură Oblio
            const pl = await prisma.paymentLink.findUnique({ where: { id: paymentLinkDbId } });
            if (pl) {
              await issueInvoice({
                clientId: pl.clientId,
                customerEmail: s.customer_details?.email ?? pl.customerEmail,
                customerName: s.customer_details?.name ?? pl.customerName,
                amount: s.amount_total ?? pl.amount,
                currency: s.currency ?? pl.currency,
                description: pl.description,
              });
              // Provisionează agentul legat (dacă există)
              if (pl.clientId && pl.agentSlug) {
                await provisionAgent(pl.clientId, pl.agentSlug, { skipSlotCheck: true });
              }
            }
          } catch (e) {
            console.error("PaymentLink handler error:", e);
          }
        }

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

        // Auto-provision agent (creează ClientAgent + activează n8n + webhook)
        if (clientId && agentSlug) {
          await provisionAgent(clientId, agentSlug, { skipSlotCheck: true });
        }

        // ─── One-time payment (mode: "payment") — log Payment ───
        if (s.mode === "payment" && clientId && s.metadata?.mode === "onetime") {
          await prisma.payment.create({
            data: {
              clientId,
              stripeSessionId: s.id,
              stripeIntentId:
                typeof s.payment_intent === "string" ? s.payment_intent : null,
              amount: s.amount_total ?? 0,
              currency: s.currency ?? "eur",
              status: "paid",
              paidAt: new Date(),
              description: `One-time · ${s.metadata?.planKey ?? "purchase"} (${
                s.metadata?.kind ?? "setup"
              })`,
              agentSlug: s.metadata?.planKey ?? null,
              metadata: JSON.stringify(s.metadata ?? {}),
            },
          });

          // Factură SmartBill pentru plata one-time (ex: Pilot €99, setup)
          await issueInvoice({
            clientId,
            customerEmail: s.customer_details?.email ?? null,
            customerName: s.customer_details?.name ?? null,
            amount: s.amount_total ?? 0,
            currency: s.currency ?? "eur",
            description: `${s.metadata?.planKey ?? "Serviciu"} — ${s.metadata?.kind ?? "plată unică"}`,
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
      // ─── Abonament client (Growth/Scale/Enterprise/…) ─────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          customer: string;
          status: string;
          current_period_end?: number;
          metadata?: { clientId?: string; planKey?: string };
        };
        const clientId = sub.metadata?.clientId;
        const planKey = sub.metadata?.planKey;
        if (clientId) {
          await prisma.client.update({
            where: { id: clientId },
            data: {
              stripeSubscriptionId: sub.id,
              stripeCustomerId: sub.customer,
              subscriptionStatus: sub.status,
              planKey: planKey ?? undefined,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });

          // La PRIMA creare a abonamentului → provisioning automat:
          // bundle industrie = agenți ficși; pachet generic = sloturi de ales.
          if (event.type === "customer.subscription.created" && planKey) {
            await provisionForPlan(clientId, planKey);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as {
          id: string;
          metadata?: { clientId?: string };
        };
        if (sub.metadata?.clientId) {
          await prisma.client.update({
            where: { id: sub.metadata.clientId },
            data: { subscriptionStatus: "canceled" },
          });
        }
        break;
      }
      // ─── Factură de abonament plătită (lunar) → factură SmartBill ─────
      case "invoice.payment_succeeded": {
        const inv = event.data.object as {
          customer?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          amount_paid?: number;
          currency?: string;
          billing_reason?: string;
          lines?: { data?: Array<{ description?: string | null }> };
          subscription?: string;
        };
        // Sărim peste prima factură dacă a fost deja gestionată ca checkout one-time;
        // facturăm abonamentele recurente (și prima lunară).
        const customerId = inv.customer;
        let clientId: string | null = null;
        if (customerId) {
          const c = await prisma.client.findFirst({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
          clientId = c?.id ?? null;
        }
        const desc =
          inv.lines?.data?.[0]?.description ||
          "Abonament ReplacedByAI";
        await issueInvoice({
          clientId,
          customerEmail: inv.customer_email ?? null,
          customerName: inv.customer_name ?? null,
          amount: inv.amount_paid ?? 0,
          currency: inv.currency ?? "eur",
          description: desc,
        });
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
