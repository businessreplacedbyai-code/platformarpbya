import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.action) where.action = sp.action;

  const [logs, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 250,
    }),
    prisma.auditLog
      .findMany({ select: { action: true }, distinct: ["action"], take: 50 })
      .then((rows) => rows.map((r) => r.action).sort()),
  ]);

  return (
    <AdminShell>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <History size={11} /> Audit
          </p>
          <h1 className="h-display text-3xl">Jurnal acțiuni</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">
            Ultimele 250 de evenimente. Pentru conformitate GDPR & securitate.
          </p>
        </div>
        <form className="flex gap-2">
          <select
            name="action"
            defaultValue={sp.action ?? ""}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px]"
          >
            <option value="">Toate acțiunile</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-[13px]"
          >
            Filtrează
          </button>
        </form>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-[var(--ink-3)] text-[14px]">
            Niciun log încă.
          </div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-[var(--border)] text-[10px] eyebrow text-[var(--ink-3)]">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Acțiune</th>
                <th className="px-4 py-3 text-left">Țintă</th>
                <th className="px-4 py-3 text-left">Detalii</th>
                <th className="px-4 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--bg-3)]"
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-[var(--ink-3)]">
                    {new Date(log.createdAt).toLocaleString("ro-RO", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">{log.actorEmail ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px]">{log.action}</td>
                  <td className="px-4 py-2.5 text-[var(--ink-2)]">
                    {log.targetType ?? ""}
                    {log.targetId && (
                      <span className="text-[var(--ink-3)] text-[11px] ml-1">
                        {log.targetId.slice(0, 10)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--ink-3)] max-w-[300px] truncate">
                    {log.metadata ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-[var(--ink-3)]">
                    {log.ipHash ? log.ipHash.slice(0, 12) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
