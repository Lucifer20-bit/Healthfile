"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { VideoConsultationRoom } from "@/components/telehealth/VideoConsultationRoom";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TelehealthSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (appointmentId && appointmentId !== "demo-session") {
      fetch(`/api/appointments/${appointmentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.appointment) setAppointment(data.appointment);
        })
        .catch((err) => console.error("Error loading appointment details:", err));
    }
  }, [appointmentId]);

  const handleEndCall = () => {
    if (user?.role === "PATIENT") {
      router.push("/dashboard/patient/appointments");
    } else {
      router.push("/dashboard/doctor/appointments");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href={user?.role === "PATIENT" ? "/dashboard/patient/appointments" : "/dashboard/doctor/appointments"}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Leave Telehealth Suite
        </Link>
      </div>

      <VideoConsultationRoom
        appointmentId={appointmentId}
        doctorName={appointment?.doctor?.name || "Dr. Sarah Mitchell, MD"}
        patientName={appointment?.patient?.name || "Alex Morgan"}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
