import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            patientProfile: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            doctorProfile: true,
          },
        },
        attachments: true,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Security check: Patient can only view their own
    if (user.role === "PATIENT" && record.patientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await logAuditEvent({
      userId: user.id,
      action: "VIEW_RECORD",
      entity: "MedicalRecord",
      details: `Viewed record "${record.title}" (ID: ${record.id})`,
    });

    return NextResponse.json({
      record: {
        ...record,
        vitals: record.vitalsJson ? JSON.parse(record.vitalsJson) : null,
      },
    });
  } catch (error) {
    console.error("Record single GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await prisma.medicalRecord.findUnique({ where: { id } });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (user.role === "PATIENT" && record.patientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.medicalRecord.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "DELETE_RECORD",
      entity: "MedicalRecord",
      details: `Deleted medical record "${record.title}" (ID: ${id})`,
    });

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Record DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
