import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role = "PATIENT", phone, specialization, licenseNumber, hospital, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = ["PATIENT", "DOCTOR", "ADMIN"].includes(role) ? role : "PATIENT";

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name,
        role: assignedRole,
        phone: phone || null,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        ...(assignedRole === "DOCTOR"
          ? {
              doctorProfile: {
                create: {
                  specialization: specialization || "General Medicine",
                  licenseNumber: licenseNumber || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
                  hospital: hospital || "City Central Medical Center",
                  consultationFee: 75.0,
                  availableDays: "Mon,Tue,Wed,Thu,Fri",
                },
              },
            }
          : assignedRole === "PATIENT"
          ? {
              patientProfile: {
                create: {
                  gender: gender || null,
                  bloodGroup: bloodGroup || null,
                  allergies: allergies || null,
                  chronicConditions: chronicConditions || null,
                  emergencyContact: emergencyContact || null,
                  address: address || null,
                },
              },
            }
          : {}),
      },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await logAuditEvent({
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      details: `New account registered for ${user.name} (${user.role}).`,
    });

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Failed to register account." },
      { status: 500 }
    );
  }
}
