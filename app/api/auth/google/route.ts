import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { isGoogleEnabled, googleRedirectUri, getGoogleAuthUrl } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

// Start OAuth: generează state (anti-CSRF), îl pune în cookie httpOnly, redirect la Google.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  if (!isGoogleEnabled()) {
    return NextResponse.redirect(new URL("/register?error=google_off", origin));
  }

  const plan = req.nextUrl.searchParams.get("plan") || "";
  const next = req.nextUrl.searchParams.get("next") || "";
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = googleRedirectUri(origin);

  const res = NextResponse.redirect(getGoogleAuthUrl(redirectUri, state));
  res.cookies.set("rbai_oauth", JSON.stringify({ state, plan, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minute
  });
  return res;
}
