import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (user) {
      await logAuditEvent({
        userId: user.id,
        action: "LOGOUT",
        entity: "User",
        details: `User ${user.name} logged out.`,
      });
    }

    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
