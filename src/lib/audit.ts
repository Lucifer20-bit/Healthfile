import prisma from "@/lib/prisma";

export interface LogAuditOptions {
  userId?: string | null;
  action: string;
  entity: string;
  details?: string | null;
  ipAddress?: string | null;
}

export async function logAuditEvent(options: LogAuditOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: options.userId || null,
        action: options.action,
        entity: options.entity,
        details: options.details || null,
        ipAddress: options.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    return null;
  }
}
