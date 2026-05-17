import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession, getClientSession } from "@/lib/auth";
import { loginAction } from "./actions";
import { Shield, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autentificare — ReplacedByAI",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type === "admin" ? "admin" : "client";

  // Dacă deja loghat, redirect
  if (type === "admin") {
    const s = await getAdminSession();
    if (s) redirect(sp.next || "/admin");
  } else {
    const s = await getClientSession();
    if (s) redirect(sp.next || "/portal");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-[var(--bg)] to-[var(--bg-2)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Image src="/logo-mark.png" alt="ReplacedByAI" width={32} height={32} className="rounded-md" />
          <span className="font-medium tracking-tight text-[16px]">
            Replaced<span className="text-[var(--ink-3)]">ByAI</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)]">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-[var(--border)]">
            <TabLink
              href={`/login?type=client${sp.next ? `&next=${encodeURIComponent(sp.next)}` : ""}`}
              active={type === "client"}
              icon={<User size={15} />}
              label="Client"
            />
            <TabLink
              href={`/login?type=admin${sp.next ? `&next=${encodeURIComponent(sp.next)}` : ""}`}
              active={type === "admin"}
              icon={<Shield size={15} />}
              label="Admin"
            />
          </div>

          <div className="p-8">
            <h1 className="h-display text-2xl mb-1">
              {type === "admin" ? "Acces administrator" : "Portalul tău"}
            </h1>
            <p className="text-[13.5px] text-[var(--ink-3)] mb-6">
              {type === "admin"
                ? "Doar pentru echipa ReplacedByAI."
                : "Vezi-ți agenții, status implementare și cere agenți noi."}
            </p>

            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="type" value={type} />
              {sp.next && <input type="hidden" name="next" value={sp.next} />}

              {sp.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-[13px] px-3 py-2">
                  {sp.error}
                </div>
              )}

              <Field label="Email" name="email" type="email" required />
              <Field label="Parolă" name="password" type="password" required />

              <button
                type="submit"
                className="w-full px-5 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Intră în {type === "admin" ? "panou" : "portal"}
              </button>

              {type === "client" && (
                <p className="text-[12px] text-[var(--ink-3)] text-center pt-2">
                  Nu ai cont încă?{" "}
                  <Link href="/contact" className="text-[var(--ink)] hover:underline">
                    Cere acces
                  </Link>
                </p>
              )}
              <p className="text-[12px] text-[var(--ink-3)] text-center">
                <Link
                  href={`/login/forgot?type=${type}`}
                  className="text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline"
                >
                  Ai uitat parola?
                </Link>
              </p>
            </form>
          </div>
        </div>

        <p className="text-center text-[12px] text-[var(--ink-3)] mt-6">
          <Link href="/" className="hover:text-[var(--ink)]">← Înapoi la site</Link>
        </p>
      </div>
    </main>
  );
}

function TabLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 py-4 text-[13.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--bg-2)] text-[var(--ink)]"
          : "bg-[var(--bg-3)] text-[var(--ink-3)] hover:text-[var(--ink-1)]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] eyebrow mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 focus:border-[var(--ink)]/30"
      />
    </label>
  );
}
