import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminSession, getClientSession } from "@/lib/auth";
import { loginAction } from "./actions";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { isGoogleEnabled } from "@/lib/google-oauth";

export const metadata: Metadata = {
  title: "Autentificare — ReplacedByAI",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const googleOn = isGoogleEnabled();
  const errMsg =
    sp.error === "oauth"
      ? "Autentificarea cu Google a eșuat. Încearcă din nou."
      : sp.error === "oauth_email"
      ? "Contul Google nu are email verificat. Folosește email + parolă."
      : sp.error === "no_account"
      ? "Nu există un cont cu acest email. Contactează-ne ca să-ți creăm unul."
      : sp.error
      ? "Email sau parolă incorecte."
      : null;

  // Deja loghat? Redirect către dashboard-ul potrivit.
  const [admin, client] = await Promise.all([
    getAdminSession(),
    getClientSession(),
  ]);
  if (admin) redirect(sp.next || "/admin");
  if (client) redirect(sp.next || "/portal");

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-[var(--bg)] to-[var(--bg-2)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-10"
        >
          <Image
            src="/logo-mark.png"
            alt="ReplacedByAI"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-medium tracking-tight text-[16px]">
            Replaced<span className="text-[var(--ink-3)]">ByAI</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)]">
          <h1 className="h-display text-2xl mb-1">Bine ai venit</h1>
          <p className="text-[13.5px] text-[var(--ink-2)] mb-7">
            Conectează-te la contul ReplacedByAI.
          </p>

          {errMsg && (
            <div
              className="mb-5 text-[13px] rounded-xl px-3 py-2.5"
              style={{
                background: "var(--bg-3)",
                color: "#c0392b",
                border: "1px solid var(--border)",
              }}
            >
              {errMsg}
            </div>
          )}

          {googleOn && (
            <>
              <GoogleButton next={sp.next} />
              <AuthDivider label="sau cu email" />
            </>
          )}

          <form action={loginAction} className="space-y-4">
            {sp.next && <input type="hidden" name="next" value={sp.next} />}

            <label className="block">
              <span className="text-[12.5px] text-[var(--ink-1)]">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="nume@firma.ro"
                className="mt-1.5 w-full h-11 rounded-xl px-3 text-[14px] outline-none bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)]"
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-[var(--ink-1)]">Parolă</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full h-11 rounded-xl px-3 text-[14px] outline-none bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)]"
              />
            </label>

            <div className="flex items-center justify-between text-[12.5px]">
              <Link
                href="/login/forgot"
                className="text-[var(--ink-3)] hover:text-[var(--ink-1)] underline"
              >
                Ai uitat parola?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl text-[14px] font-medium bg-[var(--ink)] text-[var(--bg)]"
            >
              Conectează-te
            </button>
          </form>

          <p className="text-[12px] text-center mt-6 text-[var(--ink-3)]">
            Nu ai cont?{" "}
            <Link href="/contact" className="underline text-[var(--ink)] font-medium">
              Contactează-ne
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
