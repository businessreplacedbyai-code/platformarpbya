import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "./AdminNav";
import { redirect } from "next/navigation";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") redirect("/login?type=admin");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <AdminNav email={session.email} logout={logoutAction} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 pb-28">{children}</div>
      </main>
    </div>
  );
}
