"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Building,
  Plus,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookingModal } from "@/components/appointments/BookingModal";
import { formatDate, formatTime, getStatusBadge } from "@/lib/utils";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [bookingOpen, setBookingOpen] = useState(false);

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

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you wish to cancel this scheduled appointment?")) return;
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      fetchAppointments();
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  const filters = ["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Appointments & Consultations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your in-person clinic visits and encrypted tele-health video consultations.
          </p>
        </div>

        <Button variant="primary" onClick={() => setBookingOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Book Specialist Visit
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === f
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/40 shadow-sm"
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
          const statusBadge = getStatusBadge(appt.status);

          return (
            <Card key={appt.id} hoverEffect className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Doctor & Reason */}
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      appt.doctor?.avatar ||
                      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"
                    }
                    alt={appt.doctor?.name || "Doctor"}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {appt.doctor?.name || "Dr. Sarah Mitchell, MD"}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <p className="text-xs text-teal-400 font-medium mt-0.5">
                      {appt.doctor?.doctorProfile?.specialization || "Clinical Specialist"} &bull; {appt.doctor?.doctorProfile?.hospital || "Hospital"}
                    </p>

                    <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <strong>Reason:</strong> {appt.reason}
                    </p>
                  </div>
                </div>

                {/* Timing & Actions */}
                <div className="flex flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right space-y-1">
                    <div className="flex items-center md:justify-end gap-1.5 text-xs font-bold text-white">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>{formatDate(appt.dateTime)}</span>
                      <span>&bull;</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(appt.dateTime)}</span>
                    </div>
                    <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-400">
                      {isVideo ? (
                        <span className="text-purple-400 font-semibold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Virtual Telehealth Room
                        </span>
                      ) : (
                        <span className="text-teal-400 font-semibold flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          In-Person Clinic Visit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {appt.status === "CONFIRMED" && isVideo && (
                      <Link href={`/dashboard/telehealth/${appt.id}`}>
                        <Button size="sm" variant="primary">
                          <Video className="w-4 h-4 mr-1.5" />
                          Enter Video Room
                        </Button>
                      </Link>
                    )}

                    {appt.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-rose-400"
                        onClick={() => handleCancel(appt.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {appointments.length === 0 && !loading && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No appointments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no consultations in this category. Schedule an appointment with our specialist physicians.
          </p>
          <Button variant="primary" size="sm" onClick={() => setBookingOpen(true)}>
            Book Specialist Visit
          </Button>
        </div>
      )}

      {/* Booking Wizard Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
