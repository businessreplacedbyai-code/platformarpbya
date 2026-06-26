import { redirect } from "next/navigation";

// Crearea de site-uri se face DOAR din admin (done-for-you). Portalul clientului
// nu mai are self-serve — redirect spre dashboard.
export default function Page() {
  redirect("/portal");
}
