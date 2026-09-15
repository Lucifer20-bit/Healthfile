import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getBloodPressureStatus(bpString?: string): {
  label: string;
  color: "normal" | "warning" | "danger";
} {
  if (!bpString) return { label: "Unknown", color: "normal" };
  const parts = bpString.split("/");
  if (parts.length !== 2) return { label: bpString, color: "normal" };
  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);

  if (isNaN(systolic) || isNaN(diastolic)) return { label: bpString, color: "normal" };

  if (systolic < 120 && diastolic < 80) {
    return { label: "Optimal", color: "normal" };
  } else if (systolic <= 129 && diastolic < 80) {
    return { label: "Elevated", color: "warning" };
  } else if (systolic <= 139 || diastolic <= 89) {
    return { label: "Stage 1 HTN", color: "warning" };
  } else {
    return { label: "Stage 2 HTN", color: "danger" };
  }
}

export function getGlucoseStatus(mgDl?: number): {
  label: string;
  color: "normal" | "warning" | "danger";
} {
  if (!mgDl) return { label: "Normal", color: "normal" };
  if (mgDl < 70) return { label: "Low (Hypo)", color: "danger" };
  if (mgDl <= 99) return { label: "Normal Fasting", color: "normal" };
  if (mgDl <= 125) return { label: "Prediabetic", color: "warning" };
  return { label: "High (Hyper)", color: "danger" };
}

export function getRecordTypeBadge(type: string): {
  label: string;
  className: string;
} {
  switch (type) {
    case "LAB_REPORT":
      return {
        label: "Lab Report",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    case "IMAGING":
      return {
        label: "Imaging / Scan",
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    case "PRESCRIPTION":
      return {
        label: "Prescription",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "DISCHARGE_SUMMARY":
      return {
        label: "Discharge Summary",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    default:
      return {
        label: "General Consultation",
        className: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      };
  }
}

export function getStatusBadge(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        className: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "TAKEN":
      return {
        label: "Taken",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "SKIPPED":
      return {
        label: "Skipped",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "ACTIVE":
      return {
        label: "Active",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    default:
      return {
        label: status,
        className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
  }
}
