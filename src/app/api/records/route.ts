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
    const patientId = searchParams.get("patientId");
    const recordType = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};

    // Access control: Patients only see their own records, Doctors see records for their patients or all patients, Admins see all
    if (user.role === "PATIENT") {
      where.patientId = user.id;
    } else if (patientId) {
      where.patientId = patientId;
    }

    if (recordType && recordType !== "ALL") {
      where.recordType = recordType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const records = await prisma.medicalRecord.findMany({
      where,
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
      orderBy: { date: "desc" },
    });

    const formattedRecords = records.map((rec) => ({
      ...rec,
      vitals: rec.vitalsJson ? JSON.parse(rec.vitalsJson) : null,
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (error) {
    console.error("Records GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
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
      title,
      recordType = "GENERAL",
      description,
      date,
      vitals,
      patientId,
      attachments = [],
    } = body;

    const targetPatientId = user.role === "PATIENT" ? user.id : patientId || user.id;
    const targetDoctorId = user.role === "DOCTOR" ? user.id : null;

    if (!title) {
      return NextResponse.json(
        { error: "Record title is required." },
        { status: 400 }
      );
    }

    const record = await prisma.medicalRecord.create({
      data: {
        title,
        recordType,
        description,
        date: date ? new Date(date) : new Date(),
        vitalsJson: vitals ? JSON.stringify(vitals) : null,
        patientId: targetPatientId,
        doctorId: targetDoctorId,
        attachments: {
          create: attachments.map((att: any) => ({
            fileName: att.fileName || "document",
            originalName: att.originalName || att.fileName || "document.pdf",
            filePath: att.filePath || "/uploads/samples/sample_lab_report.pdf",
            mimeType: att.mimeType || "application/pdf",
            fileSize: att.fileSize || 102400,
          })),
        },
      },
      include: {
        patient: true,
        doctor: true,
        attachments: true,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "UPLOAD_RECORD",
      entity: "MedicalRecord",
      details: `Created medical record "${title}" (${recordType}) for patient ID ${targetPatientId}.`,
    });

    return NextResponse.json({
      message: "Medical record created successfully",
      record: {
        ...record,
        vitals: record.vitalsJson ? JSON.parse(record.vitalsJson) : null,
      },
    });
  } catch (error) {
    console.error("Records POST error:", error);
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 }
    );
  }
}
