"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { SearchBar } from "@/components/SearchBar";
import type { RoadmapListItem } from "@/lib/types";

function roadmapHref(item: RoadmapListItem): string {
  return `/roadmap/${item.school.short_name}/${item.major.slug}`;
}

export type ExploreCatalogProps = {
  roadmaps: RoadmapListItem[];
};

export function ExploreCatalog({ roadmaps }: ExploreCatalogProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return roadmaps;
    const lower = query.toLowerCase();
    return roadmaps.filter((r) => {
      const haystack = [
        r.school.short_name,
        r.school.name,
        r.school.location,
        r.major.name,
        r.major.degree_type,
        r.major.slug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(lower);
    });
  }, [roadmaps, query]);

  return (
    <>
      <SearchBar
        onSearch={handleSearch}
        className="mx-auto mb-10 max-w-xl"
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-100 dark:bg-slate-900/40 py-16 text-center text-sm text-slate-600 dark:text-slate-400">
          No roadmaps match &ldquo;{query}&rdquo;. Try another school or major.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={roadmapHref(item)}
                className="card-glow group flex h-full flex-col rounded-2xl border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 p-5 transition hover:border-gaucho-gold/40 hover:bg-white/95 dark:bg-slate-900/90"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-gaucho-blue-light/20 px-2.5 py-1 font-mono text-xs font-semibold uppercase text-gaucho-blue dark:text-gaucho-gold-light ring-1 ring-gaucho-blue-light/25">
                    {item.school.short_name}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    {item.status}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 group-hover:text-gaucho-blue-dark dark:text-gaucho-gold-light">
                  {item.major.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {item.major.degree_type}
                  {item.school.location ? ` · ${item.school.location}` : ""}
                </p>
                <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold transition group-hover:gap-2 group-hover:text-gaucho-blue dark:text-gaucho-gold-light">
                  Open roadmap
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
