import { AdminShell } from "@/components/admin/AdminShell";
import { BuilderClient } from "./BuilderClient";

export const metadata = { title: "Website Builder · Admin" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminShell>
      <BuilderClient />
    </AdminShell>
  );
}
