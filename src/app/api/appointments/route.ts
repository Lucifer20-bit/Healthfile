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
    const status = searchParams.get("status");
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");

    const where: any = {};

    if (user.role === "PATIENT") {
      where.patientId = user.id;
    } else if (user.role === "DOCTOR") {
      where.doctorId = user.id;
    } else {
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            patientProfile: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            doctorProfile: true,
          },
        },
        prescription: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
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
      doctorId,
      patientId,
      dateTime,
      durationMinutes = 30,
      reason,
      consultationType = "IN_PERSON",
      notes,
    } = body;

    const targetPatientId = user.role === "PATIENT" ? user.id : patientId;
    if (!targetPatientId || !doctorId || !dateTime || !reason) {
      return NextResponse.json(
        { error: "Doctor, date/time, and reason are required." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: targetPatientId,
        doctorId,
        dateTime: new Date(dateTime),
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        status: "CONFIRMED", // Auto-confirm in demo mode
        reason,
        consultationType,
        notes: notes || null,
      },
      include: {
        patient: true,
        doctor: {
          include: { doctorProfile: true },
        },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "BOOK_APPOINTMENT",
      entity: "Appointment",
      details: `Booked ${consultationType} appointment with Doctor ID ${doctorId} for ${dateTime}.`,
    });

    return NextResponse.json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
