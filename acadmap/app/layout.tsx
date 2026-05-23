import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/Navbar";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AcadMap - Your degree, mapped.",
  description:
    "Interactive degree roadmaps for courses, prerequisites, and career paths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-indigo-500/15 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          AcadMap — community-built degree roadmaps
        </footer>
      </body>
    </html>
  );
}
