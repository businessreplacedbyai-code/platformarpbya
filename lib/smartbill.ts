// Facturare automată — Oblio.eu (e-Factura ANAF).
// Numele "smartbill" e păstrat pentru compatibilitate cu importurile existente
// (webhook Stripe, panou facturi custom). Implementarea e Oblio.
//
// ENV necesare:
//   OBLIO_EMAIL       — emailul contului Oblio
//   OBLIO_SECRET      — secret API (Cont → Setări → API)
//   OBLIO_CIF         — CIF firmă (ex: 54666360)
//   OBLIO_SERIES      — seria de facturare creată în Oblio (ex: "RBA")
//   OBLIO_VAT_PAYER   — "true" dacă firma e plătitoare de TVA, altfel "false"

const BASE = "https://www.oblio.eu/api";

export function smartBillEnabled(): boolean {
  return !!(
    process.env.OBLIO_EMAIL &&
    process.env.OBLIO_SECRET &&
    process.env.OBLIO_CIF &&
    process.env.OBLIO_SERIES
  );
}

// Firma e plătitoare de TVA? Default: NU (neplătitor) → facturi fără TVA.
export function isVatPayer(): boolean {
  return process.env.OBLIO_VAT_PAYER === "true";
}

// ─── Token cache (1 oră de la Oblio) ────────────────────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const email = process.env.OBLIO_EMAIL ?? "";
  const secret = process.env.OBLIO_SECRET ?? "";
  const params = new URLSearchParams({
    client_id: email,
    client_secret: secret,
    grant_type: "client_credentials",
  });
  const res = await fetch(`${BASE}/authorize/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Oblio auth HTTP ${res.status}`);
  const data = (await res.json()) as { access_token?: string; expires_in?: string | number };
  if (!data.access_token) throw new Error("Oblio: no access_token");
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in ?? 3600) * 1000),
  };
  return data.access_token;
}

// ─── Tipuri publice (compat cu webhook + actions) ──────────────────────
export type InvoiceClient = {
  name: string;
  email?: string | null;
  vatCode?: string | null;
  isTaxPayer?: boolean;
  address?: string | null;
  city?: string | null;
  county?: string | null;
};

export type InvoiceItem = {
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
  measuringUnit?: string;
  taxPercentage?: number;
  isTaxIncluded?: boolean;
};

export type CreateInvoiceResult = {
  ok: boolean;
  number?: string;
  series?: string;
  link?: string;       // URL public Oblio pentru PDF
  einvoice?: string;   // URL e-Factura ANAF (XML)
  error?: string;
};

const todayISO = (d = new Date()) => d.toISOString().slice(0, 10);

/** Emite factură în Oblio + (opțional) trimite email clientului. */
export async function createInvoice(opts: {
  client: InvoiceClient;
  items: InvoiceItem[];
  currency?: string;
  dueInDays?: number;
  sendEmail?: boolean;
  mentions?: string;
}): Promise<CreateInvoiceResult> {
  if (!smartBillEnabled()) return { ok: false, error: "oblio_disabled" };

  const cif = process.env.OBLIO_CIF!;
  const series = process.env.OBLIO_SERIES!;
  const currency = (opts.currency ?? opts.items[0]?.currency ?? "RON").toUpperCase();
  const issue = new Date();
  const due = new Date(issue.getTime() + (opts.dueInDays ?? 5) * 86400000);
  const vatPayer = isVatPayer();

  const body = {
    cif,
    client: {
      cif: opts.client.vatCode ?? "",
      name: opts.client.name,
      address: opts.client.address ?? "",
      state: opts.client.county ?? "",
      city: opts.client.city ?? "",
      country: "Romania",
      email: opts.client.email ?? "",
      vatPayer: !!opts.client.isTaxPayer,
      save: true,
    },
    issueDate: todayISO(issue),
    dueDate: todayISO(due),
    seriesName: series,
    language: "RO",
    precision: 2,
    currency,
    products: opts.items.map((it) => {
      // Neplătitor TVA → forțăm 0%, preț fără TVA inclus
      const vatPercentage = vatPayer ? (it.taxPercentage ?? 19) : 0;
      const vatIncluded = vatPayer ? (it.isTaxIncluded ?? true) : false;
      return {
        name: it.name,
        price: it.price,
        measuringUnit: it.measuringUnit ?? "buc",
        currency: it.currency ?? currency,
        vatName: "Normala",
        vatPercentage,
        vatIncluded,
        quantity: it.quantity ?? 1,
        productType: "Serviciu",
        save: false,
      };
    }),
    mentions: opts.mentions ?? "",
    workStation: "Sediu",
    sendEmail: opts.sendEmail ? 1 : 0,
    useStock: 0,
  };

  try {
    const token = await getAccessToken();
    const res = await fetch(`${BASE}/docs/invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const data = (await res.json().catch(() => ({}))) as {
      status?: number;
      statusMessage?: string;
      data?: { seriesName?: string; number?: string; link?: string; einvoice?: string };
    };
    if (!res.ok || (data.status && data.status !== 200) || !data.data?.number) {
      return { ok: false, error: data.statusMessage || `HTTP ${res.status}` };
    }
    return {
      ok: true,
      series: data.data.seriesName,
      number: data.data.number,
      link: data.data.link,
      einvoice: data.data.einvoice,
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Descarcă PDF-ul unei facturi (Oblio servește prin link public — îl proxăm). */
export async function getInvoicePdf(
  series: string,
  number: string
): Promise<{ ok: boolean; pdf?: Buffer; error?: string }> {
  if (!smartBillEnabled()) return { ok: false, error: "oblio_disabled" };
  const cif = process.env.OBLIO_CIF!;
  try {
    const token = await getAccessToken();
    // GET document → primim link-ul public, apoi descărcăm PDF-ul
    const res = await fetch(
      `${BASE}/docs/invoice?cif=${cif}&seriesName=${encodeURIComponent(series)}&number=${encodeURIComponent(number)}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
    );
    const data = (await res.json().catch(() => ({}))) as {
      status?: number;
      data?: { link?: string };
    };
    const link = data.data?.link;
    if (!res.ok || !link) return { ok: false, error: "no_link" };
    const pdfRes = await fetch(link, { signal: AbortSignal.timeout(15000) });
    if (!pdfRes.ok) return { ok: false, error: `pdf HTTP ${pdfRes.status}` };
    const buf = Buffer.from(await pdfRes.arrayBuffer());
    return { ok: true, pdf: buf };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Retrimite factura pe email prin Oblio. */
export async function sendInvoiceEmail(
  series: string,
  number: string,
  to?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!smartBillEnabled()) return { ok: false, error: "oblio_disabled" };
  const cif = process.env.OBLIO_CIF!;
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({ cif, seriesName: series, number });
    if (to) params.set("email", to);
    const res = await fetch(`${BASE}/docs/invoice/send?${params.toString()}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json().catch(() => ({}))) as { status?: number; statusMessage?: string };
    if (!res.ok || (data.status && data.status !== 200)) {
      return { ok: false, error: data.statusMessage || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Helper: convertește cenți Stripe → unități monedă. */
export const fromStripeAmount = (amount: number) => Math.round(amount) / 100;
