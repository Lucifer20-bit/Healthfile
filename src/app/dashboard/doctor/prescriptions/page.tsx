"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileSignature,
  Plus,
  Pill,
  Printer,
  Calendar,
  User,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PrescriptionBuilderModal } from "@/components/prescriptions/PrescriptionBuilderModal";
import { formatDate } from "@/lib/utils";

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prescriptions");
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            e-Prescription Pad & Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Digitally sign, issue, and manage pharmaceutical treatment regimens for patients.
          </p>
        </div>

        <Button variant="primary" onClick={() => setRxModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Issue New e-Prescription
        </Button>
      </div>

      {/* Prescription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id} glow className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">
                  e-Rx #{rx.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {rx.patient?.name || "Patient"}
                </h3>
                <div className="text-xs text-teal-300 mt-0.5">
                  Diagnosis: <strong>{rx.diagnosis || "Therapy"}</strong>
                </div>
              </div>

              <Badge variant="success" size="sm">
                {rx.status}
              </Badge>
            </div>

            {/* Medication list */}
            <div className="space-y-2">
              {rx.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-400" />
                      {item.medicationName} ({item.dosage})
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono">
                      {item.timing.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{item.frequency}</span>
                    <span>{item.durationDays} Days</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800">
              <span>Issued: {formatDate(rx.issuedDate)}</span>
              <button
                onClick={() => window.print()}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print e-Rx
              </button>
            </div>
          </Card>
        ))}
      </div>

      {prescriptions.length === 0 && !loading && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <FileSignature className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No prescriptions issued yet</h3>
          <p className="text-xs text-slate-400">
            Click &quot;Issue New e-Prescription&quot; to write your first electronic prescription.
          </p>
          <Button variant="primary" size="sm" onClick={() => setRxModalOpen(true)}>
            Issue e-Prescription
          </Button>
        </div>
      )}

      {/* Prescription Builder Modal */}
      <PrescriptionBuilderModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        onSuccess={fetchPrescriptions}
      />
    </div>
  );
}
