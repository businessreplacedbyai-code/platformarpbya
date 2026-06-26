// Website Builder — generare asset-uri AI (MUAPI): poze Flux + 1 video Seedance cu efect de scroll.
// Protejat pe admin în MVP (ca să nu ardă oricine creditele).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getClientSession } from "@/lib/auth";
import { TYPE_PRESETS, PALETTES } from "@/components/builder/types";
import { checkAi, consumeAi } from "@/lib/usage";

// Placeholder gradient (SVG data-URI) — pentru modul demo, fără chei API.
function phImg(a: string, b: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const runtime = "nodejs";
export const maxDuration = 300;

const BASE = "https://api.muapi.ai/api/v1";

function extractUrls(j: unknown): string[] {
  const urls: string[] = [];
  const walk = (o: unknown) => {
    if (!o) return;
    if (typeof o === "string" && /^https?:\/\//.test(o)) urls.push(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (typeof o === "object") Object.values(o as Record<string, unknown>).forEach(walk);
  };
  walk(j);
  return [...new Set(urls)];
}

async function muGenerate(endpoint: string, body: Record<string, unknown>, key: string, timeoutMs = 240000): Promise<string | null> {
  const H = { "Content-Type": "application/json", "x-api-key": key };
  const r = await fetch(`${BASE}/${endpoint}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  const t = await r.text();
  let j: Record<string, unknown>;
  try { j = JSON.parse(t); } catch { return null; }
  const id = (j.request_id || (j.data as Record<string, unknown>)?.id || j.id) as string | undefined;
  if (!id) return null;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((s) => setTimeout(s, 5000));
    const pr = await fetch(`${BASE}/predictions/${id}/result`, { headers: H });
    const pt = await pr.text();
    let pj: Record<string, unknown>;
    try { pj = JSON.parse(pt); } catch { continue; }
    const status = String(pj.status || (pj.data as Record<string, unknown>)?.status || "").toLowerCase();
    if (["completed", "succeeded", "success"].includes(status)) {
      const urls = extractUrls(pj);
      return urls.find((u) => /\.(jpg|jpeg|png|webp|mp4)/i.test(u)) || urls[0] || null;
    }
    if (["failed", "error"].includes(status)) return null;
  }
  return null;
}

const flux = (prompt: string, key: string, w = 1024, h = 1024) =>
  muGenerate("flux-dev-image", { prompt, width: w, height: h, num_images: 1 }, key, 120000);

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  const client = admin ? null : await getClientSession();
  if (!admin && !client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type = "altul", withVideo = true, real = false } = await req.json();
  const preset = TYPE_PRESETS[type] ?? TYPE_PRESETS.altul;
  const key = process.env.MUAPI_KEY;

  // MOD DEMO (default) — funcționează fără nicio cheie API: placeholdere pe paleta aleasă.
  if (!real || !key) {
    const pal = PALETTES[preset.paletteKey ?? "espresso"] ?? PALETTES.espresso;
    return NextResponse.json({
      ok: true,
      demo: true,
      heroImage: phImg(pal.accent, pal.accent2),
      heroVideo: null,
      galleryImgs: [phImg(pal.accent2, pal.soft), phImg(pal.accent, pal.bg), phImg(pal.soft, pal.accent2)],
    });
  }

  // Gating usage pentru clienți self-serve (admin = nelimitat; demo nu ajunge aici)
  if (client?.clientSlug) {
    const gate = await checkAi(client.clientSlug);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.reason, limitReached: true, used: gate.used, limit: gate.limit }, { status: 402 });
    }
  }

  const style = "moody cinematic commercial photography, photorealistic, ultra detailed, no text, no watermark";

  try {
    // Poze în paralel (hero landscape + 3 servicii) ca să încapă în timeout
    const [heroImage, s0, s1, s2] = await Promise.all([
      flux(`${preset.heroPrompt}, ${style}`, key, 1344, 768),
      flux(`${preset.servicePrompts[0]}, ${style}`, key),
      flux(`${preset.servicePrompts[1]}, ${style}`, key),
      flux(`${preset.servicePrompts[2]}, ${style}`, key),
    ]);

    let heroVideo: string | null = null;
    if (withVideo && heroImage) {
      // Video din imaginea hero (URL public Flux → image_url Seedance, fără upload separat)
      heroVideo = await muGenerate(
        "seedance-pro-i2v-fast",
        { prompt: "subtle slow cinematic motion, gentle camera, elegant, loopable", image_url: heroImage, duration: 5, resolution: "720p", camera_fixed: true },
        key,
        220000
      );
    }

    if (client?.clientSlug) await consumeAi(client.clientSlug);

    return NextResponse.json({
      ok: true,
      heroImage,
      heroVideo,
      galleryImgs: [s0, s1, s2].filter(Boolean),
    });
  } catch (e) {
    return NextResponse.json({ error: `Generare eșuată: ${String(e).slice(0, 200)}` }, { status: 500 });
  }
}
