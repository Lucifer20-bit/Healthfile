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
    const status = searchParams.get("status");

    const where: any = {};

    if (user.role === "PATIENT") {
      where.patientId = user.id;
    } else if (user.role === "DOCTOR") {
      if (patientId) where.patientId = patientId;
      else where.doctorId = user.id;
    } else {
      if (patientId) where.patientId = patientId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
        appointment: true,
        items: {
          include: {
            logs: {
              take: 10,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { issuedDate: "desc" },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("Prescriptions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
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

    if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only licensed doctors or administrators can issue prescriptions." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      patientId,
      appointmentId,
      diagnosis,
      notes,
      validUntil,
      items = [],
    } = body;

    if (!patientId || items.length === 0) {
      return NextResponse.json(
        { error: "Patient and at least one medication item are required." },
        { status: 400 }
      );
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: user.id,
        appointmentId: appointmentId || null,
        diagnosis: diagnosis || null,
        status: "ACTIVE",
        notes: notes || null,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 86400000 * 90),
        items: {
          create: items.map((item: any) => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            timing: item.timing || "AFTER_MEAL",
            durationDays: parseInt(item.durationDays, 10) || 7,
            instructions: item.instructions || null,
          })),
        },
      },
      include: {
        items: true,
        patient: true,
        doctor: {
          include: { doctorProfile: true },
        },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "ISSUE_PRESCRIPTION",
      entity: "Prescription",
      details: `Dr. ${user.name} issued prescription with ${items.length} items for Patient ID ${patientId}.`,
    });

    return NextResponse.json({
      message: "Prescription issued successfully",
      prescription,
    });
  } catch (error) {
    console.error("Prescription POST error:", error);
    return NextResponse.json(
      { error: "Failed to issue prescription" },
      { status: 500 }
    );
  }
}
