"use client";

import React, { useState } from "react";
import { Activity, Heart, Droplets, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  glucose?: number;
  hr?: number;
  weight?: number;
}

interface VitalsChartProps {
  data?: DataPoint[];
  className?: string;
}

export function VitalsChart({ data = [], className }: VitalsChartProps) {
  const [activeMetric, setActiveMetric] = useState<"bp" | "glucose" | "hr" | "weight">("bp");

  // Sample data fallback if empty
  const chartData: DataPoint[] =
    data.length > 0
      ? data
      : [
          { date: "May 10", bpSystolic: 135, bpDiastolic: 88, glucose: 122, hr: 78, weight: 81.2 },
          { date: "Jun 14", bpSystolic: 130, bpDiastolic: 85, glucose: 115, hr: 74, weight: 80.2 },
          { date: "Jul 15", bpSystolic: 128, bpDiastolic: 84, glucose: 112, hr: 68, weight: 79.0 },
          { date: "Aug 20", bpSystolic: 124, bpDiastolic: 82, glucose: 108, hr: 72, weight: 78.5 },
          { date: "Sep 12", bpSystolic: 120, bpDiastolic: 78, glucose: 102, hr: 70, weight: 78.0 },
        ];

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const pointsCount = chartData.length;
  const getX = (index: number) =>
    paddingX + (index / Math.max(pointsCount - 1, 1)) * (svgWidth - 2 * paddingX);

  // Compute metric scale
  let minVal = 60;
  let maxVal = 160;
  let unit = "mmHg";

  if (activeMetric === "bp") {
    minVal = 60;
    maxVal = 160;
    unit = "mmHg";
  } else if (activeMetric === "glucose") {
    minVal = 70;
    maxVal = 160;
    unit = "mg/dL";
  } else if (activeMetric === "hr") {
    minVal = 50;
    maxVal = 110;
    unit = "bpm";
  } else if (activeMetric === "weight") {
    minVal = 65;
    maxVal = 95;
    unit = "kg";
  }

  const getY = (val?: number) => {
    if (val === undefined) return svgHeight - paddingY;
    const clamped = Math.min(Math.max(val, minVal), maxVal);
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
  };

  const generatePath = (valKey: "bpSystolic" | "bpDiastolic" | "glucose" | "hr" | "weight") => {
    return chartData
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[valKey]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const generateAreaPath = (valKey: "bpSystolic" | "glucose" | "hr" | "weight") => {
    const linePath = generatePath(valKey);
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const baseline = svgHeight - paddingY;
    return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Metric Selector tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMetric("bp")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeMetric === "bp"
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-medical-400" />
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveMetric("glucose")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeMetric === "glucose"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            Blood Glucose
          </button>
          <button
            onClick={() => setActiveMetric("hr")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeMetric === "hr"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Heart Rate
          </button>
          <button
            onClick={() => setActiveMetric("weight")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeMetric === "weight"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            Weight
          </button>
        </div>

        {/* Latest Value Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Latest:</span>
          {activeMetric === "bp" && (
            <span className="text-sm font-bold text-medical-400">
              {chartData[chartData.length - 1]?.bpSystolic || 120}/
              {chartData[chartData.length - 1]?.bpDiastolic || 80}{" "}
              <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
            </span>
          )}
          {activeMetric === "glucose" && (
            <span className="text-sm font-bold text-blue-400">
              {chartData[chartData.length - 1]?.glucose || 100}{" "}
              <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
            </span>
          )}
          {activeMetric === "hr" && (
            <span className="text-sm font-bold text-rose-400">
              {chartData[chartData.length - 1]?.hr || 70}{" "}
              <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
            </span>
          )}
          {activeMetric === "weight" && (
            <span className="text-sm font-bold text-purple-400">
              {chartData[chartData.length - 1]?.weight || 78}{" "}
              <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
            </span>
          )}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full h-[220px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="medicalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const y = paddingY + r * (svgHeight - 2 * paddingY);
            const val = Math.round(maxVal - r * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {activeMetric === "bp" && (
            <path
              d={generateAreaPath("bpSystolic")}
              fill="url(#medicalGradient)"
            />
          )}
          {activeMetric === "glucose" && (
            <path d={generateAreaPath("glucose")} fill="url(#blueGradient)" />
          )}
          {activeMetric === "hr" && (
            <path d={generateAreaPath("hr")} fill="url(#roseGradient)" />
          )}
          {activeMetric === "weight" && (
            <path d={generateAreaPath("weight")} fill="url(#purpleGradient)" />
          )}

          {/* Paths & Points */}
          {activeMetric === "bp" && (
            <>
              {/* Systolic Line */}
              <path
                d={generatePath("bpSystolic")}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Diastolic Line */}
              <path
                d={generatePath("bpDiastolic")}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <g key={`bp-${i}`}>
                  <circle
                    cx={getX(i)}
                    cy={getY(d.bpSystolic)}
                    r="4"
                    fill="#14b8a6"
                    stroke="#090e17"
                    strokeWidth="2"
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(d.bpDiastolic)}
                    r="3.5"
                    fill="#2dd4bf"
                    stroke="#090e17"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </>
          )}

          {activeMetric === "glucose" && (
            <>
              <path
                d={generatePath("glucose")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle
                  key={`gl-${i}`}
                  cx={getX(i)}
                  cy={getY(d.glucose)}
                  r="4"
                  fill="#3b82f6"
                  stroke="#090e17"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {activeMetric === "hr" && (
            <>
              <path
                d={generatePath("hr")}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle
                  key={`hr-${i}`}
                  cx={getX(i)}
                  cy={getY(d.hr)}
                  r="4"
                  fill="#f43f5e"
                  stroke="#090e17"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {activeMetric === "weight" && (
            <>
              <path
                d={generatePath("weight")}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle
                  key={`wt-${i}`}
                  cx={getX(i)}
                  cy={getY(d.weight)}
                  r="4"
                  fill="#a855f7"
                  stroke="#090e17"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* X Axis labels */}
          {chartData.map((d, i) => (
            <text
              key={`x-${i}`}
              x={getX(i)}
              y={svgHeight - 10}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
            >
              {d.date}
            </text>
          ))}
        </svg>
      </div>

      {activeMetric === "bp" && (
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-medical-400 rounded-full" />
            <span>Systolic Pressure (Top)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-b border-dashed border-medical-300" />
            <span>Diastolic Pressure (Bottom)</span>
          </div>
        </div>
      )}
    </div>
  );
}
