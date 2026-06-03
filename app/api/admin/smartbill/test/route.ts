// Test SmartBill — verifică conexiunea + listează seriile + (opțional) emite o factură test.
// GET  /api/admin/smartbill/test  → status + serii
// POST /api/admin/smartbill/test  → emite o factură de test de €1 către propria firmă
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createInvoice, smartBillEnabled } from "@/lib/smartbill";

export const runtime = "nodejs";

const BASE = "https://ws.smartbill.ro/SBORO/api";

function authHeader(): string {
  const user = process.env.SMARTBILL_USERNAME ?? "";
  const token = process.env.SMARTBILL_TOKEN ?? "";
  return "Basic " + Buffer.from(`${user}:${token}`).toString("base64");
}

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabled = smartBillEnabled();
  const cif = process.env.SMARTBILL_CIF;
  const series = process.env.SMARTBILL_SERIES;

  let seriesList: unknown = null;
  let seriesError: string | null = null;
  if (cif) {
    try {
      const res = await fetch(`${BASE}/series?cif=${cif}&type=f`, {
        headers: { Authorization: authHeader(), Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      seriesList = await res.json();
    } catch (e) {
      seriesError = String(e);
    }
  }

  return NextResponse.json({
    enabled,
    envConfigured: {
      username: !!process.env.SMARTBILL_USERNAME,
      token: !!process.env.SMARTBILL_TOKEN,
      cif: !!process.env.SMARTBILL_CIF,
      series: !!process.env.SMARTBILL_SERIES,
    },
    cif,
    seriesEnvValue: series,
    seriesFromApi: seriesList,
    seriesError,
    hint: !enabled
      ? "Adaugă în SmartBill o serie de facturare (Configurări → Serii documente), apoi pune numele ei în SMARTBILL_SERIES."
      : "OK. Trimite POST pe acest endpoint ca să emiți o factură test de €1.",
  });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!smartBillEnabled()) {
    return NextResponse.json(
      { ok: false, error: "SmartBill nu e configurat complet (lipsește SMARTBILL_SERIES sau alt env)." },
      { status: 400 }
    );
  }

  const res = await createInvoice({
    client: {
      name: "Test ReplacedByAI",
      email: process.env.SMARTBILL_USERNAME,
      vatCode: process.env.SMARTBILL_CIF,
      isTaxPayer: true,
      city: "București",
      county: "București",
      address: "Test address",
    },
    items: [{
      name: "Factură test integrare (ștergere admin)",
      price: 1,
      currency: "EUR",
      measuringUnit: "serviciu",
      isTaxIncluded: true,
      taxPercentage: 19,
    }],
    currency: "EUR",
    sendEmail: false,
    mentions: "Test conexiune SmartBill — se poate șterge.",
  });

  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
