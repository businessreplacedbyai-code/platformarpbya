"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, passwordResetEmail } from "@/lib/mail";
import { z } from "zod";
import { destroyAdminSession, destroyClientSession } from "@/lib/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const requestSchema = z.object({
  email: z.string().email(),
  type: z.enum(["admin", "client"]),
});

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
  passwordConfirm: z.string(),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = requestSchema.safeParse({
    email: formData.get("email"),
    type: formData.get("type"),
  });
  if (!parsed.success) {
    redirect(`/login/forgot?status=error`);
  }
  const { email, type } = parsed.data;

  let userId: string | null = null;
  let name: string | null = null;

  if (type === "admin") {
    const u = await prisma.adminUser.findUnique({ where: { email } });
    if (u) {
      userId = u.id;
      name = u.name ?? null;
    }
  } else {
    const c = await prisma.client.findUnique({ where: { email } });
    if (c) {
      userId = c.id;
      name = c.contactName;
    }
  }

  // Always behave the same to avoid email enumeration
  if (userId) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 oră

    // Invalidează tokens existente pentru acest user
    await prisma.passwordReset.deleteMany({
      where: { userId, userType: type, usedAt: null },
    });
    await prisma.passwordReset.create({
      data: { tokenHash, userType: type, userId, expiresAt },
    });

    const resetUrl = `${SITE_URL}/login/reset?token=${rawToken}&type=${type}`;
    await sendEmail({
      to: email,
      subject: "Resetare parolă ReplacedByAI",
      html: passwordResetEmail(name, resetUrl),
    });
  }

  redirect(`/login/forgot?status=sent`);
}

export type ResetResult = { error: string } | undefined;

export async function resetPassword(formData: FormData): Promise<ResetResult> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Date invalide" };
  }
  const { token, password, passwordConfirm } = parsed.data;
  if (password !== passwordConfirm) {
    return { error: "Parolele nu corespund" };
  }

  const tokenHash = hashToken(token);
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return { error: "Link expirat sau deja folosit. Cere un link nou." };
  }

  const hash = await bcrypt.hash(password, 10);

  if (reset.userType === "admin") {
    await prisma.adminUser.update({
      where: { id: reset.userId },
      data: { passwordHash: hash },
    });
  } else {
    await prisma.client.update({
      where: { id: reset.userId },
      data: { passwordHash: hash, mustSetPassword: false },
    });
  }

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  // Invalidează sesiunile existente pe orice rol
  await destroyAdminSession();
  await destroyClientSession();

  redirect(`/login?type=${reset.userType}`);
}
