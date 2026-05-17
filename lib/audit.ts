import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { hashIp } from "@/lib/rate-limit";

type LogInput = {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
};

/**
 * Loghează o acțiune admin în AuditLog. Niciodată nu aruncă — failsafe.
 */
export async function audit(input: LogInput) {
  try {
    const session = await getAdminSession();
    const ipHash = input.ip ? await hashIp(input.ip) : undefined;
    await prisma.auditLog.create({
      data: {
        actorId: session?.sub,
        actorEmail: session?.email,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ipHash,
      },
    });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}
