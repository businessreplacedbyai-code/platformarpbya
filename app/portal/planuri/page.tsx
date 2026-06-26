import { redirect } from "next/navigation";

// Selecția self-serve de plan a fost dezactivată (done-for-you). Planul îl setează
// adminul + link de plată. Clientul vede/gestionează în Facturare.
export const dynamic = "force-dynamic";

export default function Page() {
  redirect("/portal/billing");
}
