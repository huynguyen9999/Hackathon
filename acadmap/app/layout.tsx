import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Navbar } from "@/components/Navbar";
import { APP_FOOTER_TAGLINE, APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { getNavAuthState } from "@/lib/auth-session";
import { themeInitScript } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description:
    "Interactive degree roadmaps for courses, prerequisites, and career paths.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuth = await getNavAuthState();

  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Navbar initialAuth={initialAuth} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gaucho-blue/10 bg-white py-6 text-center text-xs text-slate-500 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark">
          {APP_NAME} · {APP_FOOTER_TAGLINE}
        </footer>
      </body>
    </html>
  );
}
