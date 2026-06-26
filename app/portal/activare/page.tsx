import { redirect } from "next/navigation";

// Activarea agenților se face DOAR din admin (done-for-you). Redirect spre dashboard.
export default function Page() {
  redirect("/portal");
}
