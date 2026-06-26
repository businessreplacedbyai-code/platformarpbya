"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createClientSession } from "@/lib/auth";

// Client își setează singur parola prin linkul unic (intakeToken).
export async function activateAccount(token: string, formData: FormData): Promise<void> {
  const pass = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (pass.length < 8) redirect(`/activare-cont/${token}?err=short`);
  if (pass !== confirm) redirect(`/activare-cont/${token}?err=match`);

  const client = await prisma.client.findUnique({ where: { intakeToken: token } });
  if (!client) redirect(`/activare-cont/${token}?err=token`);

  const hash = await bcrypt.hash(pass, 10);
  await prisma.client.update({
    where: { id: client.id },
    data: { passwordHash: hash, mustSetPassword: false },
  });
  await createClientSession({ sub: client.id, email: client.email, name: client.contactName, clientSlug: client.slug });
  redirect("/portal");
}
