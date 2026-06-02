import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Users,
  Wallet,
  Clock,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  updateLeadStatus,
  updateLeadNotes,
  convertLeadToClient,
  replyToLead,
  setLeadFollowUp,
} from "../../admin-actions";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const painPoints = safeParse<string[]>(lead.painPoints);
  const agentsWanted = safeParse<string[]>(lead.agentsWanted);
  const scoreBand =
    lead.score >= 65
      ? { tone: "red", label: "HOT" }
      : lead.score >= 35
      ? { tone: "amber", label: "WARM" }
      : { tone: "slate", label: "COLD" };

  return (
    <AdminShell>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> Înapoi la leads
      </Link>

      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Lead</p>
          <h1 className="h-display text-3xl mb-1">{lead.business}</h1>
          <p className="text-[var(--ink-3)] text-[13px]">
            Primit{" "}
            {new Date(lead.createdAt).toLocaleString("ro-RO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {lead.sector && <> · {lead.sector}</>}
            {lead.city && <> · {lead.city}</>}
          </p>
        </div>

        <ScorePill score={lead.score} band={scoreBand} />
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Date contact">
            <Row icon={Building2} label="Business" value={lead.business} />
            {lead.cui && (
              <Row
                icon={Building2}
                label="CUI"
                value={
                  <span>
                    {lead.cui}{" "}
                    {lead.cuiValid ? (
                      <span className="text-emerald-700 text-[11px]">✓ validat ANAF</span>
                    ) : (
                      <span className="text-amber-600 text-[11px]">neverificat</span>
                    )}
                  </span>
                }
              />
            )}
            <Row icon={Users} label="Contact" value={lead.name} />
            <Row
              icon={Phone}
              label="Telefon"
              value={
                <a className="hover:underline" href={`tel:${lead.phone}`}>
                  {lead.phone}
                </a>
              }
            />
            <Row
              icon={Mail}
              label="Email"
              value={
                <a className="hover:underline" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              }
            />
            {lead.website && (
              <Row
                icon={Globe}
                label="Website"
                value={
                  <a
                    className="hover:underline"
                    href={lead.website}
                    target="_blank"
                    rel="noopener"
                  >
                    {lead.website}
                  </a>
                }
              />
            )}
            {lead.city && <Row icon={MapPin} label="Oraș" value={lead.city} />}
          </Card>

          <Card title="Calificare">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <Pill icon={Users} label="Echipă" value={lead.employees ?? "—"} />
              <Pill icon={Wallet} label="Buget/lună" value={lead.monthlyBudget ?? "—"} />
              <Pill icon={Clock} label="Urgență" value={lead.urgency ?? "—"} />
              <Pill icon={Sparkles} label="Sector" value={lead.sector ?? "—"} />
            </div>

            {painPoints.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] eyebrow mb-2">Durerile clientului</div>
                <div className="flex flex-wrap gap-1.5">
                  {painPoints.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {agentsWanted.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] eyebrow mb-2">Agenți de interes</div>
                <div className="flex flex-wrap gap-1.5">
                  {agentsWanted.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-full bg-[var(--bg-3)] border border-[var(--border)] text-[11.5px]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {lead.message && (
            <Card title="Mesaj">
              <p className="text-[14px] text-[var(--ink-1)] whitespace-pre-wrap leading-relaxed">
                {lead.message}
              </p>
            </Card>
          )}

          {lead.scoreReason && (
            <Card title="Cum a fost calculat scorul">
              <p className="text-[12.5px] text-[var(--ink-3)] leading-relaxed">
                {lead.scoreReason}
              </p>
            </Card>
          )}

          <Card title="Răspunde pe email">
            <form action={replyToLead} className="space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <div>
                <div className="text-[11.5px] text-[var(--ink-3)] mb-1">Către: {lead.email}</div>
                <input
                  name="subject"
                  defaultValue={`Re: cerere ${lead.business}`}
                  placeholder="Subiect email"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
                />
              </div>
              <textarea
                name="message"
                rows={5}
                placeholder="Scrie mesajul tău..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
              >
                Trimite email →
              </button>
            </form>
          </Card>

          <Card title="Note interne">
            <form
              action={async (fd) => {
                "use server";
                await updateLeadNotes(lead.id, String(fd.get("notes") ?? ""));
              }}
            >
              <textarea
                name="notes"
                rows={5}
                defaultValue={lead.notes ?? ""}
                placeholder="Detalii din apel, calificare, follow-up…"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              />
              <button
                type="submit"
                className="mt-3 px-4 py-2 rounded-xl border border-[var(--border)] text-[13px] hover:bg-[var(--bg-3)]"
              >
                Salvează note
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <form
              action={async (fd) => {
                "use server";
                await updateLeadStatus(lead.id, String(fd.get("status")));
              }}
              className="flex gap-2"
            >
              <select
                name="status"
                defaultValue={lead.status}
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px]"
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="qualified">qualified</option>
                <option value="won">won</option>
                <option value="lost">lost</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
              >
                Salvează
              </button>
            </form>
          </Card>

          {/* Follow-up reminder */}
          <Card title="Follow-up programat">
            <form
              action={async (fd) => {
                "use server";
                await setLeadFollowUp(lead.id, String(fd.get("followUpAt") ?? ""));
              }}
              className="space-y-3"
            >
              <input
                type="date"
                name="followUpAt"
                defaultValue={
                  lead.followUpAt
                    ? new Date(lead.followUpAt).toISOString().split("T")[0]
                    : ""
                }
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              />
              {lead.followUpAt && (
                <p className="text-[12px] text-amber-700">
                  Programat:{" "}
                  {new Date(lead.followUpAt).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
                >
                  Setează
                </button>
                {lead.followUpAt && (
                  <button
                    type="submit"
                    name="followUpAt"
                    value=""
                    className="px-3 py-2 rounded-xl border border-[var(--border)] text-[12px] hover:bg-[var(--bg-3)]"
                  >
                    Șterge
                  </button>
                )}
              </div>
            </form>
          </Card>

          <Card title="Convertește în client">
            <p className="text-[13px] text-[var(--ink-3)] mb-3">
              Creează automat profilul de client + checklist implementare + link de intake.
            </p>
            <form
              action={async () => {
                "use server";
                await convertLeadToClient(lead.id);
              }}
            >
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                Convertește <ArrowRight size={14} />
              </button>
            </form>
          </Card>

          {(lead.utmSource || lead.utmCampaign) && (
            <Card title="Atribuire">
              <div className="text-[12px] text-[var(--ink-2)] space-y-1.5">
                {lead.utmSource && (
                  <div>
                    <span className="text-[var(--ink-3)]">Source: </span>
                    {lead.utmSource}
                  </div>
                )}
                {lead.utmMedium && (
                  <div>
                    <span className="text-[var(--ink-3)]">Medium: </span>
                    {lead.utmMedium}
                  </div>
                )}
                {lead.utmCampaign && (
                  <div>
                    <span className="text-[var(--ink-3)]">Campanie: </span>
                    {lead.utmCampaign}
                  </div>
                )}
                {lead.referrer && (
                  <div className="truncate">
                    <span className="text-[var(--ink-3)]">Referrer: </span>
                    {lead.referrer}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function ScorePill({
  score,
  band,
}: {
  score: number;
  band: { tone: string; label: string };
}) {
  const tones: Record<string, string> = {
    red: "from-red-50 to-orange-50 border-red-200 text-red-700",
    amber: "from-amber-50 to-yellow-50 border-amber-200 text-amber-800",
    slate: "from-[var(--bg-3)] to-[var(--bg-2)] border-[var(--border)] text-[var(--ink-2)]",
  };
  return (
    <div
      className={`px-4 py-3 rounded-2xl border bg-gradient-to-br flex items-center gap-3 ${tones[band.tone]}`}
    >
      <Flame size={18} />
      <div>
        <div className="text-[10px] eyebrow opacity-70">Scor lead</div>
        <div className="h-display text-2xl tabular-nums leading-none">
          {score}
          <span className="text-sm opacity-50">/100</span>
        </div>
        <div className="text-[10px] eyebrow opacity-70 mt-0.5">{band.label}</div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h2 className="text-[13px] font-medium">{title}</h2>
      </div>
      <div className="p-5 space-y-2.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: typeof Building2;
}) {
  return (
    <div className="flex items-baseline gap-3 text-[14px]">
      <span className="w-24 text-[12px] eyebrow text-[var(--ink-3)] flex items-center gap-1.5">
        {Icon && <Icon size={11} />} {label}
      </span>
      <span className="flex-1">{value}</span>
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
      <div className="text-[10px] eyebrow text-[var(--ink-3)] flex items-center gap-1">
        <Icon size={10} /> {label}
      </div>
      <div className="text-[13px] mt-0.5 capitalize">{value}</div>
    </div>
  );
}

function safeParse<T>(s: string | null): T extends Array<unknown> ? T : never[] {
  if (!s) return [] as never;
  try {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v as never;
  } catch {}
  return [] as never;
}
