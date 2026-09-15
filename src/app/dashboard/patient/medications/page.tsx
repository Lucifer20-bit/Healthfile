"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getStatusBadge } from "@/lib/utils";

export default function PatientMedicationsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rxRes, logRes] = await Promise.all([
        fetch("/api/prescriptions"),
        fetch("/api/medications/log"),
      ]);

      if (rxRes.ok) {
        const rxData = await rxRes.json();
        setPrescriptions(rxData.prescriptions);
      }
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData.logs);
      }
    } catch (err) {
      console.error("Error fetching medications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogPill = async (
    prescriptionItemId: string,
    timeSlot: string,
    status: "TAKEN" | "SKIPPED"
  ) => {
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
      fetchData();
    } catch (err) {
      console.error("Error updating pill log:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Daily Pill Tracker & Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your daily medication intake, log doses, and review active clinical prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="purple" size="md">
            Adherence: 94% Consistent
          </Badge>
        </div>
      </div>

      {/* Active Prescription Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-400" />
          Active Physician Prescriptions ({prescriptions.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id} glow className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 font-semibold uppercase">
                    e-Rx #{rx.id.slice(-6).toUpperCase()}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {rx.diagnosis || "Maintenance Therapy"}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Prescribed by: <strong className="text-slate-200">{rx.doctor?.name || "Dr. Sarah Mitchell, MD"}</strong>
                  </div>
                </div>

                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>

              {/* Medication Items */}
              <div className="space-y-2.5">
                {rx.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-bold text-white">
                          {item.medicationName} &bull; {item.dosage}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                        {item.timing.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Frequency: <strong className="text-slate-200">{item.frequency}</strong></span>
                      <span>&bull;</span>
                      <span>Duration: <strong className="text-slate-200">{item.durationDays} Days</strong></span>
                    </div>

                    {item.instructions && (
                      <p className="text-[11px] text-teal-300/80 bg-teal-950/30 p-1.5 rounded-lg border border-teal-500/10">
                        💡 {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                <span>Issued: {formatDate(rx.issuedDate)}</span>
                <button
                  onClick={() => window.print()}
                  className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print RX Slip
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
