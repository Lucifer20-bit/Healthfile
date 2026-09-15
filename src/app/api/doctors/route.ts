import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    const where: any = { role: "DOCTOR" };
    if (specialty && specialty !== "ALL") {
      where.doctorProfile = {
        specialization: { contains: specialty },
      };
    }

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        doctorProfile: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Doctors GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
