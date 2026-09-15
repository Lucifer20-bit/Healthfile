"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Download,
  Lock,
  Filter,
  ShieldCheck,
  Activity,
  Calendar,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/audit-logs?action=${actionFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportCSV = () => {
    const headers = ["Timestamp", "Action", "Entity", "User Name", "User Role", "Details", "IP Address"];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.action,
      l.entity,
      l.user?.name || "System",
      l.user?.role || "SYSTEM",
      `"${(l.details || "").replace(/"/g, '""')}"`,
      l.ipAddress || "127.0.0.1",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Healthfile_HIPAA_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = [
    "ALL",
    "LOGIN",
    "VIEW_RECORD",
    "UPLOAD_RECORD",
    "BOOK_APPOINTMENT",
    "ISSUE_PRESCRIPTION",
    "LOG_MEDICATION",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HIPAA Security & Access Audit Trails
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable longitudinal activity logs for HIPAA compliance, clinical data audits, and regulatory reporting.
          </p>
        </div>

        <Button variant="primary" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1.5" />
          Export Audit Log (CSV)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, user, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {actionTypes.map((a) => (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  actionFilter === a
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {a === "ALL" ? "All Actions" : a.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Timestamp</th>
                <th className="px-5 py-3.5 font-bold">User / Actor</th>
                <th className="px-5 py-3.5 font-bold">Action</th>
                <th className="px-5 py-3.5 font-bold">Entity</th>
                <th className="px-5 py-3.5 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-mono text-slate-400">
                    {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-white">
                      {log.user?.name || "System"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.user?.role || "SYSTEM"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant="purple" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {log.entity}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-300 max-w-md">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-xs text-slate-400">
            No audit records found matching the filter.
          </div>
        )}
      </Card>
    </div>
  );
}
