import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { DemoUserBar } from "@/components/auth/DemoUserBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthfile | Next-Generation Electronic Health Records & Care Management",
  description:
    "An enterprise-grade Electronic Health Records (EHR) and clinical care management platform connecting Patients, Physicians, and Healthcare Administrators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-medical-500 selection:text-white">
        <AuthProvider>
          <DemoUserBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
