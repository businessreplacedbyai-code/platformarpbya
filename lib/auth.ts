import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "rbai_admin";
export const CLIENT_COOKIE = "rbai_client";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_JWT_SECRET lipsește sau e <32 caractere în .env.local");
  }
  return new TextEncoder().encode(secret);
}

export type StaffRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER" | "CALLER";

export type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
  role: "admin" | "client";
  staffRole?: StaffRole; // doar pentru sesiunile admin
  clientSlug?: string;
};

const STAFF_RANK: Record<StaffRole, number> = {
  CALLER: 0,
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function staffCan(role: StaffRole | undefined, min: StaffRole) {
  if (!role) return false;
  return STAFF_RANK[role] >= STAFF_RANK[min];
}

async function sign(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function createAdminSession(
  p: Omit<SessionPayload, "role"> & { staffRole?: StaffRole }
) {
  const token = await sign({ ...p, role: "admin" });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function createClientSession(
  p: Omit<SessionPayload, "role"> & { clientSlug: string }
) {
  const token = await sign({ ...p, role: "client" });
  const jar = await cookies();
  jar.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Pentru route handlers (ex: OAuth callback) care își setează singure cookie-ul
// direct pe NextResponse — returnează doar token-ul semnat.
export async function createClientToken(
  p: Omit<SessionPayload, "role"> & { clientSlug: string }
) {
  return sign({ ...p, role: "client" });
}
export const CLIENT_MAX_AGE = MAX_AGE;

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function destroyClientSession() {
  const jar = await cookies();
  jar.delete(CLIENT_COOKIE);
}

async function readCookie(name: string): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  return readCookie(ADMIN_COOKIE);
}

export async function getClientSession() {
  return readCookie(CLIENT_COOKIE);
}

export async function verifyTokenEdge(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// Backwards-compat pentru codul existent
export const getSession = getAdminSession;
export const createSession = createAdminSession;
export const destroySession = destroyAdminSession;
export const SESSION_COOKIE = ADMIN_COOKIE;
