import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, Copy, Sparkles, Zap } from "lucide-react";
import { agents as catalogAgents } from "@/lib/agents";
import { generateAgentConfig, type IntakeSnap } from "@/lib/agent-templates";
import { saveAgentConfig, updateAgentStatus } from "../../../../client-actions";
import { CopyButton } from "@/components/admin/CopyButton";
import { AgentStatusSelect } from "@/components/admin/AgentStatusSelect";

const PHASE_LABEL: Record<string, string> = {
  integrare: "🔌 Integrare",
  configurare: "⚙️ Configurare",
  testare: "🧪 Testare",
  "go-live": "🚀 Go-live",
};

export default async function AgentConfigPage({
  params,
}: {
  params: Promise<{ slug: string; agentId: string }>;
}) {
  const { slug, agentId } = await params;

  const clientAgent = await prisma.clientAgent.findUnique({
    where: { id: agentId },
    include: {
      client: {
        include: { intake: true },
      },
    },
  });

  if (!clientAgent || clientAgent.client.slug !== slug) notFound();

  const client = clientAgent.client;
  const intake = client.intake;
  const catalogAgent = catalogAgents.find((a) => a.slug === clientAgent.agentSlug);

  const intakeSnap: IntakeSnap | null = intake
    ? {
        businessName: client.businessName,
        toneOfVoice: intake.toneOfVoice,
        workingHours: intake.workingHours,
        mainPhone: intake.mainPhone,
        contactEmail: intake.contactEmail,
        services: intake.services,
        notOffered: intake.notOffered,
        faqText: intake.faqText,
        calendarSystem: intake.calendarSystem,
        crmSystem: intake.crmSystem,
        locations: intake.locations,
        brandColors: intake.brandColors,
        website: intake.website,
        hasGoogleWorkspace: intake.hasGoogleWorkspace,
        hasMetaBusiness: intake.hasMetaBusiness,
        hasPosErp: intake.hasPosErp,
        hasStripe: intake.hasStripe,
        whatsappActive: intake.whatsappActive,
        address: intake.address,
        testerName: intake.testerName,
        testerPhone: intake.testerPhone,
        testerEmail: intake.testerEmail,
      }
    : null;

  const config = generateAgentConfig(clientAgent.agentSlug, intakeSnap, client.businessName);

  // Grupează pașii pe faze
  const byPhase: Record<string, typeof config.setupSteps> = {};
  for (const step of config.setupSteps) {
    if (!byPhase[step.phase]) byPhase[step.phase] = [];
    byPhase[step.phase].push(step);
  }

  const activePrompt = clientAgent.promptOverride || config.prompt;

  return (
    <AdminShell>
      <Link
        href={`/admin/clients/${slug}`}
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> {client.businessName}
      </Link>

      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center shrink-0">
            {catalogAgent?.icon ? <catalogAgent.icon size={20} /> : <Sparkles size={20} />}
          </div>
          <div>
            <p className="eyebrow mb-1">{catalogAgent?.role ?? clientAgent.agentSlug} · {client.businessName}</p>
            <h1 className="h-display text-2xl">{catalogAgent?.name ?? clientAgent.agentSlug}</h1>
            <p className="text-[13px] text-[var(--ink-3)] mt-1">{catalogAgent?.short}</p>
          </div>
        </div>
        <form
          action={async (fd) => {
            "use server";
            await updateAgentStatus(clientAgent.id, String(fd.get("status")), slug);
          }}
          className="flex items-center gap-2 shrink-0"
        >
          <AgentStatusSelect defaultValue={clientAgent.status} />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
          >
            Salvează
          </button>
        </form>
      </header>

      {/* Warning: date lipsă */}
      {config.missingData.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-amber-800 mb-1">
              Date lipsă din intake — configurația poate fi incompletă
            </p>
            <ul className="text-[12.5px] text-amber-700 space-y-0.5">
              {config.missingData.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coloana principală */}
        <div className="lg:col-span-2 space-y-6">

          {/* Prompt generat */}
          <Card
            title="Prompt generat automat"
            badge={clientAgent.promptOverride ? "personalizat" : "auto din intake"}
            badgeColor={clientAgent.promptOverride ? "blue" : "green"}
          >
            <p className="text-[12px] text-[var(--ink-3)] mb-3">
              {clientAgent.promptOverride
                ? "Folosești versiunea personalizată. Editează mai jos dacă vrei să modifici."
                : "Generat automat din datele de intake. Copiază în VAPI / Make / n8n."}
            </p>
            <div className="relative rounded-xl bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-2)]">
                <span className="text-[11px] font-mono text-[var(--ink-3)]">system_prompt.txt</span>
                <CopyButton text={activePrompt} />
              </div>
              <pre className="p-4 text-[12px] leading-relaxed text-[var(--ink-1)] whitespace-pre-wrap font-mono overflow-x-auto max-h-80 overflow-y-auto">
                {activePrompt}
              </pre>
            </div>
          </Card>

          {/* Pași de setup */}
          <Card title="Pași de setup" badge={`${config.setupSteps.length} pași`} badgeColor="gray">
            <div className="space-y-6">
              {Object.entries(byPhase).map(([phase, steps]) => (
                <div key={phase}>
                  <h3 className="text-[11px] font-medium text-[var(--ink-3)] uppercase tracking-wider mb-3">
                    {PHASE_LABEL[phase] ?? phase}
                  </h3>
                  <div className="space-y-3">
                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[14px] font-medium text-[var(--ink)]">{step.title}</p>
                          {step.copyValue && (
                            <CopyButton text={step.copyValue} />
                          )}
                        </div>
                        <p className="text-[13px] text-[var(--ink-2)] leading-relaxed whitespace-pre-wrap">
                          {step.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Integrări necesare */}
          <Card title="Integrări necesare" badge={`${config.integrations.length}`} badgeColor="gray">
            {config.integrations.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-3)]">Nicio integrare externă necesară.</p>
            ) : (
              <ul className="space-y-2">
                {config.integrations.map((intg) => (
                  <li key={intg} className="flex items-center gap-2 text-[13.5px]">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    {intg}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-[var(--border)] text-[12px] text-[var(--ink-3)] space-y-1">
              <p>Din intake — acces confirmat:</p>
              {intake?.hasGoogleWorkspace && <p className="text-emerald-700">✓ Google Workspace</p>}
              {intake?.hasMetaBusiness && <p className="text-emerald-700">✓ Meta Business</p>}
              {intake?.hasPosErp && <p className="text-emerald-700">✓ POS/ERP</p>}
              {intake?.hasStripe && <p className="text-emerald-700">✓ Stripe</p>}
              {intake?.whatsappActive && <p className="text-emerald-700">✓ WhatsApp Business</p>}
              {!intake?.hasGoogleWorkspace && !intake?.hasMetaBusiness && !intake?.hasPosErp && !intake?.hasStripe && !intake?.whatsappActive && (
                <p className="text-[var(--ink-3)]">Nicio integrare confirmată în intake.</p>
              )}
            </div>
          </Card>

          {/* Date cheie din intake */}
          {intake && (
            <Card title="Date cheie din intake" badgeColor="gray">
              <div className="space-y-2 text-[13px]">
                <IntakeRow label="Telefon" value={intake.mainPhone} />
                <IntakeRow label="Email" value={intake.contactEmail} />
                <IntakeRow label="Program" value={intake.workingHours} />
                <IntakeRow label="Calendar" value={intake.calendarSystem} />
                <IntakeRow label="CRM" value={intake.crmSystem} />
                <IntakeRow label="Ton" value={intake.toneOfVoice} />
                <IntakeRow label="Locații" value={intake.locations} />
                <IntakeRow label="Tester" value={intake.testerName ? `${intake.testerName} · ${intake.testerPhone ?? ""}` : null} />
              </div>
              <Link
                href={`/admin/clients/${slug}/intake`}
                className="mt-4 inline-flex items-center gap-1 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                Vezi toate datele intake →
              </Link>
            </Card>
          )}

          {/* Editor prompt / note custom */}
          <Card title="Configurare manuală" badge="override" badgeColor="gray">
            <form
              action={async (fd) => {
                "use server";
                await saveAgentConfig(
                  clientAgent.id,
                  slug,
                  String(fd.get("configNotes") ?? ""),
                  String(fd.get("promptOverride") ?? "")
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">
                  Note configurare
                </label>
                <textarea
                  name="configNotes"
                  rows={4}
                  defaultValue={clientAgent.configNotes ?? ""}
                  placeholder="Notițe interne despre configurare, decizii, link-uri..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">
                  Prompt personalizat{" "}
                  <span className="text-[10px] font-normal normal-case text-[var(--ink-3)]">
                    (lasă gol pentru a folosi cel generat automat)
                  </span>
                </label>
                <textarea
                  name="promptOverride"
                  rows={10}
                  defaultValue={clientAgent.promptOverride ?? ""}
                  placeholder="Paste prompt-ul final personalizat dacă diferă de cel generat..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Salvează configurarea
              </button>
              {clientAgent.updatedAt && (
                <p className="text-[11px] text-center text-[var(--ink-3)]">
                  Ultima modificare: {new Date(clientAgent.updatedAt).toLocaleString("ro-RO")}
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Card({
  title,
  badge,
  badgeColor = "gray",
  children,
}: {
  title: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "gray";
  children: React.ReactNode;
}) {
  const badgeClass =
    badgeColor === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : badgeColor === "blue"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-[var(--bg-3)] text-[var(--ink-3)] border-[var(--border)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="text-[13px] font-medium">{title}</h2>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function IntakeRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-[11px] eyebrow text-[var(--ink-3)] w-16 shrink-0 mt-0.5">{label}</span>
      <span className="text-[var(--ink-1)] break-all">{value}</span>
    </div>
  );
}
