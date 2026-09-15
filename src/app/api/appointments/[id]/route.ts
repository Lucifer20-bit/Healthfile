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
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            patientProfile: true,
            patientRecords: { take: 5, orderBy: { date: "desc" } },
          },
        },
        doctor: {
          include: { doctorProfile: true },
        },
        prescription: {
          include: { items: true },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Appointment single GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, diagnosis, notes, dateTime } = body;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(diagnosis !== undefined ? { diagnosis } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
      },
      include: {
        patient: true,
        doctor: true,
        prescription: true,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "UPDATE_APPOINTMENT",
      entity: "Appointment",
      details: `Updated appointment ID ${id} status to ${status || existing.status}`,
    });

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: updated,
    });
  } catch (error) {
    console.error("Appointment PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
