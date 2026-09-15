"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Building,
  User,
  CheckCircle2,
  XCircle,
  FileSignature,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PrescriptionBuilderModal } from "@/components/prescriptions/PrescriptionBuilderModal";
import { formatDate, formatTime, getStatusBadge } from "@/lib/utils";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments?status=${activeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
    }
  };

  const filters = ["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Physician Clinical Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your patient appointments, update consultation statuses, and launch telehealth streams.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === f
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {f === "ALL" ? "All Appointments" : f}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appt) => {
          const isVideo = appt.consultationType === "VIDEO_CALL";
          const badge = getStatusBadge(appt.status);

          return (
            <Card key={appt.id} hoverEffect className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      appt.patient?.avatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    }
                    alt={appt.patient?.name || "Patient"}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {appt.patient?.name || "Alex Morgan"}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-teal-400 font-medium mt-0.5">
                      {appt.reason}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(appt.dateTime)} at {formatTime(appt.dateTime)}
                      </span>
                      <span>&bull;</span>
                      <span className={isVideo ? "text-purple-400 font-semibold" : "text-teal-400"}>
                        {isVideo ? "Telehealth Video" : "In-Person Clinic"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {isVideo && (
                    <Link href={`/dashboard/telehealth/${appt.id}`}>
                      <Button size="sm" variant="primary">
                        <Video className="w-4 h-4 mr-1" />
                        Join Room
                      </Button>
                    </Link>
                  )}

                  <Link href={`/dashboard/doctor/patients/${appt.patientId || appt.patient?.id}`}>
                    <Button size="sm" variant="outline">
                      Patient Chart
                    </Button>
                  </Link>

                  {appt.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => updateStatus(appt.id, "CONFIRMED")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Confirm
                    </Button>
                  )}

                  {appt.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(appt.id, "COMPLETED")}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {appointments.length === 0 && !loading && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No scheduled appointments</h3>
          <p className="text-xs text-slate-400">
            No consultations match your selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
