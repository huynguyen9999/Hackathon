"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControls } from "@/components/AuthControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_LOGO_INITIALS, APP_NAME } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schools", label: "Schools" },
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
] as const;

export type NavbarProps = {
  className?: string;
};

export function Navbar({ className = "" }: NavbarProps) {
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
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "rounded-md px-3.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-gaucho-blue text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
                      : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300 dark:hover:text-gaucho-gold-light",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <AuthControls />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
