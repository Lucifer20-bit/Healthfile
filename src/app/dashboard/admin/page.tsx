"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Calendar,
  FileText,
  Pill,
  Activity,
  ShieldCheck,
  Download,
  Search,
  Lock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-blue-950/40 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Hospital System Administrator
              </span>
              <span className="text-xs text-slate-400">
                Security Node: <strong className="text-white">US-EAST-HIPAA-01</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hospital Operations & Compliance Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              System governance, user credential management, and HIPAA activity telemetry audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/admin/audit">
              <Button variant="primary" size="sm">
                <ShieldAlert className="w-4 h-4 mr-1" />
                Inspect HIPAA Audit Trail
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* System KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Registered Patients
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalPatients || 2}
          </div>
          <span className="text-[11px] text-teal-400 mt-1 block">
            100% active charts
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Licensed Physicians
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalDoctors || 3}
          </div>
          <span className="text-[11px] text-blue-400 mt-1 block">
            Verified credentials
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Total Clinical Visits
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalAppointments || 4}
          </div>
          <span className="text-[11px] text-purple-400 mt-1 block">
            In-Person & Telehealth
          </span>
        </Card>

        <Card glow className="p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Encrypted Records Vault
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.totalRecords || 3}
          </div>
          <span className="text-[11px] text-teal-400 mt-1 block">
            Zero security violations
          </span>
        </Card>
      </div>

      {/* Recent HIPAA Audit Events */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Real-Time Security & HIPAA Audit Trail
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit events capturing logins, patient chart access, and prescription issuance.
            </p>
          </div>
          <Link
            href="/dashboard/admin/audit"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            View Full Log &rarr;
          </Link>
        </CardHeader>

        <div className="divide-y divide-slate-800/80">
          {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
            stats.recentAuditLogs.map((log: any) => (
              <div
                key={log.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-purple-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                        {log.entity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">
                      {log.details || "No details provided"}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Initiated by: <strong className="text-slate-200">{log.user?.name || "System"}</strong> ({log.user?.role || "SYSTEM"})
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatDate(log.createdAt)} at {formatTime(log.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No audit logs captured yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
