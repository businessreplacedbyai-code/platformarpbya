import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import {
  generateApiKey,
  revokeApiKey,
  readNewKey,
  addWebhook,
  deleteWebhook,
  toggleWebhook,
} from "@/lib/portal-integrations";

export const metadata = { title: "Integrări n8n & API · Portal" };

const APP =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const EVENTS = [
  "conversation.created",
  "conversation.completed",
  "agent.deployed",
  "agent.paused",
  "payment.succeeded",
  "lead.qualified",
  "appointment.booked",
  "invoice.issued",
];

const field = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--ink)",
} as const;

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/integrations");

  const [keys, webhooks, newKey] = await Promise.all([
    prisma.clientApiKey.findMany({
      where: { clientId: session.sub, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientWebhook.findMany({
      where: { clientId: session.sub },
      orderBy: { createdAt: "desc" },
    }),
    readNewKey(),
  ]);

  return (
    <div className="max-w-[1000px] space-y-10">
      <div>
        <h1 className="h-display text-3xl mb-1">Integrări n8n & API</h1>
        <p className="text-[14px] text-[var(--ink-2)]">
          Conectează ReplacedByAI cu n8n, Make, Zapier sau aplicația ta.
        </p>
      </div>

      {sp.ok && (
        <div
          className="text-[13px] rounded-xl px-4 py-2.5"
          style={{
            background: "var(--bg-2)",
            border: "1px solid #1F9D55",
            color: "#1F9D55",
          }}
        >
          {sp.ok === "key" ? "Cheie API generată." : "Webhook salvat."}
        </div>
      )}

      {/* API KEYS */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[16px] font-medium mb-2">Chei API</h2>
        <p className="text-[13px] text-[var(--ink-3)] mb-5">
          Folosește o cheie API în n8n / Make / Zapier ca să accesezi datele tale.
        </p>

        {newKey && (
          <div
            className="rounded-xl p-4 mb-5 text-[12.5px] font-mono break-all"
            style={{
              background: "var(--bg)",
              border: "1px dashed var(--border-strong)",
            }}
          >
            <div className="mb-2 font-sans text-[12px]" style={{ color: "#C0392B" }}>
              ⚠️ Copiaz-o ACUM — nu se mai afișează niciodată.
            </div>
            {newKey}
          </div>
        )}

        <form action={generateApiKey} className="flex gap-3 mb-5">
          <input
            name="name"
            placeholder="Nume cheie (ex: n8n integrare CRM)"
            className="flex-1 h-10 rounded-lg px-3 text-[13px] outline-none"
            style={field}
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-lg text-[13px] font-medium"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            Generează cheie
          </button>
        </form>

        <div className="space-y-2">
          {keys.length === 0 && (
            <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              Nicio cheie activă încă.
            </p>
          )}
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-lg px-4 py-2.5"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <span className="text-[13px]">
                {k.name}{" "}
                <span className="font-mono text-[var(--ink-3)]">
                  · {k.prefix}…
                </span>
                {k.lastUsedAt && (
                  <span className="text-[11px] text-[var(--ink-3)] ml-2">
                    folosită {k.lastUsedAt.toLocaleDateString("ro-RO")}
                  </span>
                )}
              </span>
              <form action={revokeApiKey}>
                <input type="hidden" name="id" value={k.id} />
                <button type="submit" className="text-[12px]" style={{ color: "#C0392B" }}>
                  Revocă
                </button>
              </form>
            </div>
          ))}
        </div>

        <div
          className="mt-6 p-4 rounded-lg text-[12.5px] font-mono"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink-2)" }}
        >
          <div className="font-sans text-[11.5px] mb-2 text-[var(--ink-3)]">
            EXEMPLU APEL — în n8n „HTTP Request" node:
          </div>
          GET {APP}/api/v1/agents
          <br />
          Authorization: Bearer rbai_live_…
        </div>
      </section>

      {/* WEBHOOKS */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[16px] font-medium mb-2">Webhooks (n8n / Make)</h2>
        <p className="text-[13px] text-[var(--ink-3)] mb-5">
          Trimitem evenimente HTTP POST către URL-ul tău n8n. Fiecare webhook
          e semnat HMAC-SHA256 cu secret-ul propriu.
        </p>

        <form action={addWebhook} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 mb-6">
          <select name="event" className="h-10 rounded-lg px-3 text-[13px] outline-none" style={field}>
            {EVENTS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <input
            name="url"
            type="url"
            required
            placeholder="https://n8n.ta.ro/webhook/abc-123"
            className="h-10 rounded-lg px-3 text-[13px] outline-none"
            style={field}
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-lg text-[13px] font-medium"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            Adaugă webhook
          </button>
        </form>

        <div className="space-y-2">
          {webhooks.length === 0 && (
            <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              Niciun webhook configurat încă.
            </p>
          )}
          {webhooks.map((w) => (
            <div
              key={w.id}
              className="rounded-lg p-3 flex items-center justify-between gap-4"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium">{w.event}</div>
                <div className="text-[11.5px] text-[var(--ink-3)] truncate font-mono">
                  {w.url}
                </div>
                <div className="text-[10.5px] text-[var(--ink-3)] mt-1">
                  Secret: <code>{w.secret?.slice(0, 12)}…</code>{" "}
                  {w.lastDeliveredAt && (
                    <>
                      · ultima livrare {w.lastDeliveredAt.toLocaleString("ro-RO")}{" "}
                      · status {w.lastStatus ?? "—"}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleWebhook}>
                  <input type="hidden" name="id" value={w.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={(!w.active).toString()}
                  />
                  <button
                    type="submit"
                    className="text-[11px] px-2 py-1 rounded"
                    style={{
                      background: w.active ? "#1F9D55" : "var(--bg-3)",
                      color: w.active ? "#fff" : "var(--ink-3)",
                    }}
                  >
                    {w.active ? "Activ" : "Inactiv"}
                  </button>
                </form>
                <form action={deleteWebhook}>
                  <input type="hidden" name="id" value={w.id} />
                  <button type="submit" className="text-[12px]" style={{ color: "#C0392B" }}>
                    Șterge
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOCS */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[16px] font-medium mb-3">Cum conectezi cu n8n</h2>
        <ol className="space-y-3 text-[13.5px]" style={{ color: "var(--ink-1)" }}>
          <li>
            <strong>1.</strong> Generează o cheie API mai sus.
          </li>
          <li>
            <strong>2.</strong> În n8n, adaugă un „HTTP Request" node cu Authorization Header:
            <code className="block mt-1 px-3 py-2 rounded font-mono text-[12px]"
                  style={{background: "var(--bg)", border: "1px solid var(--border)"}}>
              Authorization: Bearer YOUR_KEY
            </code>
          </li>
          <li>
            <strong>3.</strong> Endpoint-uri disponibile:
            <ul className="ml-4 mt-2 space-y-1 text-[12.5px] font-mono">
              <li>GET <code>{APP}/api/v1/agents</code> — listă agenți</li>
              <li>GET <code>{APP}/api/v1/conversations</code> — conversații</li>
              <li>GET <code>{APP}/api/v1/usage</code> — consum lunar</li>
              <li>POST <code>{APP}/api/v1/trigger/&lt;event&gt;</code> — declanșează un agent</li>
            </ul>
          </li>
          <li>
            <strong>4.</strong> Pentru evenimente push (real-time), adaugă un webhook mai sus
            cu URL-ul n8n. Verifică semnătura HMAC din header
            <code className="mx-1 px-1 py-0.5 rounded font-mono text-[12px]"
                  style={{background: "var(--bg-3)"}}>
              X-ReplacedByAI-Signature
            </code>.
          </li>
        </ol>
      </section>
    </div>
  );
}
