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
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: { patientProfile: true },
        },
        doctor: {
          include: { doctorProfile: true },
        },
        items: {
          include: { logs: true },
        },
        appointment: true,
      },
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error("Prescription single GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescription" },
      { status: 500 }
    );
  }
}
