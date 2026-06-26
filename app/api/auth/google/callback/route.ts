import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { createClientToken, CLIENT_COOKIE, CLIENT_MAX_AGE } from "@/lib/auth";
import { isGoogleEnabled, googleRedirectUri, exchangeGoogleCode } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Doar căi interne ("/foo"), nu URL-uri externe — anti open-redirect.
function safeNext(next?: string): string | null {
  if (!next) return null;
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return null;
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (e: string) => NextResponse.redirect(new URL(`/login?error=${e}`, origin));

  if (!isGoogleEnabled()) return fail("oauth");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const raw = req.cookies.get("rbai_oauth")?.value;
  if (!code || !state || !raw) return fail("oauth");

  let saved: { state: string; plan?: string; next?: string };
  try {
    saved = JSON.parse(raw);
  } catch {
    return fail("oauth");
  }

  // Comparație timing-safe a state-ului.
  const a = Buffer.from(saved.state || "");
  const b = Buffer.from(state);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return fail("oauth");

  let profile;
  try {
    profile = await exchangeGoogleCode(code, googleRedirectUri(origin));
  } catch {
    return fail("oauth");
  }
  // Email-ul TREBUIE verificat de Google ca să legăm contul în siguranță.
  if (!profile.email || !profile.emailVerified) return fail("oauth_email");

  const client = await prisma.client.findUnique({ where: { email: profile.email } });
  if (!client) {
    // Done-for-you: fără auto-signup. Doar clienții creați de admin se pot loga.
    return NextResponse.redirect(new URL("/login?error=no_account", origin));
  }
  await prisma.client.update({
    where: { id: client.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createClientToken({
    sub: client.id,
    email: client.email,
    name: client.contactName,
    clientSlug: client.slug,
  });

  const dest =
    safeNext(saved.next) ||
    (saved.plan && saved.plan !== "free" ? "/portal/planuri" : "/portal");

  const res = NextResponse.redirect(new URL(dest, origin));
  res.cookies.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CLIENT_MAX_AGE,
  });
  res.cookies.delete("rbai_oauth");
  return res;
}
