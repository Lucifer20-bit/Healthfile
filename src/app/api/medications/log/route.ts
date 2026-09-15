import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const patientId = user.role === "PATIENT" ? user.id : searchParams.get("patientId") || user.id;

    const logs = await prisma.medicationLog.findMany({
      where: {
        patientId,
        scheduledDate: date,
      },
      include: {
        prescriptionItem: {
          include: {
            prescription: {
              include: {
                doctor: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Medication logs GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      prescriptionItemId,
      scheduledDate,
      timeSlot = "MORNING",
      status = "TAKEN",
      notes,
    } = body;

    const patientId = user.role === "PATIENT" ? user.id : body.patientId || user.id;
    const date = scheduledDate || new Date().toISOString().split("T")[0];

    // Check if log already exists for this slot
    const existing = await prisma.medicationLog.findFirst({
      where: {
        prescriptionItemId,
        patientId,
        scheduledDate: date,
        timeSlot,
      },
    });

    let log;
    if (existing) {
      log = await prisma.medicationLog.update({
        where: { id: existing.id },
        data: {
          status,
          takenAt: status === "TAKEN" ? new Date() : null,
          notes: notes !== undefined ? notes : existing.notes,
        },
        include: {
          prescriptionItem: true,
        },
      });
    } else {
      log = await prisma.medicationLog.create({
        data: {
          prescriptionItemId,
          patientId,
          scheduledDate: date,
          timeSlot,
          status,
          takenAt: status === "TAKEN" ? new Date() : null,
          notes: notes || null,
        },
        include: {
          prescriptionItem: true,
        },
      });
    }

    await logAuditEvent({
      userId: user.id,
      action: "LOG_MEDICATION",
      entity: "MedicationLog",
      details: `Medication intake updated to "${status}" for ${log.prescriptionItem?.medicationName || "Item"} (${timeSlot})`,
    });

    return NextResponse.json({
      message: "Medication log recorded successfully",
      log,
    });
  } catch (error) {
    console.error("Medication log POST error:", error);
    return NextResponse.json(
      { error: "Failed to log medication" },
      { status: 500 }
    );
  }
}
