import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CallerClient } from "./CallerClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getAdminSession();
  let notifyEmail = "";
  if (s?.sub) {
    const u = await prisma.adminUser.findUnique({ where: { id: s.sub }, select: { notifyEmail: true } });
    notifyEmail = u?.notifyEmail || "";
  }
  return <CallerClient initialEmail={notifyEmail} />;
}
