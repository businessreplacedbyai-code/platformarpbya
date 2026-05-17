// Validare CUI/CIF prin API-ul public ANAF.
// Endpoint: https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva
// Doc: https://static.anaf.ro/static/10/Anaf/Informatii_R/API/ws_v9_doc.txt

export type AnafResult = {
  valid: boolean;
  cui: string;
  name?: string;
  address?: string;
  vatPayer?: boolean;
  vatPayerCash?: boolean;
  inactive?: boolean;
  registrationDate?: string;
  raw?: unknown;
};

/**
 * Curăță un CUI primit de la utilizator: scoate RO/spații, păstrează doar cifre.
 */
export function normalizeCUI(input: string): string {
  return String(input || "")
    .toUpperCase()
    .replace(/^RO/, "")
    .replace(/\D/g, "")
    .trim();
}

/**
 * Validează checksum-ul matematic al CUI-ului (algoritm oficial RO).
 * Returnează true dacă CUI-ul are structură matematică validă.
 */
export function isValidCUIChecksum(cuiRaw: string): boolean {
  const cui = normalizeCUI(cuiRaw);
  if (cui.length < 2 || cui.length > 10) return false;
  if (!/^\d+$/.test(cui)) return false;

  // Algoritm oficial: ultima cifră e cifra de control.
  const controlKey = "753217532";
  const cifraControl = parseInt(cui.slice(-1), 10);
  const number = cui.slice(0, -1);
  // Aliniere dreapta la 9 cifre
  const padded = number.padStart(9, "0");

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(padded[i], 10) * parseInt(controlKey[i], 10);
  }
  const computed = (sum * 10) % 11 === 10 ? 0 : (sum * 10) % 11;
  return computed === cifraControl;
}

/**
 * Apel la API-ul ANAF pentru date oficiale. Are timeout 4s ca să nu blocheze UI.
 */
export async function lookupCUI(cuiInput: string): Promise<AnafResult> {
  const cui = normalizeCUI(cuiInput);
  const result: AnafResult = { valid: false, cui };

  if (!isValidCUIChecksum(cui)) {
    return result;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ cui: Number(cui), data: today }]),
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      // Checksum valid dar API down — considerăm valid pe baza checksum-ului
      return { ...result, valid: true };
    }

    const json = (await res.json()) as {
      found?: Array<{
        date_generale?: {
          cui?: number;
          denumire?: string;
          adresa?: string;
          data_inregistrare?: string;
        };
        inregistrare_scop_Tva?: { scpTVA?: boolean };
        inregistrare_RTVAI?: { statusTvaIncasare?: boolean };
        stare_inactiv?: { statusInactivi?: boolean };
      }>;
    };

    const found = json.found?.[0];
    if (!found) {
      // CUI valid matematic dar nu există la ANAF — pot fi PFA/persoane fizice
      return { ...result, valid: true };
    }

    return {
      valid: true,
      cui,
      name: found.date_generale?.denumire,
      address: found.date_generale?.adresa,
      registrationDate: found.date_generale?.data_inregistrare,
      vatPayer: found.inregistrare_scop_Tva?.scpTVA,
      vatPayerCash: found.inregistrare_RTVAI?.statusTvaIncasare,
      inactive: found.stare_inactiv?.statusInactivi,
      raw: found,
    };
  } catch {
    // Network error / timeout — fallback la checksum
    return { ...result, valid: true };
  }
}

/**
 * Validare număr de telefon RO (mobile + fixe).
 * Acceptă +40, 0040, 0 prefix.
 */
export function isValidRomanianPhone(phone: string): boolean {
  const cleaned = String(phone || "").replace(/[\s().-]/g, "");
  // +40 7XXXXXXXX (mobile) sau 07XXXXXXXX
  // +40 2/3XXXXXXXX (fix) sau 02/3XXXXXXXX
  return /^(\+40|0040|0)?[237]\d{8}$/.test(cleaned);
}

/**
 * Normalizează telefon RO la format E.164 (+40...).
 */
export function normalizeRomanianPhone(phone: string): string {
  const cleaned = String(phone || "").replace(/[\s().-]/g, "");
  if (cleaned.startsWith("+40")) return cleaned;
  if (cleaned.startsWith("0040")) return "+40" + cleaned.slice(4);
  if (cleaned.startsWith("0")) return "+40" + cleaned.slice(1);
  if (/^\d{9}$/.test(cleaned)) return "+40" + cleaned;
  return cleaned;
}
