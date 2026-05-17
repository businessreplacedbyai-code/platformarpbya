import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "./AdminNav";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AdminNav email={session?.email} logout={logoutAction} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
