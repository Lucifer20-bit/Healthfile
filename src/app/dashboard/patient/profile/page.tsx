"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Heart,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Activity,
  Droplets,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VitalsChart } from "@/components/ui/VitalsChart";

export default function PatientProfilePage() {
  const { user } = useAuth();
  const profile = user?.patientProfile;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              user?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            }
            alt={user?.name || "Patient"}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || "Alex Morgan"}
              </h1>
              <Badge variant="primary" size="sm">
                Patient #HF-9921
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.email} &bull; {user?.phone || "+1 (555) 890-1234"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            Verified Identity &bull; HIPAA Encrypted
          </Badge>
        </div>
      </div>

      {/* Grid of Medical Dossier Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1 & 2: Clinical Dossier Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-teal-400" />
                Baseline Health Attributes & Demographics
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Blood Group</span>
                <span className="text-sm font-bold text-teal-400">
                  {profile?.bloodGroup || "O+"}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Gender</span>
                <span className="text-sm font-bold text-white">
                  {profile?.gender || "Male"}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Date of Birth</span>
                <span className="text-sm font-bold text-white">
                  June 14, 1990 (36 yrs)
                </span>
              </div>
            </div>

            {/* Allergies & Chronic Conditions */}
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Known Allergies & Adverse Reactions
                </span>
                <p className="text-xs text-slate-200">
                  {profile?.allergies || "Penicillin, Peanuts (Anaphylaxis Risk)"}
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Diagnosed Chronic Conditions
                </span>
                <p className="text-xs text-slate-200">
                  {profile?.chronicConditions || "Type 2 Diabetes Mellitus, Stage 1 Essential Hypertension"}
                </p>
              </div>
            </div>
          </Card>

          {/* Vitals Trajectory Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Vitals Biomarker History
              </CardTitle>
            </CardHeader>
            <VitalsChart />
          </Card>
        </div>

        {/* Col 3: Contacts & Security */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                Emergency Contact
              </CardTitle>
            </CardHeader>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-white block">
                Claire Morgan (Spouse)
              </span>
              <span className="text-xs text-teal-400 block font-mono">
                +1 (555) 890-9988
              </span>
              <span className="text-[11px] text-slate-400 block">
                Primary Authorized Contact
              </span>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                Residential Address
              </CardTitle>
            </CardHeader>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300">
              <p>742 Evergreen Terrace</p>
              <p>Springfield, OR 97477</p>
              <p className="text-[10px] text-slate-400">United States</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
