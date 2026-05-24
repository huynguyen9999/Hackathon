import Link from "next/link";
import { Suspense } from "react";

import { GradesHub } from "@/components/grades/GradesHub";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCoursesForArea, getGeAreasForCourse, listGeAreas } from "@/lib/ucsb-ges";
import type { GeAreaId } from "@/lib/ucsb-ges-types";
import { GE_AREA_IDS } from "@/lib/ucsb-ges-types";
import {
  getCourseGrades,
  getGradesMeta,
  getLeaderboards,
  listGradeDepartments,
  searchGrades,
} from "@/lib/ucsb-grades";
import { normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";
import { DAILY_NEXUS_GRADES_URL } from "@/lib/ucsb-grades-types";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  searchParams: {
    tab?: string;
    course?: string;
    dept?: string;
    q?: string;
    sort?: string;
    area?: string;
  };
};

function parseTab(raw: string | undefined): "search" | "ge" | "leaderboards" {
  if (raw === "ge" || raw === "leaderboards") return raw;
  return "search";
}

function parseSort(raw: string | undefined): "avgGpa" | "offerings" | "name" {
  if (raw === "avgGpa" || raw === "offerings") return raw;
  return "name";
}

function parseArea(raw: string | undefined): GeAreaId | null {
  if (!raw) return null;
  return GE_AREA_IDS.includes(raw as GeAreaId) ? (raw as GeAreaId) : null;
}

export const metadata = {
  title: "UCSB Grade Distributions | iGauchoBack",
  description:
    "Search UCSB grade distributions, explore GE requirements, and compare course GPAs from Daily Nexus open data.",
};

export default async function UcsbGradesPage({ searchParams }: PageProps) {
  const tab = parseTab(searchParams.tab);
  const dept = searchParams.dept?.toUpperCase() ?? "";
  const query = searchParams.q ?? "";
  const sort = parseSort(searchParams.sort);
  const courseParam = searchParams.course
    ? normalizeGradesCourseId(searchParams.course)
    : null;
  const geArea = parseArea(searchParams.area);

  const [meta, departments, courses, courseDetail, geAreas, leaderboards, initialGeAreasForCourse] =
    await Promise.all([
      getGradesMeta(),
      listGradeDepartments(),
      searchGrades({ q: query || undefined, dept: dept || undefined, sort, limit: 200 }),
      courseParam ? getCourseGrades(courseParam) : Promise.resolve(null),
      listGeAreas(),
      getLeaderboards(),
      courseParam ? getGeAreasForCourse(courseParam) : Promise.resolve([]),
    ]);

  const initialGeCourses = geArea ? await getCoursesForArea(geArea) : [];

  if (!meta || !leaderboards) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-600">Grade data is not available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Schools", href: "/schools" },
          { label: "UCSB", href: schoolHubHref("ucsb") },
          { label: "Grade distributions" },
        ]}
        eyebrow="Student essentials"
        title="UCSB grade distributions & GE explorer"
        description="Search historical grade data by course, explore which classes fulfill GE areas, and browse GPA leaderboards — powered by Daily Nexus open registrar data."
        actions={
          <Link
            href="/schools/ucsb/courses"
            className="rounded-lg border border-gaucho-blue/30 bg-gaucho-blue/5 px-3 py-1.5 text-xs font-medium text-gaucho-blue transition hover:bg-gaucho-blue/10 dark:text-gaucho-gold"
          >
            Course catalog →
          </Link>
        }
      />

      <Suspense
        fallback={
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading grades hub…
          </p>
        }
      >
        <GradesHub
          initialMeta={meta}
          initialDepartments={departments}
          initialCourses={courses}
          initialCourseDetail={courseDetail}
          initialGeAreas={geAreas}
          initialGeCourses={initialGeCourses}
          initialLeaderboards={leaderboards}
          initialTab={tab}
          initialDept={dept}
          initialQuery={query}
          initialSort={sort}
          initialCourse={courseParam}
          initialGeArea={geArea}
          initialGeAreasForCourse={initialGeAreasForCourse}
        />
      </Suspense>

      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        Official interactive:{" "}
        <a
          href={DAILY_NEXUS_GRADES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gaucho-blue underline dark:text-gaucho-gold"
        >
          Daily Nexus Grades Search
        </a>
      </p>
    </div>
  );
}
