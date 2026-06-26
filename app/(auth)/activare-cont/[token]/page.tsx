import Link from "next/link";
import { prisma } from "@/lib/db";
import { activateAccount } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activează contul · ReplacedByAI", robots: { index: false } };

const input = "w-full h-11 px-3.5 text-[14px] rounded-xl bg-[var(--bg-2)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]";

export default async function Page({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { token } = await params;
  const { err } = await searchParams;
  const client = await prisma.client.findUnique({ where: { intakeToken: token }, select: { businessName: true } });
  const msg = err === "short" ? "Parola trebuie să aibă minim 8 caractere."
    : err === "match" ? "Parolele nu coincid."
    : err === "token" ? "Link invalid." : null;

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: "var(--bg)" }}>
        <div className="max-w-sm">
          <h1 className="h-display text-2xl mb-2">Link invalid</h1>
          <p className="text-[14px] text-[var(--ink-3)]">Linkul de activare nu e valid. Scrie-ne la contact@replacedbyai.ro.</p>
        </div>
      </div>
    );
  }

  const action = activateAccount.bind(null, token);
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex w-10 h-10 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] items-center justify-center font-bold mb-4">R</div>
          <h1 className="h-display text-2xl mb-1">Bun venit, {client.businessName}</h1>
          <p className="text-[13.5px] text-[var(--ink-3)]">Setează-ți parola ca să-ți activezi contul.</p>
        </div>
        {msg && <div className="mb-4 text-[13px] rounded-xl px-4 py-3" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{msg}</div>}
        <form action={action} className="space-y-3">
          <input name="password" type="password" required minLength={8} placeholder="Parolă (minim 8 caractere)" className={input} />
          <input name="confirm" type="password" required minLength={8} placeholder="Confirmă parola" className={input} />
          <button type="submit" className="w-full h-11 rounded-xl text-[14px] font-medium bg-[var(--ink)] text-[var(--bg-2)] hover:opacity-90 transition-opacity">
            Activează contul
          </button>
        </form>
        <p className="text-center text-[13px] text-[var(--ink-3)] mt-5">
          Ai deja parolă? <Link href="/login?type=client" className="text-[var(--ink)] font-medium hover:underline">Loghează-te</Link>
        </p>
      </div>
    </div>
  );
}
