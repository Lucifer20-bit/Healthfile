"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Stethoscope,
  Calendar,
  Users,
  ClipboardList,
  Video,
  Clock,
  Plus,
  CheckCircle2,
  ChevronRight,
  Activity,
  FileSignature,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PrescriptionBuilderModal } from "@/components/prescriptions/PrescriptionBuilderModal";
import { formatDate, formatTime, getStatusBadge } from "@/lib/utils";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching doctor stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-medical-950/40 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {user?.doctorProfile?.specialization || "Cardiology Specialist"}
              </span>
              <span className="text-xs text-slate-400">
                License: <strong className="text-white">{user?.doctorProfile?.licenseNumber || "MD-CARD-99201"}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user?.name || "Dr. Sarah Mitchell, MD"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {user?.doctorProfile?.hospital || "Metropolitan Heart & Vascular Institute"} &bull; Clinical Command Workspace
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRxModalOpen(true)}
            >
              <FileSignature className="w-4 h-4 mr-1" />
              New e-Prescription
            </Button>
            <Link href="/dashboard/doctor/patients">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1" />
                Patient Dossiers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Today&apos;s Appointments
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.todayAppointmentsCount || 2}
          </div>
          <span className="text-[11px] text-teal-400 mt-1 block">
            Next visit in 45 mins
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Total Consultations
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalAppointments || 18}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            98% completion rate
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Active e-Prescriptions
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalPrescriptions || 6}
          </div>
          <span className="text-[11px] text-teal-400 mt-1 block">
            Digitally signed
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Pending Action Requests
          </span>
          <div className="text-2xl font-black text-amber-400">
            {stats?.pendingAppointments || 1}
          </div>
          <span className="text-[11px] text-amber-300 mt-1 block">
            Requires review
          </span>
        </Card>
      </div>

      {/* Main Grid: Scheduled Consultations + Active Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Consultation Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Scheduled Clinical Consultations
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Patients queued for clinical review and virtual telehealth video sessions.
                </p>
              </div>
              <Link
                href="/dashboard/doctor/appointments"
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                Full Schedule &rarr;
              </Link>
            </CardHeader>

            <div className="divide-y divide-slate-800/80">
              {stats?.todayAppointments && stats.todayAppointments.length > 0 ? (
                stats.todayAppointments.map((appt: any) => {
                  const isVideo = appt.consultationType === "VIDEO_CALL";
                  const badge = getStatusBadge(appt.status);

                  return (
                    <div
                      key={appt.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            appt.patient?.avatar ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                          }
                          alt={appt.patient?.name || "Patient"}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-teal-300">
                              {appt.patient?.name || "Alex Morgan"}
                            </h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {appt.reason}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatTime(appt.dateTime)} ({appt.durationMinutes} mins)</span>
                            <span>&bull;</span>
                            <span className={isVideo ? "text-purple-400" : "text-teal-400"}>
                              {isVideo ? "Telehealth Video" : "In-Person Visit"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isVideo && (
                          <Link href={`/dashboard/telehealth/${appt.id}`}>
                            <Button size="sm" variant="primary">
                              <Video className="w-4 h-4 mr-1" />
                              Launch Room
                            </Button>
                          </Link>
                        )}
                        <Link href={`/dashboard/doctor/patients/${appt.patientId || appt.patient?.id}`}>
                          <Button size="sm" variant="outline">
                            View Chart
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No appointments scheduled for today.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Patient Directory */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Recent Patients
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Direct access to clinical dossiers
                </p>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {stats?.recentPatients && stats.recentPatients.length > 0 ? (
                stats.recentPatients.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/doctor/patients/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-teal-300">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.patientProfile?.chronicConditions || "General Care"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No recent patients.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Prescription Builder Modal */}
      <PrescriptionBuilderModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
}
