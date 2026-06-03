// SmartBill — facturare automată + e-Factura ANAF.
// Emite facturi când Stripe confirmă o plată (abonament sau one-time).
// Auth: Basic base64(email:token). Docs: https://api.smartbill.ro
//
// ENV necesare (.env.local + Vercel):
//   SMARTBILL_USERNAME  — emailul contului SmartBill
//   SMARTBILL_TOKEN     — token API (Contul meu → Integrări → API)
//   SMARTBILL_CIF       — CIF-ul firmei tale (ex: 54666360)
//   SMARTBILL_SERIES    — seria de facturare creată în SmartBill (ex: "RBA")
//
// Notă: trebuie să creezi o serie de facturi în SmartBill
//   (Configurări → Serii documente) și să-i pui numele în SMARTBILL_SERIES.

const BASE = "https://ws.smartbill.ro/SBORO/api";

export function smartBillEnabled(): boolean {
  return !!(
    process.env.SMARTBILL_USERNAME &&
    process.env.SMARTBILL_TOKEN &&
    process.env.SMARTBILL_CIF &&
    process.env.SMARTBILL_SERIES
  );
}

function authHeader(): string {
  const user = process.env.SMARTBILL_USERNAME ?? "";
  const token = process.env.SMARTBILL_TOKEN ?? "";
  return "Basic " + Buffer.from(`${user}:${token}`).toString("base64");
}

export type InvoiceClient = {
  name: string;
  email?: string | null;
  vatCode?: string | null;   // CUI (firmă) sau CNP (persoană); gol = persoană fizică fără cod
  isTaxPayer?: boolean;      // true dacă e plătitor de TVA
  address?: string | null;
  city?: string | null;
  county?: string | null;
};

export type InvoiceItem = {
  name: string;
  price: number;             // în unități de monedă (NU cenți)
  quantity?: number;
  currency?: string;         // "EUR" | "RON"
  measuringUnit?: string;    // "buc" | "luna" | "serviciu"
  taxPercentage?: number;    // 19 implicit
  isTaxIncluded?: boolean;   // true = prețul include TVA
};

export type CreateInvoiceResult = {
  ok: boolean;
  number?: string;
  series?: string;
  error?: string;
};

function todayISO(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Emite o factură în SmartBill și (opțional) o trimite pe email clientului.
 * Nu aruncă — întoarce { ok:false, error } ca să nu blocheze webhook-ul.
 */
export async function createInvoice(opts: {
  client: InvoiceClient;
  items: InvoiceItem[];
  currency?: string;
  dueInDays?: number;
  sendEmail?: boolean;
  mentions?: string;
}): Promise<CreateInvoiceResult> {
  if (!smartBillEnabled()) {
    return { ok: false, error: "smartbill_disabled" };
  }

  const cif = process.env.SMARTBILL_CIF!;
  const series = process.env.SMARTBILL_SERIES!;
  const currency = opts.currency ?? opts.items[0]?.currency ?? "EUR";
  const issue = new Date();
  const due = new Date(issue.getTime() + (opts.dueInDays ?? 5) * 86400000);

  const body = {
    companyVatCode: cif,
    client: {
      name: opts.client.name,
      vatCode: opts.client.vatCode ?? "",
      isTaxPayer: opts.client.isTaxPayer ?? false,
      address: opts.client.address ?? "",
      city: opts.client.city ?? "",
      county: opts.client.county ?? "",
      country: "Romania",
      email: opts.client.email ?? "",
      saveToDb: true,
    },
    issueDate: todayISO(issue),
    seriesName: series,
    currency,
    language: "RO",
    precision: 2,
    isDraft: false,
    useStock: false,
    dueDate: todayISO(due),
    sendEmail: opts.sendEmail ?? true,
    mentions: opts.mentions ?? "",
    products: opts.items.map((it) => ({
      name: it.name,
      isDiscount: false,
      measuringUnitName: it.measuringUnit ?? "buc",
      currency: it.currency ?? currency,
      quantity: it.quantity ?? 1,
      price: it.price,
      isTaxIncluded: it.isTaxIncluded ?? true,
      taxName: "Normala",
      taxPercentage: it.taxPercentage ?? 19,
      saveToDb: false,
      isService: true,
    })),
  };

  try {
    const res = await fetch(`${BASE}/invoice`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    const data = (await res.json().catch(() => ({}))) as {
      number?: string;
      series?: string;
      errorText?: string;
      message?: string;
    };

    if (!res.ok || data.errorText) {
      return { ok: false, error: data.errorText || data.message || `HTTP ${res.status}` };
    }
    return { ok: true, number: data.number, series: data.series };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Helper: convertește cenți Stripe → unități monedă. */
export const fromStripeAmount = (amount: number) => Math.round(amount) / 100;
