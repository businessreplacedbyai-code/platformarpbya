import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Mail, MessageCircle, Calendar, Send, ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Istoric Outreach · Admin" };
export const dynamic = "force-dynamic";

export default async function OutreachIstoricPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "sent"; // sent | replied | all

  const where: Record<string, unknown> = {};
  if (status === "sent") where.status = "sent";
  else if (status === "replied") where.status = "replied";
  else where.status = { in: ["sent", "replied"] };

  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.outreachLead.findMany({
    where,
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  // Stats global
  const [totalSent, totalReplied, last7d] = await Promise.all([
    prisma.outreachLead.count({ where: { status: "sent" } }),
    prisma.outreachLead.count({ where: { status: "replied" } }),
    prisma.outreachLead.count({ where: { sentAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
  ]);
  const replyRate = totalSent > 0 ? Math.round((totalReplied / (totalSent + totalReplied)) * 100) : 0;

  return (
    <AdminShell>
      <div className="space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Outreach</p>
            <h1 className="h-display text-3xl mb-1">Istoric mesaje trimise</h1>
            <p className="text-[14px] text-[var(--ink-2)]">
              Vezi exact ce mesaj a primit fiecare firmă, când și pe ce canal.
            </p>
          </div>
          <Link href="/admin/outreach" className="text-[13px] flex items-center gap-1 text-[var(--ink-2)] hover:text-[var(--ink)]">
            <ArrowLeft size={14} /> înapoi la outreach
          </Link>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total trimise", value: totalSent, color: "#059669", icon: Send },
            { label: "Răspunsuri", value: totalReplied, color: "#7C3AED", icon: CheckCircle2 },
            { label: "Rată răspuns", value: `${replyRate}%`, color: "#2563EB", icon: MessageCircle },
            { label: "Ultimele 7 zile", value: last7d, color: "var(--ink-1)", icon: Calendar },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <s.icon size={14} style={{ color: s.color as string }} />
                <span className="text-[10.5px] text-[var(--ink-3)] uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-[24px] font-bold tabular-nums" style={{ color: s.color as string }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          <form className="flex-1 min-w-[200px]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Caută firmă, email, oraș…"
              className="w-full px-3 py-1.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
            />
            <input type="hidden" name="status" value={status} />
          </form>
          <div className="flex gap-1">
            {[
              { k: "sent", label: "Trimise", count: totalSent },
              { k: "replied", label: "Cu răspuns", count: totalReplied },
              { k: "all", label: "Toate", count: totalSent + totalReplied },
            ].map((f) => (
              <Link
                key={f.k}
                href={`/admin/outreach/istoric?status=${f.k}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium"
                style={{
                  background: status === f.k ? "var(--ink)" : "var(--bg)",
                  color: status === f.k ? "var(--bg)" : "var(--ink-2)",
                  border: `1px solid ${status === f.k ? "var(--ink)" : "var(--border)"}`,
                }}
              >
                {f.label} <span className="opacity-60 ml-0.5">({f.count})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* LIST */}
        {leads.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <Mail size={28} className="mx-auto text-[var(--ink-3)] mb-3" />
            <p className="text-[13px] text-[var(--ink-2)]">Nimic de afișat încă. Trimite mesaje din Outreach.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((l) => {
              const channel = l.email ? "email" : (l.phone ? "whatsapp" : "—");
              return (
                <details key={l.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
                  <summary className="px-4 py-3 cursor-pointer flex items-center justify-between gap-3 hover:bg-[var(--bg-3)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: channel === "email" ? "#EFF6FF" : "#F0FDF4", color: channel === "email" ? "#1D4ED8" : "#15803D" }}>
                        {channel === "email" ? <Mail size={15} /> : <MessageCircle size={15} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[14px] truncate">{l.businessName}</div>
                        <div className="text-[11.5px] text-[var(--ink-3)] truncate">
                          {l.email || l.phone} · {l.city} · {l.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {l.status === "replied" && (
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                          ↩ răspuns
                        </span>
                      )}
                      <span className="text-[11.5px] text-[var(--ink-3)]">
                        {l.sentAt ? new Date(l.sentAt).toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 border-t border-[var(--border)] bg-[var(--bg)]">
                    {l.messageSubject && (
                      <div className="text-[12.5px] font-medium pt-3 pb-2 text-[var(--ink-1)]">
                        Subiect: {l.messageSubject}
                      </div>
                    )}
                    {l.messageBody ? (
                      <pre className="text-[12.5px] text-[var(--ink-2)] whitespace-pre-wrap font-sans leading-relaxed">
                        {l.messageBody}
                      </pre>
                    ) : (
                      <p className="text-[12px] text-[var(--ink-3)] italic py-2">Mesajul nu a fost salvat în istoric.</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                      {l.website && (
                        <a href={l.website.startsWith("http") ? l.website : `https://${l.website}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink size={11} /> {l.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                        </a>
                      )}
                      {l.rating && (
                        <span className="text-[11px] text-amber-600">★ {l.rating.toFixed(1)}{l.reviewCount ? ` (${l.reviewCount})` : ""}</span>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
