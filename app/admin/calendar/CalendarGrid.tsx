"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Event = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: string;
  color: string;
  clientSlug: string | null;
  leadId: string | null;
  description: string | null;
  notifyEmail: boolean;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const COLOR_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
};

const COLOR_PILL: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  red: "bg-red-100 text-red-800 border-red-200",
  violet: "bg-violet-100 text-violet-800 border-violet-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

const DAY_NAMES = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export function CalendarGrid({
  year,
  month,
  events,
}: {
  year: number;
  month: number;
  events: Event[];
}) {
  const sp = useSearchParams();
  const today = new Date();

  const firstDay = new Date(year, month - 1, 1);
  // Monday-first: 0=Mon, 6=Sun
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = Array(totalCells).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells[startOffset + d - 1] = d;

  function eventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.startAt);
      return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
    });
  }

  function isToday(day: number) {
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
      {/* Header giorni */}
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-[11px] eyebrow text-center text-[var(--ink-3)] border-r last:border-r-0 border-[var(--border)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const dayEvents = day ? eventsForDay(day) : [];
          const todayCell = day ? isToday(day) : false;
          const dateStr = day
            ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";

          return (
            <div
              key={idx}
              className={`min-h-[100px] border-r last:border-r-0 border-b border-[var(--border)] p-1.5 ${
                !day ? "bg-[var(--bg-3)]/30" : "hover:bg-[var(--bg-3)]/40 transition-colors"
              }`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/admin/calendar?year=${year}&month=${month}&new=${dateStr}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${
                        todayCell
                          ? "bg-[var(--ink)] text-[var(--bg-2)]"
                          : "text-[var(--ink-1)] hover:bg-[var(--bg-3)]"
                      }`}
                      title="Adaugă eveniment în această zi"
                    >
                      {day}
                    </Link>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-[var(--ink-3)]">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/admin/calendar?year=${year}&month=${month}&edit=${ev.id}`}
                        className={`block truncate text-[11px] px-1.5 py-0.5 rounded border ${COLOR_PILL[ev.color] ?? COLOR_PILL.blue} transition-opacity hover:opacity-80`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${COLOR_DOT[ev.color] ?? COLOR_DOT.blue}`} />
                        {ev.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-[var(--ink-3)] px-1">+{dayEvents.length - 3} mai multe</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
