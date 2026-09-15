export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  doctorProfile?: DoctorProfile | null;
  patientProfile?: PatientProfile | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  bio?: string | null;
  consultationFee: number;
  availableDays: string;
  hospital: string;
  experienceYears: number;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
}

export type RecordType =
  | "LAB_REPORT"
  | "IMAGING"
  | "PRESCRIPTION"
  | "DISCHARGE_SUMMARY"
  | "GENERAL";

export interface VitalsData {
  bp?: string; // e.g. "120/80"
  hr?: number; // bpm
  glucose?: number; // mg/dL
  weight?: number; // kg
  temp?: number; // °F
  spo2?: number; // %
  bmi?: number;
  height?: number; // cm
  respiratoryRate?: number; // breaths/min
}

export interface RecordAttachment {
  id: string;
  recordId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string | Date;
}

export interface MedicalRecord {
  id: string;
  title: string;
  recordType: RecordType;
  description?: string | null;
  date: string | Date;
  vitalsJson?: string | null;
  vitals?: VitalsData;
  patientId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    patientProfile?: PatientProfile | null;
  };
  doctorId?: string | null;
  doctor?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    doctorProfile?: DoctorProfile | null;
  } | null;
  attachments?: RecordAttachment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type ConsultationType = "IN_PERSON" | "VIDEO_CALL";

export interface Appointment {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    patientProfile?: PatientProfile | null;
  };
  doctorId: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    doctorProfile?: DoctorProfile | null;
  };
  dateTime: string | Date;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  diagnosis?: string | null;
  notes?: string | null;
  consultationType: ConsultationType;
  prescription?: Prescription | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type PrescriptionStatus = "ACTIVE" | "COMPLETED" | "DISCONTINUED";
export type MedicationTiming =
  | "BEFORE_MEAL"
  | "AFTER_MEAL"
  | "WITH_FOOD"
  | "ANYTIME";

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  durationDays: number;
  instructions?: string | null;
  logs?: MedicationLog[];
  createdAt?: string | Date;
}

export interface Prescription {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  doctorId: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    doctorProfile?: DoctorProfile | null;
  };
  appointmentId?: string | null;
  appointment?: Appointment | null;
  diagnosis?: string | null;
  status: PrescriptionStatus;
  notes?: string | null;
  issuedDate: string | Date;
  validUntil?: string | Date | null;
  items: PrescriptionItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type MedicationLogStatus = "PENDING" | "TAKEN" | "SKIPPED" | "MISSED";
export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";

export interface MedicationLog {
  id: string;
  prescriptionItemId: string;
  prescriptionItem?: PrescriptionItem;
  patientId: string;
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  takenAt?: string | Date | null;
  status: MedicationLogStatus;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  action: string;
  entity: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
}

export interface DashboardStats {
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  totalRecords?: number;
  activePrescriptions?: number;
  adherenceRate?: number; // 0-100%
  pendingAppointments?: number;
  todayAppointmentsCount?: number;
  upcomingAppointments?: Appointment[];
  recentRecords?: MedicalRecord[];
  todayMedications?: {
    item: PrescriptionItem;
    log?: MedicationLog;
    timeSlot: TimeSlot;
    status: MedicationLogStatus;
  }[];
  vitalTrends?: {
    date: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    glucose?: number;
    hr?: number;
    weight?: number;
  }[];
}
