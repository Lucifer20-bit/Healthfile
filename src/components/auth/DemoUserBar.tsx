"use client";

import React, { useState } from "react";
import { useAuth, DEMO_ACCOUNTS } from "@/context/AuthContext";
import { User, Stethoscope, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoUserBar() {
  const { user, demoLogin, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-medical-500/10 border border-medical-500/30 text-medical-300 font-semibold text-[11px]">
            <Sparkles className="w-3 h-3 text-medical-400 animate-pulse" />
            Interactive Demo Mode
          </span>
          <span className="hidden sm:inline text-slate-400">
            Switch persona to test role-specific workflows:
          </span>
        </div>

        {/* Right: Switcher buttons */}
        <div className="flex items-center gap-2">
          {/* Patient Switcher */}
          <button
            onClick={() => demoLogin("PATIENT")}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all",
              user?.role === "PATIENT"
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/50 shadow-sm shadow-medical-950"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
            )}
          >
            <User className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Patient:</span> Alex Morgan
            {user?.role === "PATIENT" && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            )}
          </button>

          {/* Doctor Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all",
                user?.role === "DOCTOR"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-950"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Doctor:</span>{" "}
              {user?.role === "DOCTOR" ? user.name.split(",")[0] : "Dr. Sarah"}
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1">
                <button
                  onClick={() => {
                    demoLogin("DOCTOR", DEMO_ACCOUNTS.doctor.email);
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-800 transition-colors"
                >
                  <Stethoscope className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      Dr. Sarah Mitchell, MD
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cardiologist &bull; Preventive Care
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    demoLogin("DOCTOR", DEMO_ACCOUNTS.doctor2.email);
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-slate-800 transition-colors"
                >
                  <Stethoscope className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      Dr. Elena Rostova, MD
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Endocrinology &bull; Diabetes
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Admin Switcher */}
          <button
            onClick={() => demoLogin("ADMIN")}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all",
              user?.role === "ADMIN"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-950"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Admin:</span> Arthur
            {user?.role === "ADMIN" && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
