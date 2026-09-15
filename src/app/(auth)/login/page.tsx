"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_ACCOUNTS } from "@/context/AuthContext";
import {
  HeartPulse,
  User,
  Stethoscope,
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-medical-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-600 to-medical-400 flex items-center justify-center text-white shadow-xl shadow-medical-500/30 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-7 h-7" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">
            Healthfile
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-white tracking-tight">
          Sign In to Your Health Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your clinical or patient credentials to access your dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 border border-slate-800/90 py-8 px-4 shadow-2xl shadow-black/80 rounded-2xl sm:px-10 backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@healthfile.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={submitting}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Demo Accounts Section */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Demo Accounts
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => demoLogin("PATIENT")}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-teal-300">
                      Patient: Alex Morgan
                    </div>
                    <div className="text-[10px] text-slate-400">
                      alex.morgan@healthfile.com &bull; patient123
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-400">Login &rarr;</span>
              </button>

              <button
                onClick={() => demoLogin("DOCTOR")}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                      Doctor: Dr. Sarah Mitchell, MD
                    </div>
                    <div className="text-[10px] text-slate-400">
                      dr.sarah@healthfile.com &bull; doctor123
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-400">Login &rarr;</span>
              </button>

              <button
                onClick={() => demoLogin("ADMIN")}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                      Admin: Arthur Pendelton
                    </div>
                    <div className="text-[10px] text-slate-400">
                      admin@healthfile.com &bull; admin123
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-400">Login &rarr;</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-teal-400 hover:underline font-semibold">
              Register New Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
