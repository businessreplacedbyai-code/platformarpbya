import { redirect } from "next/navigation";

// Înregistrarea publică self-serve a fost DEZACTIVATĂ (model done-for-you).
// Clienții sunt creați din admin după audit/ofertă. Redirect spre contact.
export const dynamic = "force-dynamic";

export default function Page() {
  redirect("/contact");
}
