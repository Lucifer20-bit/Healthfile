"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import type { RecordType } from "@/types";

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId?: string;
}

export function UploadRecordModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
}: UploadRecordModalProps) {
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("LAB_REPORT");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Vitals
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [glucose, setGlucose] = useState("");
  const [hr, setHr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");
  const [temp, setTemp] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Please provide a title for this medical record.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let attachments: any[] = [];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachments.push({
            fileName: uploadData.fileName,
            originalName: uploadData.originalName,
            filePath: uploadData.filePath,
            mimeType: uploadData.mimeType,
            fileSize: uploadData.fileSize,
          });
        }
      }

      // Build vitals object if provided
      const vitals: any = {};
      if (bpSystolic && bpDiastolic) vitals.bp = `${bpSystolic}/${bpDiastolic}`;
      if (glucose) vitals.glucose = parseFloat(glucose);
      if (hr) vitals.hr = parseInt(hr, 10);
      if (spo2) vitals.spo2 = parseInt(spo2, 10);
      if (weight) vitals.weight = parseFloat(weight);
      if (temp) vitals.temp = parseFloat(temp);

      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          recordType,
          description,
          date,
          vitals: Object.keys(vitals).length > 0 ? vitals : null,
          patientId,
          attachments,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create record");
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
      maxWidth="2xl"
      title="Upload Medical Record"
      description="Add a new clinical document, laboratory report, imaging scan, or diagnostic note to the patient vault."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Title & Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Record Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Lipid Panel & HbA1c Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            >
              <option value="LAB_REPORT">Lab Report</option>
              <option value="IMAGING">Imaging / Scan</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
              <option value="GENERAL">General Assessment</option>
            </select>
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date of Test/Visit
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clinical Notes / Findings
            </label>
            <input
              type="text"
              placeholder="Brief summary of diagnosis or parameters"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            />
          </div>
        </div>

        {/* Vitals Input Section */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-medical-400 uppercase tracking-wider">
              Recorded Vitals (Optional)
            </span>
            <span className="text-[10px] text-slate-400">Auto-charts into patient trend graphs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">BP Sys (mmHg)</label>
              <input
                type="number"
                placeholder="120"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">BP Dia (mmHg)</label>
              <input
                type="number"
                placeholder="80"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Glucose (mg/dL)</label>
              <input
                type="number"
                placeholder="95"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="72"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">SpO2 (%)</label>
              <input
                type="number"
                placeholder="99"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* File Upload Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Attach Document / Scan (PDF, Image, ECG)
          </label>
          <div className="border-2 border-dashed border-slate-800 hover:border-medical-500/50 rounded-xl p-4 text-center bg-slate-950/40 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.svg,.dcm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
              <Upload className="w-6 h-6 text-medical-400" />
              <span className="text-xs font-medium text-slate-300">
                {file ? file.name : "Click or drag & drop PDF, DICOM, or image file"}
              </span>
              <span className="text-[10px] text-slate-400">
                Maximum file size: 25 MB &bull; Encrypted at rest
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Save to Records
          </Button>
        </div>
      </form>
    </Modal>
  );
}
