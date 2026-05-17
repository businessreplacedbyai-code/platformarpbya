import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Setare parolă nouă — ReplacedByAI",
  robots: { index: false, follow: false },
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token || "";
  const type = sp.type === "admin" ? "admin" : "client";

  const tokenHash = token ? hashToken(token) : "";
  const reset = tokenHash
    ? await prisma.passwordReset.findUnique({ where: { tokenHash } })
    : null;
  const valid = reset && !reset.usedAt && reset.expiresAt > new Date();

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
          <h1 className="h-display text-2xl mb-1">Setează o parolă nouă</h1>
          <p className="text-[13.5px] text-[var(--ink-3)] mb-6">
            Minim 8 caractere. Recomandăm parolă unică, generată de un password manager.
          </p>

          {!valid ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-[13px] px-3 py-3 leading-relaxed">
                Link invalid sau expirat. Cere unul nou.
              </div>
              <Link
                href={`/login/forgot?type=${type}`}
                className="block w-full text-center px-5 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] font-medium hover:-translate-y-0.5 transition-all"
              >
                Cere link nou
              </Link>
            </div>
          ) : (
            <ResetForm token={token} type={type} />
          )}
        </div>
      </div>
    </main>
  );
}
