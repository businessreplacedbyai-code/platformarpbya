"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

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

  redirect(`/intake/${token}/thanks`);
}
