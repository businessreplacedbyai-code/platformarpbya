import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { requestPasswordReset } from "./actions";

export const metadata: Metadata = {
  title: "Recuperare parolă — ReplacedByAI",
  robots: { index: false, follow: false },
};

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type === "admin" ? "admin" : "client";
  const sent = sp.status === "sent";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-[var(--bg)] to-[var(--bg-2)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Image src="/logo-mark.png" alt="ReplacedByAI" width={32} height={32} className="rounded-md" />
          <span className="font-medium tracking-tight text-[16px]">
            Replaced<span className="text-[var(--ink-3)]">ByAI</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)]">
          <h1 className="h-display text-2xl mb-1">Recuperare parolă</h1>
          <p className="text-[13.5px] text-[var(--ink-3)] mb-6">
            Introdu email-ul contului tău de {type === "admin" ? "administrator" : "client"} și îți trimitem un link de resetare.
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 text-[13.5px] px-4 py-3 leading-relaxed">
                Dacă există un cont cu acel email, am trimis un link de resetare. Verifică inbox-ul (și spam).
                Link-ul expiră în 60 de minute.
              </div>
              <Link
                href={`/login?type=${type}`}
                className="block w-full text-center px-5 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] font-medium hover:-translate-y-0.5 transition-all"
              >
                Înapoi la login
              </Link>
            </div>
          ) : (
            <form action={requestPasswordReset} className="space-y-4">
              <input type="hidden" name="type" value={type} />

              <label className="block">
                <span className="text-[12.5px] font-medium text-[var(--ink-2)] mb-1.5 block">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[14px] outline-none focus:border-[var(--ink-3)]"
                />
              </label>

              <button
                type="submit"
                className="w-full px-5 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Trimite link de resetare
              </button>

              <p className="text-[12px] text-[var(--ink-3)] text-center pt-2">
                <Link href={`/login?type=${type}`} className="hover:text-[var(--ink)]">
                  ← Înapoi la login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
