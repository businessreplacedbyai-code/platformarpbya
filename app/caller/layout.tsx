import { getAdminSession } from "@/lib/auth";
import { logoutAdmin } from "@/app/(auth)/login/actions";
import { redirect } from "next/navigation";
import { LogOut, Phone } from "lucide-react";

export const metadata = { title: "Cold-call · ReplacedByAI", robots: { index: false } };

export default async function CallerLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-2)] sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center">
              <Phone size={15} />
            </span>
            <div className="leading-tight">
              <div className="text-[13.5px] font-medium">Cold-call</div>
              <div className="text-[11px] text-[var(--ink-3)] truncate max-w-[160px]">{session.email}</div>
            </div>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12.5px] text-[var(--ink-2)] hover:bg-[var(--bg-3)]">
              <LogOut size={14} /> Ieșire
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-5">{children}</main>
    </div>
  );
}
