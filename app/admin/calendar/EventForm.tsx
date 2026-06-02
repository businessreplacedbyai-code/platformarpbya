"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { X, Trash2 } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "./actions";

type Client = { slug: string; businessName: string };
type Lead = { id: string; business: string };
type Event = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: string;
  color: string;
  clientSlug: string | null;
  leadId: string | null;
  notifyEmail: boolean;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const EVENT_TYPES = [
  { value: "task", label: "Task", emoji: "✅" },
  { value: "meeting", label: "Întâlnire", emoji: "🤝" },
  { value: "call", label: "Apel", emoji: "📞" },
  { value: "follow-up", label: "Follow-up", emoji: "🔁" },
  { value: "deadline", label: "Deadline", emoji: "⚠️" },
  { value: "go-live", label: "Go-live", emoji: "🚀" },
];

const COLORS = [
  { value: "blue", label: "Albastru", cls: "bg-blue-500" },
  { value: "green", label: "Verde", cls: "bg-emerald-500" },
  { value: "amber", label: "Galben", cls: "bg-amber-500" },
  { value: "red", label: "Roșu", cls: "bg-red-500" },
  { value: "violet", label: "Violet", cls: "bg-violet-500" },
  { value: "slate", label: "Gri", cls: "bg-slate-400" },
];

export function EventForm({
  year,
  month,
  clients,
  leads,
  editEvent,
  defaultDate,
}: {
  year: number;
  month: number;
  clients: Client[];
  leads: Lead[];
  editEvent: Event | null;
  defaultDate?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const close = () => router.push(`/admin/calendar?year=${year}&month=${month}`);

  // Default startAt: defaultDate or now rounded to next hour
  const defaultStart = (() => {
    if (editEvent) return editEvent.startAt.slice(0, 16);
    if (defaultDate) return `${defaultDate}T09:00`;
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  })();

  const defaultEnd = editEvent?.endAt
    ? editEvent.endAt.slice(0, 16)
    : (() => {
        const d = new Date(defaultStart);
        d.setHours(d.getHours() + 1);
        return d.toISOString().slice(0, 16);
      })();

  async function handleDelete() {
    if (!editEvent) return;
    startTransition(async () => {
      await deleteEvent(editEvent.id);
      router.push(`/admin/calendar?year=${year}&month=${month}`);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-lg bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-medium">
            {editEvent ? "Editează eveniment" : "Eveniment nou"}
          </h2>
          <div className="flex items-center gap-2">
            {editEvent && (
              <button
                onClick={handleDelete}
                disabled={pending}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Șterge"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={close}
              className="p-1.5 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-3)] rounded-lg"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          action={editEvent
            ? (fd) => {
                startTransition(async () => {
                  await updateEvent(editEvent.id, fd);
                  router.refresh();
                });
              }
            : (fd) => {
                startTransition(async () => {
                  await createEvent(fd);
                  router.refresh();
                });
              }
          }
          className="overflow-y-auto p-5 space-y-4"
        >
          {/* Titlu */}
          <div>
            <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Titlu *</label>
            <input
              name="title"
              required
              defaultValue={editEvent?.title ?? ""}
              placeholder="ex: Apel onboarding Bella Caffè"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
            />
          </div>

          {/* Tip + Culoare */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Tip</label>
              <select
                name="type"
                defaultValue={editEvent?.type ?? "task"}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Culoare</label>
              <select
                name="color"
                defaultValue={editEvent?.color ?? "blue"}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
              >
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Început *</label>
              <input
                type="datetime-local"
                name="startAt"
                required
                defaultValue={defaultStart}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Sfârșit</label>
              <input
                type="datetime-local"
                name="endAt"
                defaultValue={defaultEnd}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px]"
              />
            </div>
          </div>

          {/* Toată ziua */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="allDay"
              defaultChecked={editEvent?.allDay ?? false}
              className="rounded"
            />
            <span className="text-[13px]">Toată ziua</span>
          </label>

          {/* Descriere */}
          <div>
            <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Descriere / note</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={editEvent?.description ?? ""}
              placeholder="Detalii, link Meet, agendă..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
            />
          </div>

          {/* Link client / lead */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Client (opțional)</label>
              <select
                name="clientSlug"
                defaultValue={editEvent?.clientSlug ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[12px]"
              >
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.businessName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] eyebrow text-[var(--ink-3)] mb-1.5">Lead (opțional)</label>
              <select
                name="leadId"
                defaultValue={editEvent?.leadId ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[12px]"
              >
                <option value="">—</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.business}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notificări */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="notifyEmail"
                defaultChecked={editEvent?.notifyEmail ?? true}
                className="rounded"
              />
              <div>
                <p className="text-[13px] font-medium">Notificare pe email</p>
                <p className="text-[11.5px] text-[var(--ink-3)]">
                  Primești email de confirmare + reminder cu 1h înainte
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] font-medium disabled:opacity-60"
          >
            {pending ? "Se salvează…" : editEvent ? "Actualizează eveniment" : "Creează eveniment"}
          </button>
        </form>
      </div>
    </div>
  );
}
