import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Healthfile database seed...");

  // Clean existing data
  await prisma.medicationLog.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.recordAttachment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Common password hash for test accounts
  const adminPassword = await bcrypt.hash("admin123", 10);
  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const patientPassword = await bcrypt.hash("patient123", 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@healthfile.com",
      passwordHash: adminPassword,
      name: "Arthur Pendelton (Admin)",
      role: "ADMIN",
      phone: "+1 (555) 019-2831",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Create Doctors
  const drSarah = await prisma.user.create({
    data: {
      email: "dr.sarah@healthfile.com",
      passwordHash: doctorPassword,
      name: "Dr. Sarah Mitchell, MD",
      role: "DOCTOR",
      phone: "+1 (555) 234-5678",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      doctorProfile: {
        create: {
          specialization: "Cardiology & Preventive Medicine",
          licenseNumber: "MD-CARD-99201",
          bio: "Board-certified cardiologist with over 12 years of clinical experience in preventive cardiovascular health, hypertension management, and echocardiography.",
          consultationFee: 120.0,
          availableDays: "Mon,Tue,Wed,Thu,Fri",
          hospital: "Metropolitan Heart & Vascular Institute",
          experienceYears: 12,
        },
      },
    },
    include: { doctorProfile: true },
  });

  const drMarcus = await prisma.user.create({
    data: {
      email: "dr.marcus@healthfile.com",
      passwordHash: doctorPassword,
      name: "Dr. Marcus Vance, MD",
      role: "DOCTOR",
      phone: "+1 (555) 345-6789",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      doctorProfile: {
        create: {
          specialization: "Neurology & Sleep Medicine",
          licenseNumber: "MD-NEUR-77382",
          bio: "Specializing in neurological diagnostics, chronic migraines, neuro-rehabilitation, and sleep disorder therapies.",
          consultationFee: 150.0,
          availableDays: "Mon,Wed,Fri",
          hospital: "University Neuro-Science Pavilion",
          experienceYears: 15,
        },
      },
    },
    include: { doctorProfile: true },
  });

  const drElena = await prisma.user.create({
    data: {
      email: "dr.elena@healthfile.com",
      passwordHash: doctorPassword,
      name: "Dr. Elena Rostova, MD",
      role: "DOCTOR",
      phone: "+1 (555) 456-7890",
      avatar: "https://images.unsplash.com/photo-1594824813637-4560731a5eb2?w=150&auto=format&fit=crop&q=80",
      doctorProfile: {
        create: {
          specialization: "Endocrinology & Metabolic Disorders",
          licenseNumber: "MD-ENDO-44910",
          bio: "Expert in diabetes management, endocrine health, thyroid therapies, and metabolic lifestyle intervention.",
          consultationFee: 110.0,
          availableDays: "Tue,Thu,Sat",
          hospital: "St. Jude Endocrine Wellness Center",
          experienceYears: 9,
        },
      },
    },
    include: { doctorProfile: true },
  });

  // 3. Create Patients
  const alex = await prisma.user.create({
    data: {
      email: "alex.morgan@healthfile.com",
      passwordHash: patientPassword,
      name: "Alex Morgan",
      role: "PATIENT",
      phone: "+1 (555) 890-1234",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      patientProfile: {
        create: {
          dateOfBirth: new Date("1990-06-14"),
          gender: "Male",
          bloodGroup: "O+",
          allergies: "Penicillin, Peanuts",
          chronicConditions: "Type 2 Diabetes, Stage 1 Hypertension",
          emergencyContact: "Claire Morgan (Spouse) - +1 (555) 890-9988",
          address: "742 Evergreen Terrace, Springfield, OR",
        },
      },
    },
    include: { patientProfile: true },
  });

  const olivia = await prisma.user.create({
    data: {
      email: "olivia.chen@healthfile.com",
      passwordHash: patientPassword,
      name: "Olivia Chen",
      role: "PATIENT",
      phone: "+1 (555) 901-2345",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      patientProfile: {
        create: {
          dateOfBirth: new Date("1996-11-22"),
          gender: "Female",
          bloodGroup: "A+",
          allergies: "Sulfa drugs, Dust mites",
          chronicConditions: "Mild Intermittent Asthma",
          emergencyContact: "David Chen (Father) - +1 (555) 901-9988",
          address: "128 Beacon St, Boston, MA",
        },
      },
    },
    include: { patientProfile: true },
  });

  // 4. Create Medical Records for Alex Morgan
  const rec1 = await prisma.medicalRecord.create({
    data: {
      title: "Comprehensive Metabolic Panel & HbA1c Lab Report",
      recordType: "LAB_REPORT",
      description: "Routine 3-month follow-up for Glycemic and Lipid monitoring. Fasting glucose at 108 mg/dL, HbA1c at 6.4%, showing positive trend following metformin adjustment.",
      date: new Date("2026-08-20"),
      vitalsJson: JSON.stringify({
        bp: "124/82",
        hr: 72,
        glucose: 108,
        weight: 78.5,
        temp: 98.4,
        spo2: 99,
        bmi: 24.8,
      }),
      patientId: alex.id,
      doctorId: drElena.id,
      attachments: {
        create: [
          {
            fileName: "cmp_hba1c_aug2026.pdf",
            originalName: "Comprehensive_Metabolic_Panel_Aug_2026.pdf",
            filePath: "/uploads/samples/sample_lab_report.pdf",
            mimeType: "application/pdf",
            fileSize: 482910,
          },
        ],
      },
    },
  });

  const rec2 = await prisma.medicalRecord.create({
    data: {
      title: "12-Lead Electrocardiogram (ECG) & Echo Summary",
      recordType: "IMAGING",
      description: "Normal sinus rhythm at 68 bpm. Normal axis, normal PR and QT intervals. No evidence of ischemia or left ventricular hypertrophy.",
      date: new Date("2026-07-15"),
      vitalsJson: JSON.stringify({
        bp: "128/84",
        hr: 68,
        glucose: 112,
        weight: 79.0,
        temp: 98.6,
        spo2: 98,
        bmi: 25.0,
      }),
      patientId: alex.id,
      doctorId: drSarah.id,
      attachments: {
        create: [
          {
            fileName: "ecg_trace_jul2026.svg",
            originalName: "12_Lead_ECG_July_2026.svg",
            filePath: "/uploads/samples/sample_ecg.svg",
            mimeType: "image/svg+xml",
            fileSize: 12405,
          },
        ],
      },
    },
  });

  const rec3 = await prisma.medicalRecord.create({
    data: {
      title: "Annual Preventative Health & Physical Assessment",
      recordType: "GENERAL",
      description: "Full physical examination. Clear lungs, heart sounds S1/S2 normal without murmurs. Abdomen soft, non-tender. Advised continued aerobic exercise 150min/week and Mediterranean diet.",
      date: new Date("2026-06-10"),
      vitalsJson: JSON.stringify({
        bp: "130/85",
        hr: 74,
        glucose: 115,
        weight: 80.2,
        temp: 98.7,
        spo2: 99,
        bmi: 25.4,
      }),
      patientId: alex.id,
      doctorId: drSarah.id,
    },
  });

  // 5. Create Appointments
  const appt1 = await prisma.appointment.create({
    data: {
      patientId: alex.id,
      doctorId: drElena.id,
      dateTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
      durationMinutes: 30,
      status: "CONFIRMED",
      reason: "Quarterly Diabetes & HbA1c Review",
      consultationType: "IN_PERSON",
      notes: "Please bring your last 14-day blood glucose logs.",
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: alex.id,
      doctorId: drSarah.id,
      dateTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
      durationMinutes: 45,
      status: "CONFIRMED",
      reason: "Cardiovascular Risk & Blood Pressure Checkup",
      consultationType: "VIDEO_CALL",
      notes: "Virtual tele-health checkup via encrypted video stream.",
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      patientId: alex.id,
      doctorId: drMarcus.id,
      dateTime: new Date(Date.now() - 86400000 * 14), // 14 days ago
      durationMinutes: 30,
      status: "COMPLETED",
      reason: "Sleep Disturbance & Morning Headache Evaluation",
      diagnosis: "Tension-type nocturnal headache secondary to posture. No focal neurological deficits.",
      notes: "Recommended ergonomic pillow and sleep hygiene routine. Follow up if symptoms recur.",
      consultationType: "IN_PERSON",
    },
  });

  const appt4 = await prisma.appointment.create({
    data: {
      patientId: olivia.id,
      doctorId: drSarah.id,
      dateTime: new Date(Date.now() + 86400000 * 1), // tomorrow
      durationMinutes: 30,
      status: "PENDING",
      reason: "Occasional chest tightness on strenuous running",
      consultationType: "IN_PERSON",
    },
  });

  // 6. Create Active Prescriptions for Alex
  const rx1 = await prisma.prescription.create({
    data: {
      patientId: alex.id,
      doctorId: drElena.id,
      appointmentId: appt3.id,
      diagnosis: "Type 2 Diabetes Mellitus & Primary Hypertension",
      status: "ACTIVE",
      notes: "Maintain consistent meal timing. Re-check fasting blood sugar weekly.",
      issuedDate: new Date(),
      validUntil: new Date(Date.now() + 86400000 * 90), // 90 days validity
      items: {
        create: [
          {
            medicationName: "Metformin Hydrochloride",
            dosage: "500 mg",
            frequency: "Twice Daily (Morning & Evening)",
            timing: "AFTER_MEAL",
            durationDays: 90,
            instructions: "Take with meals to minimize gastrointestinal discomfort.",
          },
          {
            medicationName: "Lisinopril",
            dosage: "10 mg",
            frequency: "Once Daily (Morning)",
            timing: "AFTER_MEAL",
            durationDays: 90,
            instructions: "Take every morning with a full glass of water. Monitor BP.",
          },
          {
            medicationName: "Omega-3 Ethyl Esters",
            dosage: "1000 mg",
            frequency: "Once Daily (Evening)",
            timing: "WITH_FOOD",
            durationDays: 60,
            instructions: "Supports lipid profile and heart health.",
          },
        ],
      },
    },
    include: { items: true },
  });

  // 7. Seed Medication Intake Logs for Today & Yesterday
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const metforminItem = rx1.items.find((i) => i.medicationName.includes("Metformin"));
  const lisinoprilItem = rx1.items.find((i) => i.medicationName.includes("Lisinopril"));
  const omegaItem = rx1.items.find((i) => i.medicationName.includes("Omega-3"));

  if (metforminItem && lisinoprilItem && omegaItem) {
    // Yesterday logs
    await prisma.medicationLog.createMany({
      data: [
        {
          prescriptionItemId: metforminItem.id,
          patientId: alex.id,
          scheduledDate: yesterdayStr,
          timeSlot: "MORNING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 86400000 + 3600000 * 8),
        },
        {
          prescriptionItemId: lisinoprilItem.id,
          patientId: alex.id,
          scheduledDate: yesterdayStr,
          timeSlot: "MORNING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 86400000 + 3600000 * 8),
        },
        {
          prescriptionItemId: metforminItem.id,
          patientId: alex.id,
          scheduledDate: yesterdayStr,
          timeSlot: "EVENING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 86400000 + 3600000 * 19),
        },
        {
          prescriptionItemId: omegaItem.id,
          patientId: alex.id,
          scheduledDate: yesterdayStr,
          timeSlot: "EVENING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 86400000 + 3600000 * 19),
        },
      ],
    });

    // Today logs (Morning taken, evening pending)
    await prisma.medicationLog.createMany({
      data: [
        {
          prescriptionItemId: metforminItem.id,
          patientId: alex.id,
          scheduledDate: todayStr,
          timeSlot: "MORNING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          prescriptionItemId: lisinoprilItem.id,
          patientId: alex.id,
          scheduledDate: todayStr,
          timeSlot: "MORNING",
          status: "TAKEN",
          takenAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          prescriptionItemId: metforminItem.id,
          patientId: alex.id,
          scheduledDate: todayStr,
          timeSlot: "EVENING",
          status: "PENDING",
        },
        {
          prescriptionItemId: omegaItem.id,
          patientId: alex.id,
          scheduledDate: todayStr,
          timeSlot: "EVENING",
          status: "PENDING",
        },
      ],
    });
  }

  // 8. Create Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "SYSTEM_INITIALIZED",
        entity: "System",
        details: "Healthfile EHR database configured and seeded with initial demo data.",
      },
      {
        userId: drElena.id,
        action: "ISSUE_PRESCRIPTION",
        entity: "Prescription",
        details: `Issued 3-item maintenance prescription for patient Alex Morgan.`,
      },
      {
        userId: alex.id,
        action: "LOG_MEDICATION",
        entity: "MedicationLog",
        details: "Marked morning Metformin (500mg) and Lisinopril (10mg) as taken.",
      },
    ],
  });

  console.log("✅ Healthfile database successfully seeded!");
  console.log("--------------------------------------------------");
  console.log("🔑 Demo User Credentials:");
  console.log("  👤 Patient:  alex.morgan@healthfile.com  / patient123");
  console.log("  👩‍⚕️ Doctor:   dr.sarah@healthfile.com     / doctor123");
  console.log("  🛡️ Admin:    admin@healthfile.com        / admin123");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
