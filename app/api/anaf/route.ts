import { NextResponse } from "next/server";
import { lookupCUI, normalizeCUI } from "@/lib/anaf";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`anaf:${ip}`, 20, 60_000); // 20 / minut
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Prea multe cereri. Reîncearcă într-un minut." },
      { status: 429 }
    );
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("cui") ?? "";
  const cui = normalizeCUI(raw);
  if (!cui) {
    return NextResponse.json({ valid: false, error: "CUI lipsă" }, { status: 400 });
  }

  const result = await lookupCUI(cui);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
