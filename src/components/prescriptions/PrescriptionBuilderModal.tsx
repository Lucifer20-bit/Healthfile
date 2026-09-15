"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Pill, CheckCircle2, AlertCircle, FileSignature } from "lucide-react";
import type { MedicationTiming } from "@/types";

interface PrescriptionItemInput {
  medicationName: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  durationDays: number;
  instructions: string;
}

interface PrescriptionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientId?: string;
  appointmentId?: string;
}

export function PrescriptionBuilderModal({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientId,
  appointmentId,
}: PrescriptionBuilderModalProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<string>(defaultPatientId || "");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<PrescriptionItemInput[]>([
    {
      medicationName: "Metformin HCl",
      dosage: "500 mg",
      frequency: "Twice daily (Morning, Evening)",
      timing: "AFTER_MEAL",
      durationDays: 30,
      instructions: "Take with meals to reduce stomach discomfort.",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultPatientId) setPatientId(defaultPatientId);
      fetch("/api/patients")
        .then((res) => res.json())
        .then((data) => {
          if (data.patients && data.patients.length > 0) {
            setPatients(data.patients);
            if (!defaultPatientId && !patientId) {
              setPatientId(data.patients[0].id);
            }
          }
        })
        .catch((err) => console.error("Error loading patients:", err));
    }
  }, [isOpen, defaultPatientId, patientId]);

  const addItem = () => {
    setItems([
      ...items,
      {
        medicationName: "",
        dosage: "10 mg",
        frequency: "Once daily (Morning)",
        timing: "AFTER_MEAL",
        durationDays: 14,
        instructions: "Take with water.",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PrescriptionItemInput, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || items.length === 0) {
      setError("Please select a patient and add at least one medication.");
      return;
    }

    // Validate medication names
    for (const item of items) {
      if (!item.medicationName.trim()) {
        setError("All medications must have a valid name.");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          appointmentId: appointmentId || null,
          diagnosis,
          notes,
          items,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to issue prescription");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2.5">
          <FileSignature className="w-5 h-5 text-medical-400" />
          <span>Electronic Prescription Pad (e-Rx)</span>
        </div>
      }
      description="Issue a digitally signed, tamper-evident medical prescription for the patient."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient & Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Patient *
            </label>
            <select
              value={patientId}
              disabled={!!defaultPatientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} &bull; {p.patientProfile?.bloodGroup || "O+"} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Diagnosis / Indication *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Essential Hypertension & Mild Hyperglycemia"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            />
          </div>
        </div>

        {/* Medications list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-medical-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4" />
              Prescribed Medications ({items.length})
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Medication
            </Button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 relative space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    #{idx + 1} Medication Item
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Drug Name & Chemical Formulation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Lisinopril Oral Tablet"
                      value={item.medicationName}
                      onChange={(e) => updateItem(idx, "medicationName", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Dosage (mg / ml)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10 mg"
                      value={item.dosage}
                      onChange={(e) => updateItem(idx, "dosage", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="Once daily"
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, "frequency", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Meal Timing
                    </label>
                    <select
                      value={item.timing}
                      onChange={(e) => updateItem(idx, "timing", e.target.value as MedicationTiming)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="AFTER_MEAL">After Meal</option>
                      <option value="BEFORE_MEAL">Before Meal</option>
                      <option value="WITH_FOOD">With Food</option>
                      <option value="ANYTIME">Anytime</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.durationDays}
                      onChange={(e) => updateItem(idx, "durationDays", parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Patient Instructions / Caution
                  </label>
                  <input
                    type="text"
                    placeholder="Take in morning with full glass of water. Avoid alcohol."
                    value={item.instructions}
                    onChange={(e) => updateItem(idx, "instructions", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            General Doctor Notes & Refill Guidance
          </label>
          <input
            type="text"
            placeholder="e.g., Follow up in 30 days. Maintain weekly BP and fasting glucose log."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Digital Signature: <span className="text-teal-400 font-mono">MD-E-SIGN-{Date.now().toString().slice(-6)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Digitally Sign & Issue
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
