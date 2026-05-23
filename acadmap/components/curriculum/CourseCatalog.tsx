"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CourseDetailPanel } from "@/components/curriculum/CourseDetailPanel";
import { CourseResultsTable } from "@/components/curriculum/CourseResultsTable";
import { CourseSearchForm } from "@/components/curriculum/CourseSearchForm";
import type {
  UcsbCourseLevel,
  UcsbCoursePrimary,
  UcsbCourseSearchResult,
  UcsbQuarter,
  UcsbSubject,
} from "@/lib/ucsb-curriculum-types";

type CatalogMeta = {
  subjects: UcsbSubject[];
  quarters: UcsbQuarter[];
  defaultQuarter: string;
};

export type CourseCatalogProps = {
  initialMeta: CatalogMeta;
  initialResult: UcsbCourseSearchResult;
  initialQuery: string;
};

function formatFetchedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function CourseCatalog({
  initialMeta,
  initialResult,
  initialQuery,
}: CourseCatalogProps) {
  const router = useRouter();

  const [quarter, setQuarter] = useState(initialResult.quarter);
  const [subject, setSubject] = useState(initialResult.subjectCode);
  const [level, setLevel] = useState<UcsbCourseLevel>(initialResult.level);
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [selected, setSelected] = useState<UcsbCoursePrimary | null>(
    initialResult.courses[0] ?? null,
  );
  const [loading, setLoading] = useState(false);

  const syncUrl = useCallback(
    (next: {
      quarter: string;
      subject: string;
      level: UcsbCourseLevel;
      query: string;
    }) => {
      const params = new URLSearchParams();
      params.set("quarter", next.quarter);
      params.set("subject", next.subject);
      params.set("level", next.level);
      if (next.query.trim()) params.set("q", next.query.trim());
      router.replace(`/schools/ucsb/courses?${params.toString()}`, {
        scroll: false,
      });
    },
    [router],
  );

  const fetchCourses = useCallback(
    async (next: {
      quarter: string;
      subject: string;
      level: UcsbCourseLevel;
      query: string;
    }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          quarter: next.quarter,
          subject: next.subject,
          level: next.level,
        });
        if (next.query.trim()) params.set("q", next.query.trim());

        const response = await fetch(`/api/ucsb/courses?${params.toString()}`);
        if (!response.ok) throw new Error("Search failed");

        const data = (await response.json()) as UcsbCourseSearchResult;
        setResult(data);
        setSelected(data.courses[0] ?? null);
      } catch {
        setResult((prev) => ({ ...prev, courses: [], totalCount: 0 }));
        setSelected(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const applyFilters = useCallback(
    (next: {
      quarter: string;
      subject: string;
      level: UcsbCourseLevel;
      query: string;
    }) => {
      syncUrl(next);
      void fetchCourses(next);
    },
    [syncUrl, fetchCourses],
  );

  const stalenessBanner = useMemo(() => {
    if (result.source === "live") {
      return "Live data from UCSB Developer API (cached up to 24 hours).";
    }
    return `Snapshot data from ${formatFetchedAt(result.fetchedAt)} — may be up to 24 hours behind GOLD.`;
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        {stalenessBanner}
      </div>

      <CourseSearchForm
        subjects={initialMeta.subjects}
        quarters={initialMeta.quarters}
        quarter={quarter}
        subject={subject}
        level={level}
        query={query}
        onQuarterChange={(qtr) => {
          setQuarter(qtr);
          applyFilters({ quarter: qtr, subject, level, query });
        }}
        onSubjectChange={(sub) => {
          setSubject(sub);
          applyFilters({ quarter, subject: sub, level, query });
        }}
        onLevelChange={(lvl) => {
          setLevel(lvl);
          applyFilters({ quarter, subject, level: lvl, query });
        }}
        onQueryChange={(q) => {
          setQuery(q);
          applyFilters({ quarter, subject, level, query: q });
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {loading
            ? "Searching…"
            : `${result.totalCount} course${result.totalCount === 1 ? "" : "s"} · ${result.subjectCode} · ${result.level === "G" ? "Graduate" : result.level === "U" ? "Undergraduate" : "All levels"}`}
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {result.source}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <CourseResultsTable
          courses={result.courses}
          selectedCourseId={selected?.courseId ?? null}
          onSelect={setSelected}
        />
        <CourseDetailPanel course={selected} />
      </div>
    </div>
  );
}
