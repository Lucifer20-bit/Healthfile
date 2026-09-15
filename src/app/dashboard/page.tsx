"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardIndex() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "PATIENT") {
        router.replace("/dashboard/patient");
      } else if (user.role === "DOCTOR") {
        router.replace("/dashboard/doctor");
      } else if (user.role === "ADMIN") {
        router.replace("/dashboard/admin");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 text-medical-400 animate-spin" />
      <span className="text-xs text-slate-400">Loading your Healthfile workspace...</span>
    </div>
  );
}
