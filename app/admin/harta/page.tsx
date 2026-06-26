import { AdminShell } from "@/components/admin/AdminShell";
import { HartaClient } from "./HartaClient";

export const metadata = { title: "Hartă lead-uri · Admin" };
export const dynamic = "force-dynamic";

export default function HartaPage() {
  const hasApiKey = !!process.env.GOOGLE_PLACES_API_KEY;
  return (
    <AdminShell>
      <HartaClient hasApiKey={hasApiKey} />
    </AdminShell>
  );
}
