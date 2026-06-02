import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Archive, ExternalLink, RotateCcw } from "lucide-react";
import { ReplyBox } from "./ReplyBox";
import { archiveThread, reopenThread } from "../actions";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  const thread = await prisma.emailThread.findUnique({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();

  // Linkuri rapide
  const lead = thread.leadId
    ? await prisma.lead.findUnique({ where: { id: thread.leadId }, select: { id: true, business: true } })
    : null;
  const client = thread.clientSlug
    ? await prisma.client.findUnique({ where: { slug: thread.clientSlug }, select: { slug: true, businessName: true } })
    : null;

  return (
    <AdminShell>
      <Link
        href="/admin/inbox"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> Inbox
      </Link>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="h-display text-2xl leading-tight">{thread.subject}</h1>
            <div className="flex gap-2 shrink-0">
              {thread.status !== "archived" ? (
                <form action={async () => { "use server"; await archiveThread(threadId); }}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] hover:bg-[var(--bg-3)] transition-colors"
                  >
                    <Archive size={13} /> Arhivează
                  </button>
                </form>
              ) : (
                <form action={async () => { "use server"; await reopenThread(threadId); }}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] hover:bg-[var(--bg-3)] transition-colors"
                  >
                    <RotateCcw size={13} /> Redeschide
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[13px] text-[var(--ink-3)]">
              De la: <strong className="text-[var(--ink)]">{thread.fromName ?? thread.fromEmail}</strong>
              {thread.fromName && <span className="ml-1 opacity-60">&lt;{thread.fromEmail}&gt;</span>}
            </span>
            {lead && (
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex items-center gap-1 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100"
              >
                Lead: {lead.business} <ExternalLink size={10} />
              </Link>
            )}
            {client && (
              <Link
                href={`/admin/clients/${client.slug}`}
                className="flex items-center gap-1 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100"
              >
                Client: {client.businessName} <ExternalLink size={10} />
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-8">
          {thread.messages.map((msg) => {
            const isOut = msg.direction === "out";
            return (
              <div
                key={msg.id}
                className={`rounded-2xl border overflow-hidden ${
                  isOut
                    ? "border-[var(--ink)]/20 bg-[var(--ink)]/[0.03] ml-8"
                    : "border-[var(--border)] bg-[var(--bg-2)]"
                }`}
              >
                {/* Message header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${isOut ? "border-[var(--ink)]/10" : "border-[var(--border)]"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${isOut ? "bg-[var(--ink)] text-[var(--bg-2)]" : "bg-[var(--bg-3)] text-[var(--ink)]"}`}>
                      {isOut ? "R" : (msg.fromName?.[0] ?? msg.fromEmail[0]).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[13px] font-medium">
                        {isOut ? "Tu (ReplacedByAI)" : (msg.fromName ?? msg.fromEmail)}
                      </span>
                      {!isOut && msg.fromName && (
                        <span className="text-[11px] text-[var(--ink-3)] ml-1">&lt;{msg.fromEmail}&gt;</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--ink-3)]">
                    {new Date(msg.createdAt).toLocaleString("ro-RO", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Message body */}
                <div className="px-5 py-4">
                  {msg.bodyHtml && !isOut ? (
                    <div
                      className="prose prose-sm max-w-none text-[14px] text-[var(--ink-1)]"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.bodyHtml) }}
                    />
                  ) : (
                    <p className="text-[14px] text-[var(--ink-1)] whitespace-pre-wrap leading-relaxed">
                      {msg.bodyText ?? "—"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        {thread.status !== "archived" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center text-[11px] font-bold">R</div>
              <span className="text-[13px] font-medium">Răspunde</span>
              <span className="text-[12px] text-[var(--ink-3)] ml-auto">→ {thread.fromEmail}</span>
            </div>
            <ReplyBox threadId={threadId} />
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function sanitizeHtml(html: string): string {
  // Elimină script tags și event handlers basic
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
