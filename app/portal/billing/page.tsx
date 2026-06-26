import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import { getPlan } from "@/lib/plan-limits";
import { openBillingPortal } from "@/lib/portal-billing";

export const metadata = { title: "Facturare · Portal ReplacedByAI" };

const STATUS_LABEL: Record<string, { t: string; color: string }> = {
  active: { t: "Activ", color: "#1F9D55" },
  trialing: { t: "Trial", color: "#B8860B" },
  past_due: { t: "Plată întârziată", color: "#C0392B" },
  canceled: { t: "Anulat", color: "#888" },
  inactive: { t: "Inactiv", color: "#888" },
};

const BANNERS: Record<string, { t: string; ok: boolean }> = {
  success: { t: "Abonament activat. Mulțumim!", ok: true },
  onetime_success: { t: "Plată unică încasată. Mulțumim!", ok: true },
  cancel: { t: "Plata a fost anulată. Poți încerca din nou.", ok: false },
  missing_price: { t: "Acest plan nu e configurat încă (lipsește price ID în Stripe).", ok: false },
  no_customer: { t: "Nu ai încă un client Stripe — alege un plan întâi.", ok: false },
  disabled: { t: "Stripe nu e activat momentan.", ok: false },
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/billing");

  const client = await prisma.client.findUnique({
    where: { id: session.sub },
    select: {
      businessName: true,
      planKey: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });
  if (!client) redirect("/login");

  const status = client.subscriptionStatus || "inactive";
  const badge = STATUS_LABEL[status] || STATUS_LABEL.inactive;
  const banner = sp.status ? BANNERS[sp.status] : null;
  const planLabel = client.planKey ? getPlan(client.planKey).name : "—";

  return (
    <div className="max-w-[1000px] space-y-8">
      <div>
        <h1 className="h-display text-3xl mb-1">Facturare</h1>
        <p className="text-[14px] text-[var(--ink-2)]">
          Gestionează abonamentul, vezi facturile și schimbă cardul. Plată securizată prin Stripe.
        </p>
      </div>

      {banner && (
        <div
          className="text-[13px] rounded-xl px-4 py-3"
          style={{
            background: "var(--bg-2)",
            border: `1px solid ${banner.ok ? "#1F9D55" : "var(--border)"}`,
            color: banner.ok ? "#1F9D55" : "var(--ink-1)",
          }}
        >
          {banner.t}
        </div>
      )}

      {/* Plan curent */}
      <section
        className="rounded-2xl p-6 grid md:grid-cols-3 gap-6 items-center"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-3)] mb-2">
            Plan curent
          </div>
          <div className="text-[22px] font-medium">{planLabel}</div>
          <div
            className="text-[12px] mt-1.5 inline-flex items-center gap-2 px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-3)", color: badge.color }}
          >
            <span style={{ color: badge.color }}>●</span>
            {badge.t}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-3)] mb-2">
            Reînnoire
          </div>
          <div className="text-[16px]">
            {client.currentPeriodEnd
              ? client.currentPeriodEnd.toLocaleDateString("ro-RO")
              : "—"}
          </div>
        </div>

        <div className="text-right">
          {client.stripeCustomerId ? (
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="px-5 h-11 rounded-xl text-[13px] font-medium"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--ink)",
                }}
              >
                Gestionează în Stripe →
              </button>
            </form>
          ) : (
            <Link
              href="/portal/extra"
              className="inline-block px-5 h-11 leading-[2.75rem] rounded-xl text-[13px] font-medium"
              style={{ background: "var(--ink)", color: "var(--bg-2)" }}
            >
              Cere o ofertă →
            </Link>
          )}
        </div>
      </section>

      {/* Schimbă plan / extra */}
      <section className="grid md:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-[16px] font-medium mb-1">Schimbă planul</h2>
          <p className="text-[13px] text-[var(--ink-3)] mb-5 flex-1">
            Vrei să treci pe alt pachet sau să adaugi un agent? Ne ceri și-ți
            configurăm noi totul — fără bătaie de cap. Factura se emite automat în RON.
          </p>
          <Link
            href="/portal/extra"
            className="inline-block self-start px-5 h-10 leading-[2.5rem] rounded-xl text-[13px] font-medium"
            style={{ background: "var(--ink)", color: "var(--bg-2)" }}
          >
            Cere schimbare →
          </Link>
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-[16px] font-medium mb-1">Minute & generări extra</h2>
          <p className="text-[13px] text-[var(--ink-3)] mb-5 flex-1">
            Ai nevoie de mai mult decât include planul? Cumperi minute de voce, generări AI
            sau un agent în plus, fără să schimbi planul.
          </p>
          <Link
            href="/portal/extra"
            className="inline-block self-start px-5 h-10 leading-[2.5rem] rounded-xl text-[13px] font-medium"
            style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border-strong)",
              color: "var(--ink)",
            }}
          >
            Vezi extra →
          </Link>
        </div>
      </section>

      {/* Facturi */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[16px] font-medium mb-1">Facturi</h2>
        <p className="text-[13px] text-[var(--ink-3)] mb-5">
          Facturile fiscale (RON, e-Factura) se emit automat la fiecare plată. Le descarci
          oricând din portalul de facturare Stripe.
        </p>
        {client.stripeCustomerId ? (
          <form action={openBillingPortal}>
            <button
              type="submit"
              className="px-5 h-10 rounded-xl text-[13px] font-medium"
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border-strong)",
                color: "var(--ink)",
              }}
            >
              Deschide facturile în Stripe →
            </button>
          </form>
        ) : (
          <p className="text-[12.5px] text-[var(--ink-3)]">
            Disponibile după prima plată.
          </p>
        )}
      </section>
    </div>
  );
}
