"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  Heart,
  AlertTriangle,
  FileText,
  Calendar,
  Pill,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function DoctorPatientsDirectory() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/patients";
      if (search) url += `?search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Patient Medical Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access complete longitudinal clinical charts, diagnostic history, and past consultations.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((p) => {
          const profile = p.patientProfile;
          return (
            <Card key={p.id} hoverEffect className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        p.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                      }
                      alt={p.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {p.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.email} &bull; {p.phone || "+1 (555) 000-0000"}
                      </div>
                    </div>
                  </div>

                  <Badge variant="primary" size="sm">
                    {profile?.bloodGroup || "O+"}
                  </Badge>
                </div>

                {/* Chronic Conditions & Allergies */}
                <div className="space-y-1.5 text-xs">
                  {profile?.chronicConditions && (
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-slate-300 flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">
                        <strong>Conditions:</strong> {profile.chronicConditions}
                      </span>
                    </div>
                  )}

                  {profile?.allergies && (
                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-200 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">
                        <strong>Allergies:</strong> {profile.allergies}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dossier statistics */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-teal-400" />
                    {p._count?.patientRecords || 0} Records
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Pill className="w-3 h-3 text-purple-400" />
                    {p._count?.patientPrescriptions || 0} Prescriptions
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {p._count?.patientAppointments || 0} Visits
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Registered {formatDate(p.createdAt)}
                </span>
                <Link href={`/dashboard/doctor/patients/${p.id}`}>
                  <Button size="sm" variant="primary">
                    Open Clinical Chart &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {patients.length === 0 && !loading && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No patients found</h3>
          <p className="text-xs text-slate-400">
            No patients match your search term &quot;{search}&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
