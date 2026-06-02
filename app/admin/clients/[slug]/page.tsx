import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { type ClientIntake } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, KeyRound, Settings2, Sparkles, Trash2 } from "lucide-react";
import {
  toggleTask,
  addNote,
  updateClientStatus,
} from "../../admin-actions";
import {
  generateClientPassword,
  revokeClientAccess,
  addAgentToClient,
  updateAgentStatus,
  removeAgent,
} from "../../client-actions";
import { agents as catalogAgents } from "@/lib/agents";
import { headers } from "next/headers";
import { CopyButton } from "@/components/admin/CopyButton";
import { AgentStatusSelect } from "@/components/admin/AgentStatusSelect";

const PHASES: { key: string; label: string }[] = [
  { key: "setup", label: "1. Setup" },
  { key: "config", label: "2. Configurare agent" },
  { key: "integrations", label: "3. Integrări" },
  { key: "testing", label: "4. Testare" },
  { key: "preview", label: "5. Preview & Go-live" },
];

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ newPassword?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const client = await prisma.client.findUnique({
    where: { slug },
    include: {
      intake: true,
      tasks: { orderBy: { orderIdx: "asc" } },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
      agents: true,
    },
  });
  if (!client) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const intakeUrl = `${proto}://${host}/intake/${client.intakeToken}`;

  const doneCount = client.tasks.filter((t) => t.done).length;
  const totalCount = client.tasks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <AdminShell>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> Toți clienții
      </Link>

      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Client · {client.plan ?? "fără plan"}</p>
          <h1 className="h-display text-3xl mb-1">{client.businessName}</h1>
          <p className="text-[var(--ink-3)] text-[14px]">
            {client.contactName} · <a className="hover:underline" href={`tel:${client.phone}`}>{client.phone}</a> ·{" "}
            <a className="hover:underline" href={`mailto:${client.email}`}>{client.email}</a>
          </p>
        </div>
        <form
          action={async (fd) => {
            "use server";
            await updateClientStatus(client.id, String(fd.get("status")), client.slug);
          }}
          className="flex items-center gap-2"
        >
          <select
            name="status"
            defaultValue={client.status}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
          >
            <option value="onboarding">onboarding</option>
            <option value="live">live</option>
            <option value="paused">paused</option>
            <option value="churned">churned</option>
          </select>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
          >
            Salvează
          </button>
        </form>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Intake link */}
          <Card title="Link intake pentru client">
            {client.intakeSubmittedAt ? (
              <div className="flex items-center gap-2 text-[14px] text-emerald-700">
                <CheckCircle2 size={16} />
                Formular completat pe{" "}
                {new Date(client.intakeSubmittedAt).toLocaleDateString("ro-RO")}
                <Link
                  href={`/admin/clients/${client.slug}/intake`}
                  className="ml-auto text-[12px] text-[var(--ink)] hover:underline flex items-center gap-1"
                >
                  Vezi răspunsuri <ExternalLink size={12} />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[var(--ink-3)] mb-2">
                  Trimite acest link clientului. Va completa cele 7 secțiuni de care avem nevoie pentru a livra agentul.
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <code className="flex-1 text-[12px] truncate text-[var(--ink-1)]">
                    {intakeUrl}
                  </code>
                  <CopyButton text={intakeUrl} />
                </div>
              </>
            )}
          </Card>

          {/* Agenți client */}
          <Card title={`Agenți (${client.agents.length})`}>
            {client.agents.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-3)] mb-3">Niciun agent atribuit încă.</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {client.agents.map((ca) => {
                  const a = catalogAgents.find((x) => x.slug === ca.agentSlug);
                  return (
                    <li
                      key={ca.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center shrink-0">
                        {a?.icon ? <a.icon size={15} /> : <Sparkles size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium truncate">{a?.name ?? ca.agentSlug}</div>
                        <div className="text-[11.5px] text-[var(--ink-3)] truncate">{a?.role}</div>
                      </div>
                      <form
                        action={async (fd) => {
                          "use server";
                          await updateAgentStatus(ca.id, String(fd.get("status")), client.slug);
                        }}
                      >
                        <AgentStatusSelect defaultValue={ca.status} />
                      </form>
                      <Link
                        href={`/admin/clients/${client.slug}/agents/${ca.id}`}
                        className="p-1.5 text-[var(--ink-3)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--bg-3)] transition-colors"
                        title="Configurează agent"
                      >
                        <Settings2 size={14} />
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await removeAgent(ca.id, client.slug);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-1.5 text-[var(--ink-3)] hover:text-red-600 rounded-lg hover:bg-red-50"
                          aria-label="Șterge"
                        >
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
            <form
              action={async (fd) => {
                "use server";
                const slug = String(fd.get("agentSlug"));
                if (slug) await addAgentToClient(client.id, client.slug, slug);
              }}
              className="flex gap-2"
            >
              <select
                name="agentSlug"
                defaultValue=""
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
                required
              >
                <option value="" disabled>+ Adaugă agent…</option>
                {catalogAgents
                  .filter((a) => !client.agents.find((ca) => ca.agentSlug === a.slug))
                  .map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name} — {a.role}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
              >
                Adaugă
              </button>
            </form>
          </Card>

          {/* Checklist */}
          <Card title={`Implementare — ${doneCount}/${totalCount} (${pct}%)`}>
            <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden mb-5">
              <div className="h-full bg-[var(--ink)]" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-5">
              {PHASES.map((phase) => {
                const tasks = client.tasks.filter((t) => t.phase === phase.key);
                if (tasks.length === 0) return null;
                return (
                  <div key={phase.key}>
                    <h3 className="text-[12px] eyebrow mb-2">{phase.label}</h3>
                    <ul className="space-y-1">
                      {tasks.map((t) => (
                        <li key={t.id}>
                          <form
                            action={async () => {
                              "use server";
                              await toggleTask(t.id, !t.done, client.slug);
                            }}
                          >
                            <button
                              type="submit"
                              className="w-full flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-3)] text-left transition-colors"
                            >
                              {t.done ? (
                                <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle size={16} className="mt-0.5 text-[var(--ink-3)] shrink-0" />
                              )}
                              <span
                                className={`text-[14px] ${
                                  t.done
                                    ? "line-through text-[var(--ink-3)]"
                                    : "text-[var(--ink-1)]"
                                }`}
                              >
                                {t.title}
                              </span>
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Intake completeness */}
          <IntakeCompletenessCard intake={client.intake} slug={client.slug} />

          {/* Notes */}
          <Card title="Note interne">
            <form
              action={async (fd) => {
                "use server";
                await addNote(client.id, String(fd.get("body") ?? ""), client.slug);
              }}
              className="mb-4"
            >
              <textarea
                name="body"
                rows={3}
                required
                placeholder="Adaugă o notă…"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              />
              <button
                type="submit"
                className="mt-2 w-full px-3 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
              >
                Adaugă notă
              </button>
            </form>
            <div className="space-y-3">
              {client.notes.length === 0 ? (
                <p className="text-[12px] text-[var(--ink-3)]">Nimic încă.</p>
              ) : (
                client.notes.map((n) => (
                  <div key={n.id} className="text-[13px] border-l-2 border-[var(--border)] pl-3">
                    <div className="text-[10px] text-[var(--ink-3)] uppercase tracking-wider mb-0.5">
                      {new Date(n.createdAt).toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <p className="text-[var(--ink-1)] whitespace-pre-wrap">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Pricing">
            <Row label="Plan" value={client.plan ?? "—"} />
            <Row label="Setup" value={client.setupFee ? `${(client.setupFee / 100).toFixed(0)} €` : "—"} />
            <Row label="Lunar" value={client.monthlyFee ? `${(client.monthlyFee / 100).toFixed(0)} €` : "—"} />
          </Card>

          {/* Acces portal client */}
          <ClientAccessCard
            clientId={client.id}
            slug={client.slug}
            email={client.email}
            hasPassword={!!client.passwordHash}
            lastLoginAt={client.lastLoginAt}
            newPassword={sp.newPassword}
          />
        </div>
      </div>
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h2 className="text-[13px] font-medium">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-[14px] py-1">
      <span className="w-20 text-[12px] eyebrow text-[var(--ink-3)]">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  );
}

const INTAKE_FIELDS: { key: keyof ClientIntake; label: string }[] = [
  { key: "toneOfVoice", label: "Ton comunicare" },
  { key: "workingHours", label: "Program lucru" },
  { key: "locations", label: "Locații" },
  { key: "services", label: "Servicii oferite" },
  { key: "mainPhone", label: "Telefon principal" },
  { key: "contactEmail", label: "Email contact" },
  { key: "calendarSystem", label: "Calendar" },
  { key: "crmSystem", label: "CRM" },
  { key: "faqText", label: "FAQ-uri" },
  { key: "testerName", label: "Tester" },
];

function intakeScore(intake: ClientIntake | null): { filled: number; total: number; missing: string[] } {
  if (!intake) return { filled: 0, total: INTAKE_FIELDS.length, missing: INTAKE_FIELDS.map((f) => f.label) };
  const missing: string[] = [];
  let filled = 0;
  for (const { key, label } of INTAKE_FIELDS) {
    const val = intake[key];
    if (val !== null && val !== undefined && String(val).trim().length > 0) filled++;
    else missing.push(label);
  }
  return { filled, total: INTAKE_FIELDS.length, missing };
}

function IntakeCompletenessCard({
  intake,
  slug,
}: {
  intake: ClientIntake | null;
  slug: string;
}) {
  const { filled, total, missing } = intakeScore(intake);
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
  const textColor = pct === 100 ? "text-emerald-700" : pct >= 60 ? "text-amber-700" : "text-red-700";

  return (
    <Card title="Completitudine intake">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[13px] font-medium ${textColor}`}>
          {filled}/{total} câmpuri completate
        </span>
        <span className={`text-[12px] font-mono tabular-nums ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-3)] overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {missing.length > 0 && (
        <div className="text-[11.5px] text-[var(--ink-3)] space-y-0.5 mb-3">
          {missing.map((m) => (
            <div key={m} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
              {m}
            </div>
          ))}
        </div>
      )}
      <Link
        href={`/admin/clients/${slug}/intake`}
        className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1"
      >
        <ExternalLink size={11} /> Vizualizează intake complet
      </Link>
    </Card>
  );
}

function ClientAccessCard({
  clientId,
  slug,
  email,
  hasPassword,
  lastLoginAt,
  newPassword,
}: {
  clientId: string;
  slug: string;
  email: string;
  hasPassword: boolean;
  lastLoginAt: Date | null;
  newPassword?: string;
}) {
  return (
    <Card title="Acces portal client">
      {newPassword && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-[11px] eyebrow text-emerald-700 mb-1">Parolă generată (copiaz-o acum)</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[13.5px] font-mono text-emerald-900">{newPassword}</code>
            <CopyButton text={newPassword} />
          </div>
          <p className="text-[11px] text-emerald-700 mt-2">
            Trimite-o clientului pe canal sigur. Nu se va mai afișa niciodată.
          </p>
        </div>
      )}
      <p className="text-[12.5px] text-[var(--ink-3)] mb-3">
        Clientul se loghează la <code className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px]">/login</code> cu emailul <strong>{email}</strong>.
      </p>
      {hasPassword ? (
        <>
          <div className="flex items-center gap-2 text-[13px] text-emerald-700 mb-3">
            <CheckCircle2 size={14} /> Parolă activă
            {lastLoginAt && (
              <span className="text-[var(--ink-3)] ml-auto text-[11.5px]">
                ultim login {new Date(lastLoginAt).toLocaleDateString("ro-RO")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <form
              action={async () => {
                "use server";
                await generateClientPassword(clientId, slug);
              }}
              className="flex-1"
            >
              <button
                type="submit"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-[12.5px] hover:bg-[var(--bg-3)]"
              >
                <KeyRound size={12} className="inline mr-1" /> Resetează parola
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await revokeClientAccess(clientId, slug);
              }}
            >
              <button
                type="submit"
                className="px-3 py-2 rounded-xl border border-red-200 text-red-700 text-[12.5px] hover:bg-red-50"
              >
                Revocă
              </button>
            </form>
          </div>
        </>
      ) : (
        <form
          action={async () => {
            "use server";
            await generateClientPassword(clientId, slug);
          }}
        >
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] flex items-center justify-center gap-2"
          >
            <KeyRound size={14} /> Generează parolă acces portal
          </button>
        </form>
      )}
    </Card>
  );
}

