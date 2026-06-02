import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { changePasswordAction } from "../actions";
import { KeyRound, User } from "lucide-react";

export const metadata = { title: "Contul meu · Portal" };

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/account");

  const client = await prisma.client.findUnique({
    where: { id: session.sub },
    select: {
      contactName: true,
      email: true,
      businessName: true,
      mustSetPassword: true,
      plan: true,
      status: true,
      createdAt: true,
    },
  });
  if (!client) redirect("/login");

  const isSetup = sp.setup === "1" || client.mustSetPassword;

  return (
    <div className="max-w-[600px] space-y-8">
      <div>
        <h1 className="h-display text-3xl mb-1">Contul meu</h1>
        <p className="text-[14px] text-[var(--ink-2)]">Datele contului și setări de securitate.</p>
      </div>

      {isSetup && (
        <div
          className="rounded-xl px-4 py-3 text-[13.5px]"
          style={{ background: "var(--bg-2)", border: "1px solid #D97706", color: "#92400E" }}
        >
          Prima autentificare — setează o parolă personală înainte de a continua.
        </div>
      )}

      {/* Info cont */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-medium flex items-center gap-2 mb-5">
          <User size={15} /> Informații cont
        </h2>
        <div className="space-y-0">
          <InfoRow label="Nume" value={client.contactName} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="Firmă" value={client.businessName} />
          <InfoRow label="Plan" value={client.plan ?? "—"} />
          <InfoRow label="Status" value={client.status} />
          <InfoRow label="Cont creat" value={client.createdAt.toLocaleDateString("ro-RO")} />
        </div>
      </section>

      {/* Schimbare parolă */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-medium flex items-center gap-2 mb-5">
          <KeyRound size={15} /> {isSetup ? "Setează parola" : "Schimbă parola"}
        </h2>

        {sp.ok && (
          <div
            className="mb-4 rounded-lg px-4 py-2.5 text-[13px]"
            style={{ background: "var(--bg)", border: "1px solid #1F9D55", color: "#1F9D55" }}
          >
            Parola a fost actualizată cu succes.
          </div>
        )}
        {sp.err && (
          <div
            className="mb-4 rounded-lg px-4 py-2.5 text-[13px]"
            style={{ background: "var(--bg)", border: "1px solid #C0392B", color: "#C0392B" }}
          >
            {decodeURIComponent(sp.err)}
          </div>
        )}

        <form action={changePasswordAction} className="space-y-4">
          <div>
            <label className="block text-[12.5px] text-[var(--ink-2)] mb-1.5">
              {isSetup ? "Parola temporară (primită de la noi)" : "Parola curentă"}
            </label>
            <input
              type="password"
              name="current"
              required
              className="w-full h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label className="block text-[12.5px] text-[var(--ink-2)] mb-1.5">
              Parola nouă (minim 8 caractere)
            </label>
            <input
              type="password"
              name="next"
              required
              minLength={8}
              className="w-full h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label className="block text-[12.5px] text-[var(--ink-2)] mb-1.5">
              Confirmă parola nouă
            </label>
            <input
              type="password"
              name="confirm"
              required
              minLength={8}
              className="w-full h-10 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 rounded-xl text-[13.5px] font-medium"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            {isSetup ? "Activează contul" : "Salvează parola"}
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-[13px] text-[var(--ink-3)]">{label}</span>
      <span className="text-[13px] font-medium capitalize">{value}</span>
    </div>
  );
}
