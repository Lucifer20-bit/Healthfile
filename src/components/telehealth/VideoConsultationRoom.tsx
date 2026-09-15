"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Activity,
  Send,
  Sparkles,
  Lock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
}

interface VideoConsultationRoomProps {
  appointmentId?: string;
  doctorName?: string;
  patientName?: string;
  onEndCall?: () => void;
}

export function VideoConsultationRoom({
  doctorName = "Dr. Sarah Mitchell, MD",
  patientName = "Alex Morgan",
  onEndCall,
}: VideoConsultationRoomProps) {
  const { user } = useAuth();
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [activeTab, setActiveTab] = useState<"notes" | "chat" | "vitals">("vitals");
  const [callDuration, setCallDuration] = useState(145); // seconds
  const [notes, setNotes] = useState(
    "Patient reports mild morning headaches on waking. Resting BP 124/82, glycemic control stable on metformin 500mg. Recommended ergonomic adjustments and hydration."
  );

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "System",
      role: "SYSTEM",
      text: "End-to-End HIPAA Encrypted Telehealth Session Initialized.",
      time: "10:00 AM",
    },
    {
      id: "2",
      sender: doctorName,
      role: "DOCTOR",
      text: "Good morning Alex! I can hear and see you clearly. How have you been feeling this week?",
      time: "10:01 AM",
    },
    {
      id: "3",
      sender: patientName,
      role: "PATIENT",
      text: "Hi Doctor, feeling generally good, just wanted to check my latest blood glucose trend and headache symptoms.",
      time: "10:02 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: user?.name || "Participant",
      role: user?.role || "PATIENT",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const isDoctor = user?.role === "DOCTOR";
  const remoteParticipantName = isDoctor ? patientName : doctorName;
  const remoteParticipantRole = isDoctor ? "Patient" : "Attending Physician";

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Left: Video Stage */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/60 relative p-4 lg:p-6 overflow-hidden">
        {/* Top Video Overlay Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-white text-xs font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE &bull; {formatDuration(callDuration)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-slate-300 text-xs backdrop-blur-md">
              <Lock className="w-3 h-3 text-medical-400" />
              <span>256-bit HIPAA Stream</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              HD 1080p &bull; 18ms
            </Badge>
          </div>
        </div>

        {/* Main Remote Video Stream Viewport */}
        <div className="my-auto flex flex-col items-center justify-center text-center relative z-0">
          {videoActive ? (
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center p-6 shadow-2xl overflow-hidden group">
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-gradient-to-tr from-medical-950/30 via-slate-950 to-blue-950/20 pointer-events-none" />

              {/* Animated waveform bars for voice activity */}
              <div className="absolute top-4 left-4 flex items-end gap-1 h-6">
                {[40, 75, 100, 60, 90, 45, 80, 50].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-teal-400/80 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>

              {/* Main Participant Avatar */}
              <div className="relative mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    isDoctor
                      ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={remoteParticipantName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-2 border-teal-500/40 shadow-2xl shadow-teal-500/20"
                />
                <span className="absolute -bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-bold tracking-wide">
                  Speaking
                </span>
              </div>

              <h4 className="text-lg font-bold text-white tracking-tight">
                {remoteParticipantName}
              </h4>
              <p className="text-xs text-teal-300 font-medium">
                {remoteParticipantRole}
              </p>

              {/* Self Picture-in-Picture Video */}
              <div className="absolute bottom-4 right-4 w-32 sm:w-40 aspect-video bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt="You"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                  You ({micActive ? "Mic On" : "Muted"})
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <VideoOff className="w-16 h-16 mb-4 text-slate-400" />
              <p className="text-sm">Video feed paused</p>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-center gap-3 z-10 pt-4">
          <button
            onClick={() => setMicActive(!micActive)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all duration-200",
              micActive
                ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                : "bg-rose-600/90 text-white border-rose-500 shadow-lg shadow-rose-900/40"
            )}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoActive(!videoActive)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all duration-200",
              videoActive
                ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                : "bg-rose-600/90 text-white border-rose-500 shadow-lg shadow-rose-900/40"
            )}
            title={videoActive ? "Turn Off Camera" : "Turn On Camera"}
          >
            {videoActive ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950 border border-rose-400/30 transition-all hover:scale-105"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Right: Telehealth Workspace Panel */}
      <div className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
        {/* Panel Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/50 p-2 gap-1">
          <button
            onClick={() => setActiveTab("vitals")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === "vitals"
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/30"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Vitals
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === "notes"
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/30"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Clinical Notes
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === "chat"
                ? "bg-medical-500/20 text-medical-300 border border-medical-500/30"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Encrypted Chat
          </button>
        </div>

        {/* Tab 1: Live Vitals */}
        {activeTab === "vitals" && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Patient Vital Signs Snapshot
              </span>
              <span className="text-[10px] text-teal-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Real-time Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Blood Pressure</span>
                <span className="text-base font-bold text-medical-400">124/82</span>
                <span className="text-[10px] text-slate-400 ml-1">mmHg</span>
                <div className="mt-1">
                  <Badge variant="success" size="sm">Optimal</Badge>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Fasting Glucose</span>
                <span className="text-base font-bold text-blue-400">108</span>
                <span className="text-[10px] text-slate-400 ml-1">mg/dL</span>
                <div className="mt-1">
                  <Badge variant="warning" size="sm">Prediabetic</Badge>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Heart Rate</span>
                <span className="text-base font-bold text-rose-400">72</span>
                <span className="text-[10px] text-slate-400 ml-1">bpm</span>
                <div className="mt-1">
                  <Badge variant="success" size="sm">Resting Normal</Badge>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Blood Oxygen (SpO2)</span>
                <span className="text-base font-bold text-teal-400">99%</span>
                <div className="mt-1">
                  <Badge variant="success" size="sm">Excellent</Badge>
                </div>
              </div>
            </div>

            {/* Medical Alerts */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-300 block">
                Clinical Allergy Alert
              </span>
              <p className="text-[11px] text-slate-300">
                Patient is allergic to <strong className="text-amber-200">Penicillin</strong> and <strong className="text-amber-200">Peanuts</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical Notes */}
        {activeTab === "notes" && (
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                SOAP Consultation Notes
              </span>
              <span className="text-[10px] text-slate-400">Auto-saved</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter subjective symptoms, objective vitals, assessment and plan..."
              className="w-full flex-1 min-h-[220px] bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500 resize-none font-mono"
            />
            <Button size="sm" variant="primary">
              Attach Notes to Visit Record
            </Button>
          </div>
        )}

        {/* Tab 3: Encrypted Chat */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 mb-3">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "p-2.5 rounded-xl text-xs space-y-1 max-w-[85%]",
                    m.role === "SYSTEM"
                      ? "bg-slate-900/60 border border-slate-800 text-slate-400 mx-auto text-center max-w-full text-[11px]"
                      : m.sender === user?.name
                      ? "bg-medical-600/30 border border-medical-500/40 text-teal-100 ml-auto"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  )}
                >
                  {m.role !== "SYSTEM" && (
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 gap-2">
                      <span>{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                  )}
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type message to doctor..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-medical-500"
              />
              <button
                type="submit"
                className="p-2 bg-medical-600 hover:bg-medical-500 text-white rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
