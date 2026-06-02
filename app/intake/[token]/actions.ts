"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { sendEmail, intakeCompletedAdminEmail, intakeConfirmationClientEmail } from "@/lib/mail";

const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL || "contact@replacedbyai.ro";

export async function submitIntake(token: string, formData: FormData) {
  const client = await prisma.client.findUnique({ where: { intakeToken: token } });
  if (!client) throw new Error("Token invalid");
  if (client.intakeSubmittedAt) {
    redirect(`/intake/${token}/thanks`);
  }

  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const bool = (k: string) => formData.get(k) === "on";

  const data = {
    cui: get("cui"),
    address: get("address"),
    website: get("website"),
    brandColors: get("brandColors"),
    toneOfVoice: get("toneOfVoice"),
    workingHours: get("workingHours"),
    locations: get("locations"),
    services: get("services"),
    notOffered: get("notOffered"),
    mainPhone: get("mainPhone"),
    contactEmail: get("contactEmail"),
    whatsappActive: bool("whatsappActive"),
    calendarSystem: get("calendarSystem"),
    crmSystem: get("crmSystem"),
    hasGoogleWorkspace: bool("hasGoogleWorkspace"),
    hasMetaBusiness: bool("hasMetaBusiness"),
    hasPosErp: bool("hasPosErp"),
    hasStripe: bool("hasStripe"),
    euDataOnly: bool("euDataOnly"),
    hasMedicalData: bool("hasMedicalData"),
    regulatedDomain: get("regulatedDomain"),
    faqText: get("faqText"),
    testerName: get("testerName"),
    testerPhone: get("testerPhone"),
    testerEmail: get("testerEmail"),
    backupDecisionMaker: get("backupDecisionMaker"),
    doNotDisturb: get("doNotDisturb"),
  };

  await prisma.clientIntake.upsert({
    where: { clientId: client.id },
    update: data,
    create: { ...data, clientId: client.id },
  });

  await prisma.client.update({
    where: { id: client.id },
    data: { intakeSubmittedAt: new Date() },
  });

  // Notificare admin că poate începe implementarea
  sendEmail({
    to: ADMIN_NOTIFY,
    subject: `✅ Intake completat — ${client.businessName}`,
    html: intakeCompletedAdminEmail({
      clientName: client.contactName,
      businessName: client.businessName,
      slug: client.slug,
    }),
  }).catch((e) => console.error("intake admin email failed", e));

  // Confirmare pentru client
  sendEmail({
    to: client.email,
    subject: "Am primit toate informațiile — pornim! | ReplacedByAI",
    html: intakeConfirmationClientEmail(client.contactName),
  }).catch((e) => console.error("intake client email failed", e));

  redirect(`/intake/${token}/thanks`);
}
