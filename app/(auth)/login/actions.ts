"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  createAdminSession,
  createClientSession,
  destroyAdminSession,
  destroyClientSession,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  type: z.enum(["admin", "client"]),
  next: z.string().optional(),
});

function loginError(type: string, msg: string, next?: string): never {
  const params = new URLSearchParams({ type, error: msg });
  if (next) params.set("next", next);
  redirect(`/login?${params.toString()}`);
}

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    type: formData.get("type"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) loginError("admin", "Date invalide");

  const { email, password, type, next } = parsed.data;

  if (type === "admin") {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      // Bootstrap primul admin din env, dacă nu există încă niciunul
      const bootEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
      const bootPass = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      const count = await prisma.adminUser.count();
      if (count === 0 && bootEmail && bootPass && email === bootEmail && password === bootPass) {
        const hash = await bcrypt.hash(password, 10);
        const created = await prisma.adminUser.create({
          data: { email, passwordHash: hash, name: "Owner" },
        });
        await createAdminSession({
          sub: created.id,
          email: created.email,
          name: created.name ?? undefined,
        });
        redirect(next || "/admin");
      }
      loginError(type, "Email sau parolă incorectă", next);
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) loginError(type, "Email sau parolă incorectă", next);

    await createAdminSession({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });
    redirect(next || "/admin");
  } else {
    const client = await prisma.client.findUnique({ where: { email } });
    if (!client || !client.passwordHash) {
      loginError(type, "Cont inexistent. Cere admin-ului acces.", next);
    }
    const ok = await bcrypt.compare(password, client.passwordHash);
    if (!ok) loginError(type, "Email sau parolă incorectă", next);

    await createClientSession({
      sub: client.id,
      email: client.email,
      name: client.contactName,
      clientSlug: client.slug,
    });
    await prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });
    redirect(next || "/portal");
  }
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/login?type=admin");
}

export async function logoutClient() {
  await destroyClientSession();
  redirect("/login?type=client");
}
