import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const schema = z.object({
  agentSlug: z.string().min(2),
  amount: z.number().int().positive().optional(), // EUR cenți
  description: z.string().optional(),
});

export async function POST(req: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "stripe_disabled" }, { status: 503 });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "stripe_unavailable" }, { status: 503 });

  const session = await getClientSession();
  if (!session?.clientSlug) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug } });
  if (!client) return NextResponse.json({ error: "client_not_found" }, { status: 404 });

  // Default setup fee fallback (EUR 290 = 29000 cenți)
  const amount = body.amount ?? 29000;
  const description = body.description ?? `Setup agent ${body.agentSlug}`;

  // Pre-create local Payment record
  const payment = await prisma.payment.create({
    data: {
      clientId: client.id,
      amount,
      currency: "eur",
      status: "pending",
      description,
      agentSlug: body.agentSlug,
    },
  });

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: client.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: description },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/portal/marketplace?paid=1`,
    cancel_url: `${SITE_URL}/portal/marketplace?canceled=1`,
    metadata: {
      paymentId: payment.id,
      clientId: client.id,
      agentSlug: body.agentSlug,
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: checkout.id, metadata: JSON.stringify({ url: checkout.url }) },
  });

  return NextResponse.json({ url: checkout.url });
}
