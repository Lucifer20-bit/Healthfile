"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  Plus,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // We can fetch doctors + patients
      const [docRes, patRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/patients"),
      ]);

      let all: any[] = [];
      if (docRes.ok) {
        const docData = await docRes.json();
        all = [...all, ...docData.doctors.map((d: any) => ({ ...d, role: "DOCTOR" }))];
      }
      if (patRes.ok) {
        const patData = await patRes.json();
        all = [...all, ...patData.patients.map((p: any) => ({ ...p, role: "PATIENT" }))];
      }

      setUsers(all);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage physician credentials, patient accounts, and role permissions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "DOCTOR", "PATIENT"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === r
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {r === "ALL" ? "All Accounts" : r === "DOCTOR" ? "Physicians" : "Patients"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isDoctor = u.role === "DOCTOR";
          return (
            <Card key={u.id} hoverEffect className="p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        u.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                      }
                      alt={u.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {u.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={isDoctor ? "info" : "primary"}
                    size="sm"
                  >
                    {u.role}
                  </Badge>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  {isDoctor ? (
                    <>
                      <div className="text-teal-400 font-medium">
                        {u.doctorProfile?.specialization || "General Medicine"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.doctorProfile?.hospital || "Hospital Central"} &bull; Fee: ${u.doctorProfile?.consultationFee || 75}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-teal-300 font-medium">
                        Blood Group: {u.patientProfile?.bloodGroup || "O+"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.patientProfile?.chronicConditions || "Standard Patient Account"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Account Status: Active</span>
                <span className="text-teal-400">Verified</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
