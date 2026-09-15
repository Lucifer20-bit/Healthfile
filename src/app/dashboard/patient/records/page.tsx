"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  Eye,
  Activity,
  Calendar,
  User,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UploadRecordModal } from "@/components/records/UploadRecordModal";
import { DocumentViewerModal } from "@/components/ui/PdfViewerModal";
import { formatDate, formatFileSize, getRecordTypeBadge } from "@/lib/utils";

export default function PatientRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("ALL");

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/records?type=${activeType}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  }, [activeType, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openDocument = (record: any) => {
    setSelectedDoc({
      title: record.title,
      filePath: record.attachments?.[0]?.filePath || "/uploads/samples/sample_lab_report.pdf",
      mimeType: record.attachments?.[0]?.mimeType || "application/pdf",
      recordType: record.recordType,
    });
    setViewerOpen(true);
  };

  const categories = [
    { label: "All Documents", value: "ALL" },
    { label: "Lab Reports", value: "LAB_REPORT" },
    { label: "Imaging & Scans", value: "IMAGING" },
    { label: "Prescriptions", value: "PRESCRIPTION" },
    { label: "Discharge Summaries", value: "DISCHARGE_SUMMARY" },
    { label: "General Visits", value: "GENERAL" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Medical Records Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            HIPAA-compliant encrypted repository of your laboratory results, imaging, and diagnostic summaries.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Upload New Record
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, test name, or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveType(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeType === c.value
                    ? "bg-medical-500/20 text-medical-300 border border-medical-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((rec) => {
          const typeBadge = getRecordTypeBadge(rec.recordType);
          const hasVitals = rec.vitals && Object.keys(rec.vitals).length > 0;
          const attachment = rec.attachments?.[0];

          return (
            <Card key={rec.id} hoverEffect className="flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(rec.date)}</span>
                        {rec.doctor && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-300">{rec.doctor.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${typeBadge.className}`}>
                    {typeBadge.label}
                  </span>
                </div>

                {rec.description && (
                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                    {rec.description}
                  </p>
                )}

                {/* Vitals pill snapshot if recorded with this document */}
                {hasVitals && (
                  <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Vitals:
                    </span>
                    {rec.vitals.bp && (
                      <span className="text-slate-300">
                        BP: <strong className="text-white">{rec.vitals.bp}</strong>
                      </span>
                    )}
                    {rec.vitals.glucose && (
                      <span className="text-slate-300">
                        Glucose: <strong className="text-blue-400">{rec.vitals.glucose} mg/dL</strong>
                      </span>
                    )}
                    {rec.vitals.hr && (
                      <span className="text-slate-300">
                        HR: <strong className="text-rose-400">{rec.vitals.hr} bpm</strong>
                      </span>
                    )}
                    {rec.vitals.weight && (
                      <span className="text-slate-300">
                        Wt: <strong className="text-purple-400">{rec.vitals.weight} kg</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-[11px] truncate">
                  {attachment ? formatFileSize(attachment.fileSize) : "Digital Summary"}
                </span>

                <div className="flex items-center gap-2">
                  {attachment && (
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button size="sm" variant="ghost">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openDocument(rec)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview Document
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {records.length === 0 && !loading && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No medical records match your current filter or search query. Upload a new test result or clear your search filter.
          </p>
          <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
            Upload New Record
          </Button>
        </div>
      )}

      {/* Modals */}
      <UploadRecordModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={fetchRecords}
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
