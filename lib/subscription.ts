// Logica de abonament — decide ce servicii sunt active.
// Folosit ca gate central în API (api-auth) + în portal (UI).

export type SubStatus = string | null | undefined;

// Statusuri care permit accesul la servicii.
const ACTIVE_STATUSES = new Set(["active", "trialing"]);
// Statusuri în „perioadă de grație" (avertizezi, dar nu blochezi imediat).
const GRACE_STATUSES = new Set(["past_due"]);

/** Abonamentul permite folosirea serviciilor (agenți live, API, integrări)? */
export function isSubscriptionActive(status: SubStatus, currentPeriodEnd?: Date | null): boolean {
  if (status && ACTIVE_STATUSES.has(status)) return true;
  // past_due: lăsăm o fereastră scurtă (până la finalul perioadei plătite)
  if (status && GRACE_STATUSES.has(status)) {
    if (currentPeriodEnd && currentPeriodEnd.getTime() > Date.now()) return true;
  }
  return false;
}

/** Mesaj prietenos pentru UI în funcție de status. */
export function subscriptionMessage(status: SubStatus): string {
  switch (status) {
    case "past_due":
      return "Plata abonamentului a întârziat. Actualizează cardul ca să nu se întrerupă serviciile.";
    case "canceled":
      return "Abonamentul a fost anulat. Serviciile sunt suspendate — reactivează ca să le repornești.";
    case "inactive":
    case null:
    case undefined:
      return "Nu ai un abonament activ. Alege un plan ca să activezi agenții.";
    default:
      return "Abonamentul tău necesită atenție pentru a continua serviciile.";
  }
}

/** Eticheta + culoarea statusului (pentru badge-uri). */
export function subscriptionBadge(status: SubStatus): { label: string; color: string } {
  switch (status) {
    case "active": return { label: "Activ", color: "#059669" };
    case "trialing": return { label: "Trial", color: "#2563EB" };
    case "past_due": return { label: "Plată întârziată", color: "#D97706" };
    case "canceled": return { label: "Anulat", color: "#DC2626" };
    default: return { label: "Inactiv", color: "#6B7280" };
  }
}
