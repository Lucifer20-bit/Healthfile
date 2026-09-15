import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (user.role === "PATIENT") {
      const [records, appointments, prescriptions, todayLogs] = await Promise.all([
        prisma.medicalRecord.findMany({
          where: { patientId: user.id },
          orderBy: { date: "desc" },
          take: 5,
        }),
        prisma.appointment.findMany({
          where: {
            patientId: user.id,
            dateTime: { gte: new Date(Date.now() - 3600000 * 24) },
          },
          include: {
            doctor: {
              select: { name: true, avatar: true, doctorProfile: true },
            },
          },
          orderBy: { dateTime: "asc" },
          take: 5,
        }),
        prisma.prescription.findMany({
          where: { patientId: user.id, status: "ACTIVE" },
          include: {
            doctor: { select: { name: true } },
            items: true,
          },
        }),
        prisma.medicationLog.findMany({
          where: { patientId: user.id, scheduledDate: todayStr },
          include: { prescriptionItem: true },
        }),
      ]);

      const allRecordsWithVitals = await prisma.medicalRecord.findMany({
        where: { patientId: user.id, vitalsJson: { not: null } },
        orderBy: { date: "asc" },
        take: 10,
      });

      const vitalTrends = allRecordsWithVitals.map((rec) => {
        try {
          const v = JSON.parse(rec.vitalsJson || "{}");
          const bpParts = v.bp ? v.bp.split("/") : [];
          return {
            date: new Date(rec.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            bpSystolic: bpParts[0] ? parseInt(bpParts[0], 10) : undefined,
            bpDiastolic: bpParts[1] ? parseInt(bpParts[1], 10) : undefined,
            glucose: v.glucose,
            hr: v.hr,
            weight: v.weight,
          };
        } catch {
          return { date: "N/A" };
        }
      });

      // Calculate adherence
      const totalLogs = await prisma.medicationLog.count({
        where: { patientId: user.id },
      });
      const takenLogs = await prisma.medicationLog.count({
        where: { patientId: user.id, status: "TAKEN" },
      });
      const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

      return NextResponse.json({
        stats: {
          totalRecords: await prisma.medicalRecord.count({ where: { patientId: user.id } }),
          activePrescriptions: prescriptions.length,
          upcomingAppointments: appointments,
          recentRecords: records.map((r) => ({
            ...r,
            vitals: r.vitalsJson ? JSON.parse(r.vitalsJson) : null,
          })),
          adherenceRate,
          vitalTrends,
          todayLogs,
        },
      });
    }

    if (user.role === "DOCTOR") {
      const [
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        totalPrescriptions,
        recentPatients,
      ] = await Promise.all([
        prisma.appointment.count({ where: { doctorId: user.id } }),
        prisma.appointment.count({ where: { doctorId: user.id, status: "PENDING" } }),
        prisma.appointment.findMany({
          where: {
            doctorId: user.id,
            dateTime: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          include: {
            patient: {
              select: { id: true, name: true, avatar: true, email: true, phone: true },
            },
          },
          orderBy: { dateTime: "asc" },
        }),
        prisma.prescription.count({ where: { doctorId: user.id } }),
        prisma.appointment.findMany({
          where: { doctorId: user.id },
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
          },
          distinct: ["patientId"],
          take: 10,
        }),
      ]);

      return NextResponse.json({
        stats: {
          totalAppointments,
          pendingAppointments,
          todayAppointmentsCount: todayAppointments.length,
          todayAppointments,
          totalPrescriptions,
          recentPatients: recentPatients.map((a) => a.patient),
        },
      });
    }

    // ADMIN STATS
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRecords,
      totalPrescriptions,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.appointment.count(),
      prisma.medicalRecord.count(),
      prisma.prescription.count(),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, role: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRecords,
        totalPrescriptions,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
