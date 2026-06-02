import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CalendarGrid } from "./CalendarGrid";
import { EventForm } from "./EventForm";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; new?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const year = parseInt(sp.year ?? String(today.getFullYear()));
  const month = parseInt(sp.month ?? String(today.getMonth() + 1));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const events = await prisma.calendarEvent.findMany({
    where: { startAt: { gte: start, lte: end } },
    orderBy: { startAt: "asc" },
  });

  // Client-uri și leads pentru autocomplete în form
  const [clients, leads] = await Promise.all([
    prisma.client.findMany({ select: { slug: true, businessName: true }, orderBy: { businessName: "asc" } }),
    prisma.lead.findMany({
      where: { status: { notIn: ["won", "lost"] } },
      select: { id: true, business: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const editEvent = sp.edit
    ? await prisma.calendarEvent.findUnique({ where: { id: sp.edit } })
    : null;

  const MONTH_NAMES = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
  ];

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="h-display text-3xl">Calendar</h1>
        </div>
        <Link
          href={`/admin/calendar?year=${year}&month=${month}&new=1`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] hover:-translate-y-0.5 transition-all"
        >
          <Plus size={14} /> Eveniment nou
        </Link>
      </div>

      {/* Navigation lună */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/calendar?year=${prevMonth.year}&month=${prevMonth.month}`}
          className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <h2 className="h-display text-xl flex-1 text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Link
          href={`/admin/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
          className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Grid calendar */}
      <CalendarGrid
        year={year}
        month={month}
        events={events.map((e) => ({
          ...e,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt?.toISOString() ?? null,
          notifiedAt: e.notifiedAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }))}
      />

      {/* Modal: form nou sau edit */}
      {(sp.new || sp.edit) && (
        <EventForm
          year={year}
          month={month}
          clients={clients}
          leads={leads}
          editEvent={editEvent
            ? {
                ...editEvent,
                startAt: editEvent.startAt.toISOString(),
                endAt: editEvent.endAt?.toISOString() ?? null,
                notifiedAt: editEvent.notifiedAt?.toISOString() ?? null,
                createdAt: editEvent.createdAt.toISOString(),
                updatedAt: editEvent.updatedAt.toISOString(),
              }
            : null}
          defaultDate={sp.new && sp.new !== "1" ? sp.new : undefined}
        />
      )}
    </AdminShell>
  );
}
