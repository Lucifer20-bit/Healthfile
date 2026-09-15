import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = { role: "PATIENT" };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const patients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        patientProfile: true,
        patientAppointments: {
          take: 1,
          orderBy: { dateTime: "desc" },
          select: { dateTime: true, status: true, reason: true },
        },
        _count: {
          select: {
            patientRecords: true,
            patientPrescriptions: true,
            patientAppointments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Patients GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
