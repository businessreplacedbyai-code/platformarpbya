import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Mail, MailOpen, Archive, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "open";

  const [threads, counts] = await Promise.all([
    prisma.emailThread.findMany({
      where: status === "all" ? {} : { status },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { bodyText: true, direction: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { lastAt: "desc" },
      take: 100,
    }),
    prisma.emailThread.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap: Record<string, number> = { all: 0 };
  for (const c of counts) {
    countMap[c.status] = c._count._all;
    countMap.all += c._count._all;
  }

  const tabs = [
    { key: "open", label: "Inbox" },
    { key: "replied", label: "Răspunse" },
    { key: "archived", label: "Arhivă" },
    { key: "all", label: "Toate" },
  ];

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="eyebrow mb-2">Admin</p>
        <h1 className="h-display text-3xl">Inbox</h1>
        <p className="text-[13px] text-[var(--ink-3)] mt-1">
          Emailuri primite și conversații
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/inbox?status=${t.key}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
              status === t.key
                ? "bg-[var(--ink)] text-[var(--bg-2)]"
                : "text-[var(--ink-2)] hover:bg-[var(--bg-3)]"
            }`}
          >
            {t.label}
            {countMap[t.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                status === t.key ? "bg-white/20" : "bg-[var(--bg-3)]"
              }`}>
                {countMap[t.key]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Thread list */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-[var(--ink-3)]">
            <Mail size={32} className="opacity-30" />
            <p className="text-[14px]">Niciun email în această secțiune.</p>
            {status === "open" && (
              <p className="text-[12px] max-w-sm text-center opacity-70">
                Emailurile primite la <code>reply@in.replacedbyai.ro</code> vor apărea aici.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {threads.map((t) => {
              const lastMsg = t.messages[0];
              const preview = lastMsg?.bodyText?.slice(0, 120).replace(/\n/g, " ") ?? "";
              const isUnread = t.status === "open" && lastMsg?.direction === "in";
              return (
                <li key={t.id}>
                  <Link
                    href={`/admin/inbox/${t.id}`}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--bg-3)] transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      {isUnread
                        ? <Mail size={16} className="text-blue-600" />
                        : <MailOpen size={16} className="text-[var(--ink-3)]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[14px] truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
                          {t.fromName ? `${t.fromName}` : t.fromEmail}
                        </span>
                        {t.leadId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 shrink-0">lead</span>
                        )}
                        {t.clientSlug && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">client</span>
                        )}
                      </div>
                      <div className={`text-[13px] truncate mb-0.5 ${isUnread ? "text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
                        {t.subject}
                      </div>
                      <div className="text-[12px] text-[var(--ink-3)] truncate">{preview}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] text-[var(--ink-3)] whitespace-nowrap">
                        {new Date(t.lastAt).toLocaleDateString("ro-RO", {
                          day: "2-digit", month: "short",
                        })}
                      </div>
                      <div className="text-[10px] text-[var(--ink-3)] mt-1">
                        {t._count.messages} msg
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
