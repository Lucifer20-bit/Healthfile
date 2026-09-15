"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  HeartPulse,
  LayoutDashboard,
  FileText,
  Calendar,
  Pill,
  User,
  Users,
  ClipboardList,
  ShieldAlert,
  LogOut,
  Stethoscope,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const patientNav = [
    { label: "Health Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { label: "Medical Records", href: "/dashboard/patient/records", icon: FileText },
    { label: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
    { label: "Pill Tracker", href: "/dashboard/patient/medications", icon: Pill },
    { label: "Health Profile", href: "/dashboard/patient/profile", icon: User },
  ];

  const doctorNav = [
    { label: "Clinical Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
    { label: "Patient Directory", href: "/dashboard/doctor/patients", icon: Users },
    { label: "Appointments Queue", href: "/dashboard/doctor/appointments", icon: Calendar },
    { label: "Prescription Pad", href: "/dashboard/doctor/prescriptions", icon: ClipboardList },
  ];

  const adminNav = [
    { label: "Executive Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/dashboard/admin/users", icon: Users },
    { label: "HIPAA Audit Trails", href: "/dashboard/admin/audit", icon: ShieldAlert },
  ];

  let currentNav = patientNav;
  let roleBadge = { label: "Patient Portal", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" };

  if (user?.role === "DOCTOR") {
    currentNav = doctorNav;
    roleBadge = { label: "Physician Clinical Suite", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  } else if (user?.role === "ADMIN") {
    currentNav = adminNav;
    roleBadge = { label: "Hospital Administration", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-medical-400 flex items-center justify-center text-white shadow-lg shadow-medical-500/30 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  Healthfile
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-medical-500/20 text-medical-300 font-semibold uppercase tracking-wider">
                    EHR
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Clinical Care OS
                </span>
              </div>
            </Link>
          </div>

          {/* Role pill */}
          <div className="px-5 pt-4 pb-2">
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between",
                roleBadge.color
              )}
            >
              <span>{roleBadge.label}</span>
              {user?.role === "DOCTOR" && <Stethoscope className="w-3.5 h-3.5" />}
              {user?.role === "PATIENT" && <HeartPulse className="w-3.5 h-3.5" />}
              {user?.role === "ADMIN" && <ShieldAlert className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-medical-500/15 text-medical-300 border border-medical-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-medical-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Direct Telehealth Link */}
            <Link
              href="/dashboard/telehealth/demo-session"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 border border-purple-500/20 transition-all mt-4"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>Virtual Telehealth Room</span>
            </Link>
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={user?.name || "User"}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.name || "Guest User"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user?.email || "Signed Out"}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
