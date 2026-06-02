import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "rbai_admin";
const CLIENT_COOKIE = "rbai_client";

async function isValid(token: string | undefined, expectRole: "admin" | "client") {
  if (!token) return false;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return (payload as { role?: string }).role === expectRole;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/* (mai puțin /admin/login) cere sesiune admin
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const ok = await isValid(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // /portal/* cere sesiune client
  if (pathname.startsWith("/portal")) {
    const ok = await isValid(req.cookies.get(CLIENT_COOKIE)?.value, "client");
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();

  // Security headers
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/((?!_next/static|_next/image|favicon|icon|apple-icon|manifest|robots|sitemap|public).*)",
  ],
};
