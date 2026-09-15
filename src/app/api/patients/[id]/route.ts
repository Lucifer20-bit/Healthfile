import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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

    // A patient can only view their own info, doctor/admin can view any patient
    if (user.role === "PATIENT" && user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: true,
        patientRecords: {
          include: {
            attachments: true,
            doctor: { select: { name: true, doctorProfile: true } },
          },
          orderBy: { date: "desc" },
        },
        patientAppointments: {
          include: {
            doctor: {
              select: { name: true, avatar: true, doctorProfile: true },
            },
            prescription: { include: { items: true } },
          },
          orderBy: { dateTime: "desc" },
        },
        patientPrescriptions: {
          include: {
            doctor: { select: { name: true } },
            items: { include: { logs: true } },
          },
          orderBy: { issuedDate: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const formattedRecords = patient.patientRecords.map((r) => ({
      ...r,
      vitals: r.vitalsJson ? JSON.parse(r.vitalsJson) : null,
    }));

    return NextResponse.json({
      patient: {
        ...patient,
        patientRecords: formattedRecords,
      },
    });
  } catch (error) {
    console.error("Patient details GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient details" },
      { status: 500 }
    );
  }
}
