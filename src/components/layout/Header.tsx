"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  Bell,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              user?.role === "DOCTOR"
                ? "Search patient name, MRN, diagnosis..."
                : "Search lab reports, doctors, prescriptions..."
            }
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500/60 focus:ring-1 focus:ring-medical-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Live Status */}
      <div className="flex items-center gap-3">
        {/* HIPAA Compliance Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-medical-400" />
          <span>HIPAA Encrypted</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-medical-400 animate-pulse" />
          </button>
        </div>

        {/* Role badge */}
        {user && (
          <Badge
            variant={
              user.role === "DOCTOR"
                ? "info"
                : user.role === "ADMIN"
                ? "purple"
                : "primary"
            }
            size="sm"
            dot
          >
            {user.role}
          </Badge>
        )}
      </div>
    </header>
  );
}
