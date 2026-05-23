"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
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
      className={`border-b border-indigo-500/20 bg-white/90 backdrop-blur-md dark:bg-slate-950/90 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex flex-col gap-0.5">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-200 dark:to-purple-300">
            AcadMap
          </span>
          <span className="text-xs font-medium text-slate-500 transition group-hover:text-slate-600 dark:group-hover:text-slate-400">
            Navigate your degree with clarity
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            className="flex items-center gap-1 rounded-xl border border-indigo-500/20 bg-white p-1 dark:bg-slate-900/60"
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
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-indigo-600/20 text-indigo-800 ring-1 ring-indigo-400/30 dark:bg-indigo-600/30 dark:text-indigo-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
