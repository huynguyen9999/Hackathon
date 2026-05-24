"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControls } from "@/components/AuthControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_LOGO_INITIALS, APP_NAME } from "@/lib/brand";
import type { NavAuthState } from "@/lib/auth-session";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schools", label: "Schools" },
  { href: "/schools/ucsb/courses", label: "Courses" },
  { href: "/schools/ucsb/grades", label: "Grades", accent: "grades" as const },
  { href: "/schools/ucsb/graduate", label: "Graduate", accent: "graduate" as const },
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
] as const;

function isGraduateNavActive(pathname: string, href: string): boolean {
  if (href !== "/schools/ucsb/graduate") return false;
  if (pathname.startsWith("/schools/ucsb/graduate")) return true;
  if (pathname.startsWith("/roadmap/ucsb/") && /-(ms|phd)$/.test(pathname)) {
    return true;
  }
  return false;
}

function isGradesNavActive(pathname: string, href: string): boolean {
  return href === "/schools/ucsb/grades" && pathname.startsWith(href);
}

export type NavbarProps = {
  className?: string;
  initialAuth: NavAuthState;
};

export function Navbar({ className = "", initialAuth }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header
      className={`border-b-2 border-gaucho-gold/80 bg-white dark:border-gaucho-gold/40 dark:bg-gaucho-blue-dark ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gaucho-blue text-sm font-bold text-gaucho-gold"
            aria-hidden
          >
            {APP_LOGO_INITIALS}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-lg font-bold tracking-tight text-gaucho-blue dark:text-white">
              {APP_NAME}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Degree planning & community
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            className="flex items-center gap-0.5 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-0.5 dark:border-gaucho-gold/20 dark:bg-gaucho-blue/30"
            aria-label="Main"
          >
            {NAV_LINKS.map(({ href, label, ...rest }) => {
              const accent = "accent" in rest ? rest.accent : undefined;
              const active =
                accent === "graduate"
                  ? isGraduateNavActive(pathname, href)
                  : accent === "grades"
                    ? isGradesNavActive(pathname, href)
                    : href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "rounded-md px-3.5 py-2 text-sm font-medium transition",
                    active
                      ? accent === "graduate"
                        ? "bg-violet-600 text-white"
                        : accent === "grades"
                          ? "bg-teal-600 text-white"
                          : "bg-gaucho-blue text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
                      : accent === "graduate"
                        ? "text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100"
                        : accent === "grades"
                          ? "text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
                          : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300 dark:hover:text-gaucho-gold-light",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <AuthControls initialAuth={initialAuth} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
