import { redirect } from "next/navigation";

// Adăugarea/activarea agenților se face DOAR din admin (done-for-you).
// Clientul cere agent din secțiunea Extra & contact. Redirect spre dashboard.
export default function Page() {
  redirect("/portal");
}
