// Rate limiter în memorie (token-bucket fix-window).
// Suficient pentru o instanță Next.js. Pentru multi-instance: înlocuiește cu Redis/Upstash.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Curățare periodică ca să nu crească la infinit
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * @param key  identificator (ip:route)
 * @param max  cereri permise
 * @param windowMs fereastra în ms
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  maybeCleanup();
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (b.count >= max) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  b.count++;
  return { ok: true, remaining: max - b.count, resetAt: b.resetAt };
}

/**
 * Extrage IP din headere (Vercel / Cloudflare / proxy).
 */
export function getClientIp(req: Request): string {
  const h = req.headers;
  const fwd =
    h.get("x-forwarded-for") ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "";
  return fwd.split(",")[0].trim() || "unknown";
}

/**
 * Hash SHA-256 al IP-ului pentru logging GDPR-friendly.
 */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.IP_HASH_SALT || "rbai"));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
