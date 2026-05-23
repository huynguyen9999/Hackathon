"use client";

import { useEffect, useState } from "react";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  debounceMs?: number;
  defaultValue?: string;
  className?: string;
};

export function SearchBar({
  onSearch,
  debounceMs = 300,
  defaultValue = "",
  className = "",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="acadmap-search" className="sr-only">
        Search schools or majors
      </label>
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400/70"
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <input
        id="acadmap-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search schools or majors..."
        className="w-full rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 shadow-inner shadow-indigo-950/20 outline-none ring-0 transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/25"
        autoComplete="off"
      />
    </div>
  );
}
