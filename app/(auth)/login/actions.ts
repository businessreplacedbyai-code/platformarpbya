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
  type StaffRole,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

function fail(next?: string): never {
  const params = new URLSearchParams({ error: "1" });
  if (next) params.set("next", next);
  redirect(`/login?${params.toString()}`);
}

/**
 * Login UNIFICAT — un singur formular pentru toți (clienți + angajații tăi).
 * Verifică silențios mai întâi tabela AdminUser (staff), apoi Client. Mesajul
 * de eroare e generic ca să nu se afle din afară că există tabel admin.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) fail();

  const { email, password, next } = parsed.data;

  // 1) Staff (AdminUser) — încercare silențioasă
  const staff = await prisma.adminUser.findUnique({ where: { email } });
  if (staff) {
    const ok = await bcrypt.compare(password, staff.passwordHash);
    if (!ok) fail(next);
    await createAdminSession({
      sub: staff.id,
      email: staff.email,
      name: staff.name ?? undefined,
      staffRole: "OWNER" as StaffRole,
    });
    redirect(next || "/admin");
  }

  // 2) Bootstrap primul Owner din env, doar dacă nu există niciun staff
  const bootEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const bootPass = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (bootEmail && bootPass && email === bootEmail && password === bootPass) {
    const count = await prisma.adminUser.count();
    if (count === 0) {
      const hash = await bcrypt.hash(password, 10);
      const created = await prisma.adminUser.create({
        data: { email, passwordHash: hash, name: "Owner" },
      });
      await createAdminSession({
        sub: created.id,
        email: created.email,
        name: created.name ?? undefined,
        staffRole: "OWNER",
      });
      redirect(next || "/admin");
    }
  }

  // 3) Client
  const client = await prisma.client.findUnique({ where: { email } });
  if (client?.passwordHash) {
    const ok = await bcrypt.compare(password, client.passwordHash);
    if (!ok) fail(next);
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

  // Nimeni — același mesaj generic.
  fail(next);
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/login");
}

export async function logoutClient() {
  await destroyClientSession();
  redirect("/login");
}
