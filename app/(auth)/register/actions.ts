"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { createClientSession } from "@/lib/auth";

export type RegisterField = "businessName" | "email" | "password" | "confirmPassword";

export type RegisterState = {
  error?: string;
  fieldErrors?: Partial<Record<RegisterField, string>>;
  values?: { businessName?: string; email?: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Înregistrare PUBLICĂ self-serve. Returnează erori per-câmp (useActionState);
// pe succes creează cont + sesiune și redirectează în portal.
export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const businessName = String(formData.get("businessName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const planRaw = String(formData.get("plan") || "");
  const plan = planRaw || undefined;
  const values = { businessName, email };

  const fieldErrors: NonNullable<RegisterState["fieldErrors"]> = {};
  if (businessName.length < 2) fieldErrors.businessName = "Scrie numele afacerii (minim 2 caractere).";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Introdu un email valid.";
  if (password.length < 8) fieldErrors.password = "Parola trebuie să aibă minim 8 caractere.";
  if (confirmPassword !== password) fieldErrors.confirmPassword = "Parolele nu coincid.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: "Există deja un cont cu acest email." }, values };

  const base = slugify(businessName) || "client";
  let slug = base;
  while (await prisma.client.findUnique({ where: { slug } })) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const client = await prisma.client.create({
    data: {
      slug,
      businessName,
      contactName: businessName,
      email,
      phone: "",
      intakeToken: crypto.randomUUID(),
      passwordHash,
      mustSetPassword: false,
      status: "onboarding",
      subscriptionStatus: "inactive",
      planKey: "free",
    },
  });

  await createClientSession({
    sub: client.id,
    email: client.email,
    name: client.contactName,
    clientSlug: client.slug,
  });

  redirect(plan && plan !== "free" ? "/portal/planuri" : "/portal");
}
