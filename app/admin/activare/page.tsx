import { AdminShell } from "@/components/admin/AdminShell";
import { ActivateClient } from "./ActivateClient";

export const metadata = { title: "Activare agenți · Admin" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminShell>
      <ActivateClient />
    </AdminShell>
  );
}
