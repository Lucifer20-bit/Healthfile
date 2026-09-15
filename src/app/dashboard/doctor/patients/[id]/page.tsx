"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  AlertTriangle,
  FileText,
  Calendar,
  Pill,
  Plus,
  ArrowLeft,
  Eye,
  Activity,
  Printer,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VitalsChart } from "@/components/ui/VitalsChart";
import { PrescriptionBuilderModal } from "@/components/prescriptions/PrescriptionBuilderModal";
import { UploadRecordModal } from "@/components/records/UploadRecordModal";
import { DocumentViewerModal } from "@/components/ui/PdfViewerModal";
import { formatDate, formatTime, getRecordTypeBadge, getStatusBadge } from "@/lib/utils";

export default function PatientChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"records" | "vitals" | "prescriptions">("records");

  // Modals
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
      }
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const openDocument = (record: any) => {
    setSelectedDoc({
      title: record.title,
      filePath: record.attachments?.[0]?.filePath || "/uploads/samples/sample_lab_report.pdf",
      mimeType: record.attachments?.[0]?.mimeType || "application/pdf",
      recordType: record.recordType,
    });
    setViewerOpen(true);
  };

  const profile = patient?.patientProfile;

  // Extract vitals data for chart
  const vitalsChartData = patient?.patientRecords
    ?.filter((r: any) => r.vitals)
    ?.map((r: any) => {
      const bpParts = r.vitals.bp ? r.vitals.bp.split("/") : [];
      return {
        date: formatDate(r.date),
        bpSystolic: bpParts[0] ? parseInt(bpParts[0], 10) : undefined,
        bpDiastolic: bpParts[1] ? parseInt(bpParts[1], 10) : undefined,
        glucose: r.vitals.glucose,
        hr: r.vitals.hr,
        weight: r.vitals.weight,
      };
    })
    .reverse();

  if (loading) {
    return (
      <div className="text-center py-20 text-xs text-slate-400">
        Loading patient clinical dossier...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20 text-xs text-slate-400 space-y-3">
        <p>Patient not found.</p>
        <Link href="/dashboard/doctor/patients">
          <Button size="sm" variant="outline">Back to Patients Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/doctor/patients"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Directory
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Upload Lab / Scan
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setRxModalOpen(true)}
          >
            <Pill className="w-4 h-4 mr-1" />
            Issue e-Prescription
          </Button>
        </div>
      </div>

      {/* Patient Dossier Banner */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                patient.avatar ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
              }
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {patient.name}
                </h1>
                <Badge variant="primary" size="sm">
                  {profile?.bloodGroup || "O+"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {patient.email} &bull; {patient.phone || "+1 (555) 000-0000"} &bull; DOB: June 14, 1990 (36 yrs)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              MRN: <strong>HF-{patient.id.slice(-6).toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {/* Allergy & Chronic Conditions Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {profile?.allergies && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Allergies:</strong> {profile.allergies}</span>
            </div>
          )}

          {profile?.chronicConditions && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-200">
              <Heart className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Conditions:</strong> {profile.chronicConditions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "records"
              ? "bg-medical-500/20 text-medical-300 border border-medical-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Medical Records & Scans ({patient.patientRecords?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("vitals")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "vitals"
              ? "bg-medical-500/20 text-medical-300 border border-medical-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Biometric & Vitals Trajectory
        </button>
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "prescriptions"
              ? "bg-medical-500/20 text-medical-300 border border-medical-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          e-Prescriptions & Intake History ({patient.patientPrescriptions?.length || 0})
        </button>
      </div>

      {/* Tab 1: Records */}
      {activeTab === "records" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patient.patientRecords?.map((rec: any) => {
            const badge = getRecordTypeBadge(rec.recordType);
            return (
              <Card key={rec.id} hoverEffect className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {rec.title}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(rec.date)} &bull; {rec.doctor?.name || "Clinic Provider"}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {rec.description && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {rec.description}
                  </p>
                )}

                {rec.vitals && Object.keys(rec.vitals).length > 0 && (
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap gap-2">
                    {rec.vitals.bp && <span>BP: <strong>{rec.vitals.bp}</strong></span>}
                    {rec.vitals.glucose && <span>Glucose: <strong>{rec.vitals.glucose} mg/dL</strong></span>}
                    {rec.vitals.hr && <span>HR: <strong>{rec.vitals.hr} bpm</strong></span>}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => openDocument(rec)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview Document
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 2: Vitals */}
      {activeTab === "vitals" && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Biometric & Vital Signs Trajectory</CardTitle>
          </CardHeader>
          <VitalsChart data={vitalsChartData} />
        </Card>
      )}

      {/* Tab 3: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          {patient.patientPrescriptions?.map((rx: any) => (
            <Card key={rx.id} glow className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {rx.diagnosis || "Maintenance Prescription"}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Prescribed on {formatDate(rx.issuedDate)} by {rx.doctor?.name}
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  {rx.status}
                </Badge>
              </div>

              <div className="space-y-2">
                {rx.items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.medicationName} ({item.dosage})</div>
                      <div className="text-[10px] text-slate-400">{item.frequency} &bull; {item.timing}</div>
                    </div>
                    <span className="text-[11px] text-teal-400 font-mono">
                      {item.durationDays} Days
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <PrescriptionBuilderModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        onSuccess={fetchPatient}
        defaultPatientId={patient.id}
      />

      <UploadRecordModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchPatient}
        patientId={patient.id}
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
