"use client";

import { useCallback, useMemo, useState } from "react";

import { MajorCatalogGrid } from "@/components/MajorCatalogGrid";
import { SearchBar } from "@/components/SearchBar";
import type { UcsbMajor } from "@/lib/ucsb-types";

export type LsMajorCatalogProps = {
  majors: UcsbMajor[];
  getMajorHref: (majorSlug: string) => string;
};

export function LsMajorCatalog({ majors, getMajorHref }: LsMajorCatalogProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...majors].sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return sorted;

    const q = query.toLowerCase();
    return sorted.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.degree_type.toLowerCase().includes(q) ||
        m.slug.includes(q),
    );
  }, [majors, query]);

  const fullCount = majors.filter((m) => m.requirements_level === "full").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {filtered.length === majors.length
              ? `${majors.length} majors · sorted A–Z`
              : `${filtered.length} of ${majors.length} majors`}
            {fullCount > 0 && (
              <span className="text-slate-500">
                {" "}
                · {fullCount} with full requirements
              </span>
            )}
          </p>
        </div>
        <SearchBar
          onSearch={handleSearch}
          className="w-full sm:max-w-md"
          defaultValue=""
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-8 text-center text-sm text-slate-400">
          No majors match &ldquo;{query}&rdquo;. Try a different search term.
        </p>
      ) : (
        <MajorCatalogGrid
          majors={filtered}
          getMajorHref={getMajorHref}
          badgeLabel="Requirements"
          ctaLabel="View major requirements"
          showRequirementsLevel
        />
      )}
    </div>
  );
}
