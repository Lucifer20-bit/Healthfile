"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Video, Building, Stethoscope, CheckCircle2, AlertCircle } from "lucide-react";
import type { ConsultationType } from "@/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>("10:00 AM");
  const [consultationType, setConsultationType] = useState<ConsultationType>("IN_PERSON");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/doctors")
        .then((res) => res.json())
        .then((data) => {
          if (data.doctors && data.doctors.length > 0) {
            setDoctors(data.doctors);
            setSelectedDoctorId(data.doctors[0].id);
          }
        })
        .catch((err) => console.error("Error loading doctors:", err));
    }
  }, [isOpen]);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:30 AM",
    "02:00 PM",
    "03:30 PM",
    "04:45 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !reason) {
      setError("Please select a physician and state the reason for consultation.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse date + time
      const [timePart, modifier] = timeSlot.split(" ");
      const [hoursStr, minutesStr] = timePart.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const targetDate = new Date(date);
      targetDate.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          dateTime: targetDate.toISOString(),
          durationMinutes: 30,
          reason,
          consultationType,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to book appointment");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Book a Clinical Appointment"
      description="Schedule a specialist consultation with board-certified physicians."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Physician / Specialist *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedDoctorId === doc.id
                    ? "bg-medical-500/15 border-medical-500/50 shadow-sm"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                  alt={doc.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-teal-400 truncate">
                    {doc.doctorProfile?.specialization || "General Medicine"}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{doc.doctorProfile?.hospital || "Hospital"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Consultation Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConsultationType("IN_PERSON")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                consultationType === "IN_PERSON"
                  ? "bg-medical-500/20 text-medical-300 border-medical-500/50"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Building className="w-4 h-4 text-medical-400" />
              In-Person Clinic Visit
            </button>
            <button
              type="button"
              onClick={() => setConsultationType("VIDEO_CALL")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                consultationType === "VIDEO_CALL"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Video className="w-4 h-4 text-purple-400" />
              Virtual Telehealth Call
            </button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Date
            </label>
            <input
              type="date"
              required
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-1 text-[11px] font-medium rounded-lg border transition-all ${
                    timeSlot === slot
                      ? "bg-medical-500/20 text-medical-300 border-medical-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Reason for Consultation & Symptoms *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Routine blood pressure follow-up and prescription refill"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Additional Patient Notes / Instructions
          </label>
          <input
            type="text"
            placeholder="Any specific questions or recent symptom changes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-medical-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Estimated Fee:{" "}
            <span className="font-semibold text-white">
              ${selectedDoctor?.doctorProfile?.consultationFee || "75.00"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirm Appointment
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
