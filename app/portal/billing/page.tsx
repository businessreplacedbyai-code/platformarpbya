import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import { BUNDLES, INDUSTRY_BUNDLES, AGENT_PRICES } from "@/lib/pricing";
import { startCheckout, startOneTimePayment, openBillingPortal } from "@/lib/portal-billing";

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
  const planLabel =
    BUNDLES.find((b) => b.key.toLowerCase() === client.planKey)?.name ||
    INDUSTRY_BUNDLES.find((b) => b.key === client.planKey)?.name ||
    "—";

  return (
    <div className="max-w-[1000px] space-y-8">
      <div>
        <h1 className="h-display text-3xl mb-1">Facturare</h1>
        <p className="text-[14px] text-[var(--ink-2)]">
          Gestionează abonamentul, vezi facturile și schimbă cardul.
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
            <p className="text-[12px] text-[var(--ink-3)]">
              Alege un plan ca să activezi facturarea
            </p>
          )}
        </div>
      </section>

      {/* Pachete principale — checkout direct */}
      <section>
        <h2 className="h-display text-xl mb-4">Schimbă sau alege plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {BUNDLES.map((b) => (
            <div
              key={b.key}
              className="rounded-2xl p-5 flex flex-col"
              style={{
                background: "var(--bg-2)",
                border: b.highlight
                  ? "1.5px solid var(--ink)"
                  : "1px solid var(--border)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-3)] mb-1">
                {b.badge}
              </div>
              <div className="text-[18px] font-medium">{b.name}</div>
              <div className="mt-2">
                <span className="text-[28px] font-semibold tracking-tight">
                  €{b.price}
                </span>
                <span className="text-[13px] text-[var(--ink-3)]"> /lună</span>
              </div>
              <div className="text-[11px] text-[var(--ink-3)] mb-4">
                + €{b.setup} setup
              </div>
              <form action={startCheckout} className="mt-auto">
                <input type="hidden" name="planKey" value={b.key.toLowerCase()} />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl text-[13px] font-medium"
                  style={{
                    background: b.highlight ? "var(--ink)" : "var(--bg-3)",
                    color: b.highlight ? "var(--bg)" : "var(--ink)",
                  }}
                >
                  Alege {b.name}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Pachete industrie */}
      <section>
        <h3 className="text-[14px] font-medium mb-3 text-[var(--ink-2)]">
          Pachete pe industrie
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {INDUSTRY_BUNDLES.map((b) => (
            <div
              key={b.key}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-3)]">
                  {b.category}
                </div>
                <div className="text-[16px] font-medium mt-1">{b.name}</div>
                <div className="text-[12px] text-[var(--ink-3)] mt-0.5">
                  €{b.price}/lună + €{b.setup} setup
                </div>
              </div>
              <form action={startCheckout}>
                <input type="hidden" name="planKey" value={b.key} />
                <button
                  type="submit"
                  className="px-4 h-10 rounded-lg text-[13px] font-medium"
                  style={{ background: "var(--ink)", color: "var(--bg)" }}
                >
                  Alege
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Agenți individuali */}
      <section>
        <h3 className="text-[14px] font-medium mb-1 text-[var(--ink-2)]">
          Sau cumperi un singur agent
        </h3>
        <p className="text-[12.5px] text-[var(--ink-3)] mb-3">
          Plătești doar agentul de care ai nevoie. Combinabili oricând.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {AGENT_PRICES.map((a) => (
            <div
              key={a.slug}
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium">{a.name}</div>
                <div className="text-[11.5px] text-[var(--ink-3)] truncate">
                  {a.role} · €{a.monthly}/lună + €{a.setup} setup
                </div>
              </div>
              <form action={startCheckout}>
                <input type="hidden" name="planKey" value={a.slug} />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-lg text-[12.5px] font-medium whitespace-nowrap"
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--ink)",
                  }}
                >
                  Adaugă →
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* One-time payments (mode: payment) — setup independent sau plată unică */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[16px] font-medium mb-1">Plată unică (fără abonament)</h2>
        <p className="text-[13px] text-[var(--ink-3)] mb-5">
          Cumperi doar setup-ul (one-time), fără să te abonezi. Util pentru
          consultanță, configurare independentă sau plată single-shot.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {BUNDLES.map((b) => (
            <form
              key={b.key}
              action={startOneTimePayment}
              className="rounded-xl p-4"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <input type="hidden" name="planKey" value={b.key.toLowerCase()} />
              <input type="hidden" name="kind" value="setup" />
              <div className="text-[13px] font-medium">Setup {b.name}</div>
              <div className="text-[20px] font-semibold mt-1">€{b.setup}</div>
              <div className="text-[11px] text-[var(--ink-3)] mb-3">o singură plată</div>
              <button
                type="submit"
                className="w-full h-9 rounded-lg text-[12.5px] font-medium"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--ink)",
                }}
              >
                Plătește o singură dată →
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
