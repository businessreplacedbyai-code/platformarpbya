import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "../../admin-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  return (
    <AdminShell>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mb-6"
      >
        <ArrowLeft size={14} /> Înapoi
      </Link>

      <header className="mb-8">
        <p className="eyebrow mb-2">Client nou</p>
        <h1 className="h-display text-3xl">Crează profil client</h1>
        <p className="text-[var(--ink-3)] text-[14px] mt-2">
          Se generează automat checklist-ul de implementare și un link unic de intake.
        </p>
      </header>

      <form
        action={createClient}
        className="max-w-2xl space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7"
      >
        <Field label="Denumire business" name="businessName" required placeholder="Clinică Dental Smile" />
        <Field label="Persoană de contact" name="contactName" required placeholder="Ana Popescu" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Telefon" name="phone" type="tel" required placeholder="+40 7..." />
        </div>
        <label className="block">
          <span className="block text-[12px] eyebrow mb-1.5">Plan</span>
          <select
            name="plan"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px]"
          >
            <option value="">— alege —</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <div className="pt-2 flex gap-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] hover:-translate-y-0.5 transition-all"
          >
            Crează client
          </button>
          <Link
            href="/admin/clients"
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[14px] hover:bg-[var(--bg-3)]"
          >
            Anulează
          </Link>
        </div>
      </form>
    </AdminShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] eyebrow mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
      />
    </label>
  );
}
