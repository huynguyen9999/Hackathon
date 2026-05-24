"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GeAreaExplorer } from "@/components/grades/GeAreaExplorer";
import { GradesCourseDetail } from "@/components/grades/GradesCourseDetail";
import { GradesLeaderboard } from "@/components/grades/GradesLeaderboard";
import { GradesResultsTable } from "@/components/grades/GradesResultsTable";
import { GradesSearchForm } from "@/components/grades/GradesSearchForm";
import type { GeAreaId, GeAreaInfo } from "@/lib/ucsb-ges-types";
import type { GeAreaCourse } from "@/lib/ucsb-ges-types";
import type {
  CourseGradeAggregate,
  GradesLeaderboards,
  GradesMeta,
  GradesSearchEntry,
} from "@/lib/ucsb-grades-types";
import { DAILY_NEXUS_GRADES_URL } from "@/lib/ucsb-grades-types";
import { buildGradesUrl, normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";

export type GradesHubProps = {
  initialMeta: GradesMeta;
  initialDepartments: string[];
  initialCourses: GradesSearchEntry[];
  initialCourseDetail: CourseGradeAggregate | null;
  initialGeAreas: GeAreaInfo[];
  initialGeCourses: GeAreaCourse[];
  initialLeaderboards: GradesLeaderboards;
  initialTab: "search" | "ge" | "leaderboards";
  initialDept: string;
  initialQuery: string;
  initialSort: "avgGpa" | "offerings" | "name";
  initialCourse: string | null;
  initialGeArea: GeAreaId | null;
  initialGeAreasForCourse?: GeAreaId[];
};

type TabId = "search" | "ge" | "leaderboards";

const TABS: { id: TabId; label: string }[] = [
  { id: "search", label: "Course search" },
  { id: "ge", label: "GE explorer" },
  { id: "leaderboards", label: "Leaderboards" },
];

export function GradesHub({
  initialMeta,
  initialDepartments,
  initialCourses,
  initialCourseDetail,
  initialGeAreas,
  initialGeCourses,
  initialLeaderboards,
  initialTab,
  initialDept,
  initialQuery,
  initialSort,
  initialCourse,
  initialGeArea,
  initialGeAreasForCourse = [],
}: GradesHubProps) {
  const router = useRouter();

  const [tab, setTab] = useState<TabId>(initialTab);
  const [dept, setDept] = useState(initialDept);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<"avgGpa" | "offerings" | "name">(initialSort);
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourse);
  const [courseDetail, setCourseDetail] = useState<CourseGradeAggregate | null>(
    initialCourseDetail,
  );
  const [geAreas] = useState(initialGeAreas);
  const [geArea, setGeArea] = useState<GeAreaId | null>(initialGeArea);
  const [geCourses, setGeCourses] = useState(initialGeCourses);
  const [leaderboards] = useState(initialLeaderboards);
  const [geAreasForCourse, setGeAreasForCourse] = useState<string[]>(
    initialGeAreasForCourse,
  );
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingGe, setLoadingGe] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const syncUrl = useCallback(
    (next: {
      tab: TabId;
      dept: string;
      query: string;
      sort: "avgGpa" | "offerings" | "name";
      course: string | null;
      area: GeAreaId | null;
    }) => {
      router.replace(
        buildGradesUrl({
          tab: next.tab,
          dept: next.dept || undefined,
          course: next.course ?? undefined,
          area: next.area ?? undefined,
          q: next.query || undefined,
          sort: next.sort,
        }),
        { scroll: false },
      );
    },
    [router],
  );

  const fetchSearch = useCallback(
    async (next: {
      dept: string;
      query: string;
      sort: "avgGpa" | "offerings" | "name";
    }) => {
      setLoadingSearch(true);
      try {
        const params = new URLSearchParams();
        if (next.dept) params.set("dept", next.dept);
        if (next.query.trim()) params.set("q", next.query.trim());
        params.set("sort", next.sort);
        const res = await fetch(`/api/ucsb/grades?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as { courses: GradesSearchEntry[] };
        setCourses(data.courses);
      } catch {
        setCourses([]);
      } finally {
        setLoadingSearch(false);
      }
    },
    [],
  );

  const fetchCourseDetail = useCallback(async (courseId: string) => {
    setLoadingDetail(true);
    try {
      const normalized = normalizeGradesCourseId(courseId);
      const [gradesRes, gesRes] = await Promise.all([
        fetch(`/api/ucsb/grades?course=${encodeURIComponent(normalized)}`),
        fetch(`/api/ucsb/ges?course=${encodeURIComponent(normalized)}`),
      ]);
      if (gradesRes.ok) {
        const detail = (await gradesRes.json()) as CourseGradeAggregate;
        setCourseDetail(detail);
        setSelectedCourseId(normalized);
      } else {
        setCourseDetail(null);
      }
      if (gesRes.ok) {
        const ges = (await gesRes.json()) as { areas: GeAreaId[] };
        setGeAreasForCourse(ges.areas ?? []);
      } else {
        setGeAreasForCourse([]);
      }
    } catch {
      setCourseDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const fetchGeCourses = useCallback(async (area: GeAreaId) => {
    setLoadingGe(true);
    try {
      const res = await fetch(`/api/ucsb/ges?area=${encodeURIComponent(area)}`);
      if (!res.ok) throw new Error("GE fetch failed");
      const data = (await res.json()) as { courses: GeAreaCourse[] };
      setGeCourses(data.courses ?? []);
    } catch {
      setGeCourses([]);
    } finally {
      setLoadingGe(false);
    }
  }, []);

  const handleTabChange = (nextTab: TabId) => {
    setTab(nextTab);
    syncUrl({ tab: nextTab, dept, query, sort, course: selectedCourseId, area: geArea });
  };

  const handleSearchChange = useCallback(
    (next: { dept: string; query: string; sort: "avgGpa" | "offerings" | "name" }) => {
      setDept(next.dept);
      setQuery(next.query);
      setSort(next.sort);
      syncUrl({
        tab: "search",
        dept: next.dept,
        query: next.query,
        sort: next.sort,
        course: selectedCourseId,
        area: geArea,
      });
      void fetchSearch(next);
    },
    [syncUrl, fetchSearch, selectedCourseId, geArea],
  );

  const handleSelectCourse = useCallback(
    (course: GradesSearchEntry | string) => {
      const courseId = typeof course === "string" ? course : course.courseId;
      setTab("search");
      void fetchCourseDetail(courseId);
      syncUrl({
        tab: "search",
        dept,
        query,
        sort,
        course: courseId,
        area: geArea,
      });
    },
    [fetchCourseDetail, syncUrl, dept, query, sort, geArea],
  );

  const handleGeAreaChange = (area: GeAreaId) => {
    setGeArea(area);
    setTab("ge");
    syncUrl({ tab: "ge", dept, query, sort, course: selectedCourseId, area });
    void fetchGeCourses(area);
  };

  const metaBanner = useMemo(
    () => (
      <div className="mb-6 rounded-lg border border-teal-500/25 bg-teal-50 px-4 py-3 dark:bg-teal-950/25">
        <p className="text-sm text-teal-900 dark:text-teal-100">
          {initialMeta.quarterRange.from}–{initialMeta.quarterRange.to} ·{" "}
          {initialMeta.courseCount.toLocaleString()} courses · Data from{" "}
          <a
            href={DAILY_NEXUS_GRADES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Daily Nexus Grades Search
          </a>{" "}
          ({initialMeta.attribution}). {initialMeta.disclaimer}
        </p>
      </div>
    ),
    [initialMeta],
  );

  return (
    <div className="space-y-6">
      {metaBanner}

      <div className="flex flex-wrap gap-1 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-1 dark:border-gaucho-gold/15 dark:bg-slate-800">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={[
              "rounded-md px-4 py-2 text-sm font-medium transition",
              tab === id
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "search" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="space-y-4">
            <GradesSearchForm
              departments={initialDepartments}
              dept={dept}
              query={query}
              sort={sort}
              onDeptChange={(d) =>
                handleSearchChange({ dept: d, query, sort })
              }
              onQueryChange={(q) =>
                handleSearchChange({ dept, query: q, sort })
              }
              onSortChange={(s) =>
                handleSearchChange({ dept, query, sort: s })
              }
            />
            {loadingSearch ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Searching…
              </p>
            ) : (
              <GradesResultsTable
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelect={(c) => handleSelectCourse(c)}
              />
            )}
          </div>
          <div>
            {loadingDetail ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading course…
              </p>
            ) : (
              <GradesCourseDetail course={courseDetail} geAreas={geAreasForCourse} />
            )}
          </div>
        </div>
      )}

      {tab === "ge" && (
        <GeAreaExplorer
          areas={geAreas}
          selectedArea={geArea}
          courses={geCourses}
          loading={loadingGe}
          onAreaChange={handleGeAreaChange}
          onSelectCourse={(courseId) => handleSelectCourse(courseId)}
        />
      )}

      {tab === "leaderboards" && (
        <GradesLeaderboard
          leaderboards={leaderboards}
          onSelectCourse={(courseId) => handleSelectCourse(courseId)}
        />
      )}
    </div>
  );
}
