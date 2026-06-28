import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { FirebaseSetupNotice } from "@/components/FirebaseSetupNotice";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Community Hero AI",
  description: "AI-powered hyperlocal civic issue reporting and resolution platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <FirebaseSetupNotice />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
