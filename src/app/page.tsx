"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  HeartPulse,
  ShieldCheck,
  Activity,
  FileText,
  Calendar,
  Pill,
  Video,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Users,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { demoLogin, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-9 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-medical-400 flex items-center justify-center text-white shadow-lg shadow-medical-500/30">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
                Healthfile
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-medical-500/20 text-medical-300 font-bold border border-medical-500/30">
                  EHR 2026
                </span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-medical-400 transition-colors">
              Platform Features
            </a>
            <a href="#clinical" className="hover:text-medical-400 transition-colors">
              Clinical Workflows
            </a>
            <a href="#security" className="hover:text-medical-400 transition-colors">
              HIPAA & Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => demoLogin("PATIENT")}
              disabled={loading}
            >
              Launch Live App
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-medical-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-teal-300 shadow-xl backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              Next-Gen Electronic Health Records & Telehealth Care
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Unifying Care for{" "}
              <span className="bg-gradient-to-r from-medical-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Patients, Doctors, & Clinics
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Healthfile eliminates fragmented medical data. Securely store diagnostic records, track daily pill adherence with instant doctor synchronization, book visits, and join encrypted telehealth video suites.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => demoLogin("PATIENT")}
                disabled={loading}
              >
                <Activity className="w-5 h-5 mr-2" />
                Explore as Patient (Alex)
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => demoLogin("DOCTOR")}
                disabled={loading}
              >
                <Stethoscope className="w-5 h-5 mr-2 text-blue-400" />
                Enter as Doctor (Dr. Sarah)
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => demoLogin("ADMIN")}
                disabled={loading}
              >
                <ShieldCheck className="w-5 h-5 mr-2 text-purple-400" />
                Admin Audit Suite
              </Button>
            </div>
          </div>

          {/* Interactive Hero UI Preview Card */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-4 sm:p-8 shadow-2xl shadow-teal-950/50 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    healthfile://dashboard.patient.clinical-live
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Live Sync Active
                </div>
              </div>

              {/* Grid of sample widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Widget 1: Vitals */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-400" />
                      Blood Pressure
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                      Optimal
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    120/78 <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Down from 135/88 over last 90 days with Lisinopril therapy.
                  </p>
                </div>

                {/* Widget 2: Pill Tracker */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-purple-400" />
                      Daily Pill Schedule
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                      94% Streak
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl text-xs">
                    <div>
                      <div className="font-semibold text-white">Metformin 500mg</div>
                      <div className="text-[10px] text-slate-400">Evening &bull; After Meal</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      Taken
                    </span>
                  </div>
                </div>

                {/* Widget 3: Telehealth */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-400" />
                      Next Telehealth Visit
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                      In 2 Days
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dr. Sarah Mitchell, MD</div>
                    <div className="text-[11px] text-teal-400">Cardiology & BP Evaluation</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-teal-400" />
                    Encrypted WebRTC Room
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Engineered for Modern Clinical Excellence
            </h2>
            <p className="text-sm text-slate-400">
              Built with uncompromising security, responsive design, and intuitive role-tailored workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Encrypted Records Vault
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Store lab panels, high-resolution DICOM/imaging scans, ECG waveforms, and discharge summaries with immediate in-browser preview and PDF exports.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Intelligent Pill & Adherence Tracker
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Time-slotted reminders for Morning, Afternoon, Evening, and Night. Logs adherence streaks with real-time feedback loops for attending physicians.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Interactive Telehealth Suite
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-definition video consultations with live side-panel patient vital sign telemetry, real-time SOAP clinical notes, and digital prescription issuance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-300">Healthfile EHR &bull; Clinical OS</span>
          </div>
          <div>
            Built with Next.js 15, Prisma ORM, and SQLite &bull; HIPAA Compliant Security Standard
          </div>
        </div>
      </footer>
    </div>
  );
}
