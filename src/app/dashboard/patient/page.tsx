"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  Pill,
  FileText,
  Video,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VitalsChart } from "@/components/ui/VitalsChart";
import { BookingModal } from "@/components/appointments/BookingModal";
import { UploadRecordModal } from "@/components/records/UploadRecordModal";
import { DocumentViewerModal } from "@/components/ui/PdfViewerModal";
import { formatDate, formatTime, getBloodPressureStatus, getGlucoseStatus, getRecordTypeBadge, getStatusBadge } from "@/lib/utils";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingOpen, setBookingOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching patient stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogPill = async (prescriptionItemId: string, timeSlot: string, status: "TAKEN" | "SKIPPED") => {
    try {
      await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionItemId,
          timeSlot,
          status,
        }),
      });
      fetchStats();
    } catch (err) {
      console.error("Error logging medication:", err);
    }
  };

  const openDocument = (record: any) => {
    setSelectedDoc({
      title: record.title,
      filePath: record.attachments?.[0]?.filePath || "/uploads/samples/sample_lab_report.pdf",
      mimeType: record.attachments?.[0]?.mimeType || "application/pdf",
      recordType: record.recordType,
    });
    setViewerOpen(true);
  };

  const bpStatus = getBloodPressureStatus("124/82");
  const glucoseStatus = getGlucoseStatus(108);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-medical-950/60 via-slate-900/90 to-blue-950/40 border border-medical-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-medical-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-medical-500/15 text-medical-300 border border-medical-500/30">
                Medical Record #HF-{user?.id?.slice(-5).toUpperCase() || "77921"}
              </span>
              <span className="text-xs text-slate-400">
                Blood Group: <strong className="text-white">O+</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Alex"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Your care plan is active with <strong className="text-teal-300">{stats?.activePrescriptions || 2} medications</strong> and an adherence streak of <strong className="text-teal-300">{stats?.adherenceRate || 92}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Upload Record
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBookingOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Specialist
            </Button>
          </div>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: BP */}
        <Card glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-400" />
              Blood Pressure
            </span>
            <Badge variant="success" size="sm">
              {bpStatus.label}
            </Badge>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            124/82 <span className="text-xs font-normal text-slate-400">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-300/90 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            Normal systolic range
          </div>
        </Card>

        {/* Card 2: Glucose */}
        <Card glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              Fasting Blood Sugar
            </span>
            <Badge variant="warning" size="sm">
              {glucoseStatus.label}
            </Badge>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            108 <span className="text-xs font-normal text-slate-400">mg/dL</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            HbA1c Target: 6.4%
          </div>
        </Card>

        {/* Card 3: Heart Rate */}
        <Card glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Resting Heart Rate
            </span>
            <Badge variant="primary" size="sm">
              Optimal
            </Badge>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            72 <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-300/90">
            Sinus Rhythm normal
          </div>
        </Card>

        {/* Card 4: Weight & BMI */}
        <Card glow className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-400" />
              Weight & Body Mass
            </span>
            <Badge variant="purple" size="sm">
              BMI 24.8
            </Badge>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            78.5 <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            -1.7 kg in 60 days
          </div>
        </Card>
      </div>

      {/* Main Grid: Pill Schedule + Vitals Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Vitals Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Biometric & Vital Signs Trajectory</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-parameter physiological history recorded across consultations and lab panels.
                </p>
              </div>
            </CardHeader>

            <VitalsChart data={stats?.vitalTrends} />
          </Card>

          {/* Recent Diagnostic Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records & Scans</CardTitle>
              <Link
                href="/dashboard/patient/records"
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                View All Vault ({stats?.totalRecords || 3})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <div className="divide-y divide-slate-800/80">
              {stats?.recentRecords && stats.recentRecords.length > 0 ? (
                stats.recentRecords.map((rec: any) => {
                  const typeBadge = getRecordTypeBadge(rec.recordType);
                  return (
                    <div
                      key={rec.id}
                      className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-900/40 p-2 rounded-xl transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 group-hover:border-teal-500/40 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-teal-300">
                            {rec.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{formatDate(rec.date)}</span>
                            <span>&bull;</span>
                            <span className="truncate">
                              {rec.doctor?.name || "Attending Physician"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeBadge.className}`}>
                          {typeBadge.label}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDocument(rec)}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No records uploaded yet. Click &quot;Upload Record&quot; above.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Pill Schedule & Upcoming Appointments */}
        <div className="space-y-6">
          {/* Daily Pill Tracker Widget */}
          <Card glow>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="w-4 h-4 text-purple-400" />
                  Today&apos;s Medication Schedule
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Maintain your daily intake streak
                </p>
              </div>
              <Badge variant="purple" size="sm">
                94% Streak
              </Badge>
            </CardHeader>

            <div className="space-y-3">
              {/* Item 1: Morning */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Metformin HCl &bull; 500mg</span>
                    <span className="text-[10px] text-teal-400 block">Morning &bull; After Meal</span>
                  </div>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Taken
                  </Badge>
                </div>
              </div>

              {/* Item 2: Morning */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Lisinopril &bull; 10mg</span>
                    <span className="text-[10px] text-teal-400 block">Morning &bull; After Meal</span>
                  </div>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Taken
                  </Badge>
                </div>
              </div>

              {/* Item 3: Evening Pending */}
              <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Metformin HCl &bull; 500mg</span>
                    <span className="text-[10px] text-purple-400 block">Evening &bull; With Dinner</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs py-1 px-2.5 h-auto"
                      onClick={() => handleLogPill("metformin-evening", "EVENING", "TAKEN")}
                    >
                      Take
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs py-1 px-2 h-auto text-slate-400 hover:text-rose-400"
                      onClick={() => handleLogPill("metformin-evening", "EVENING", "SKIPPED")}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>

              {/* Item 4: Evening Pending */}
              <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Omega-3 Esters &bull; 1000mg</span>
                    <span className="text-[10px] text-purple-400 block">Evening &bull; With Food</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs py-1 px-2.5 h-auto"
                      onClick={() => handleLogPill("omega-evening", "EVENING", "TAKEN")}
                    >
                      Take
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs py-1 px-2 h-auto text-slate-400 hover:text-rose-400"
                      onClick={() => handleLogPill("omega-evening", "EVENING", "SKIPPED")}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/patient/medications"
                className="block text-center text-xs text-teal-400 hover:underline pt-1 font-semibold"
              >
                View Full Medication Schedule &rarr;
              </Link>
            </div>
          </Card>

          {/* Upcoming Consultations Widget */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Upcoming Visits
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scheduled clinical checkups
                </p>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                stats.upcomingAppointments.map((appt: any) => {
                  const isVideo = appt.consultationType === "VIDEO_CALL";
                  return (
                    <div
                      key={appt.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">
                            {appt.doctor?.name || "Dr. Sarah Mitchell, MD"}
                          </div>
                          <div className="text-[11px] text-teal-400">
                            {appt.reason}
                          </div>
                        </div>
                        <Badge
                          variant={isVideo ? "purple" : "primary"}
                          size="sm"
                        >
                          {isVideo ? "Video Call" : "In-Person"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(appt.dateTime)} at {formatTime(appt.dateTime)}</span>
                        </div>

                        {isVideo && (
                          <Link href={`/dashboard/telehealth/${appt.id}`}>
                            <Button size="sm" variant="primary" className="text-[10px] py-1 px-2.5 h-auto">
                              <Video className="w-3 h-3 mr-1" />
                              Join Room
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No upcoming appointments.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => {
          fetchStats();
        }}
      />

      <UploadRecordModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          fetchStats();
        }}
      />

      {selectedDoc && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title={selectedDoc.title}
          filePath={selectedDoc.filePath}
          mimeType={selectedDoc.mimeType}
          recordType={selectedDoc.recordType}
        />
      )}
    </div>
  );
}
