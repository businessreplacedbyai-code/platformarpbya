import { AdminShell } from "@/components/admin/AdminShell";
import { StudioClient } from "./StudioClient";

export const metadata = { title: "Studio · ReplacedByAI" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminShell>
      <StudioClient />
    </AdminShell>
  );
}
