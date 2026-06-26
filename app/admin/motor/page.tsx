import { AdminShell } from "@/components/admin/AdminShell";
import { MotorClient } from "./MotorClient";

export const metadata = { title: "Motor de creștere · Admin" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminShell>
      <MotorClient />
    </AdminShell>
  );
}
