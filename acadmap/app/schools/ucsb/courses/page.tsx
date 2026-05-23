import Link from "next/link";
import { Suspense } from "react";

import { CourseCatalog } from "@/components/curriculum/CourseCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getDefaultQuarter,
  listQuarters,
  listSubjects,
  searchCourses,
  OFFICIAL_COURSE_SEARCH_URL,
} from "@/lib/ucsb-curriculum";
import type { UcsbCourseLevel } from "@/lib/ucsb-curriculum-types";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  searchParams: {
    quarter?: string;
    subject?: string;
    level?: string;
    q?: string;
  };
};

function parseLevel(raw: string | undefined): UcsbCourseLevel {
  const v = raw?.toUpperCase();
  if (v === "U" || v === "G" || v === "A") return v;
  return "A";
}

export const metadata = {
  title: "UCSB Course Catalog | iGauchoBack",
  description:
    "Search UCSB undergraduate and graduate courses by subject, quarter, and level.",
};

export default async function UcsbCoursesPage({ searchParams }: PageProps) {
  const [subjects, quarters] = await Promise.all([
    listSubjects(),
    listQuarters(),
  ]);
  const defaultQuarter = getDefaultQuarter(quarters);

  const quarter = searchParams.quarter ?? defaultQuarter;
  const subject = searchParams.subject?.toUpperCase() ?? "ECE";
  const level = parseLevel(searchParams.level);
  const query = searchParams.q ?? "";

  const initialResult = await searchCourses(
    { quarter, subjectCode: subject, level },
    { query: query || undefined },
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Schools", href: "/schools" },
          { label: "UCSB", href: schoolHubHref("ucsb") },
          { label: "Course catalog" },
        ]}
        eyebrow="Curriculum search"
        title="UCSB course catalog"
        description="Browse undergraduate and graduate offerings by subject and quarter — faster filtering than the official ASPX page, with deep links from roadmaps."
        actions={
          <Link
            href="/schools/ucsb/graduate"
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-800 transition hover:bg-violet-500/20 dark:text-violet-200"
          >
            Graduate programs →
          </Link>
        }
      />

      {level === "G" && (
        <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-50 px-4 py-3 dark:bg-violet-950/30">
          <p className="text-sm text-violet-900 dark:text-violet-100">
            Exploring graduate-level courses?{" "}
            <Link
              href="/schools/ucsb/graduate"
              className="font-semibold underline underline-offset-2"
            >
              View MS/PhD program roadmaps and the full department index
            </Link>
            .
          </p>
        </div>
      )}

      <Suspense
        fallback={
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading catalog…
          </p>
        }
      >
        <CourseCatalog
          initialMeta={{ subjects, quarters, defaultQuarter }}
          initialResult={initialResult}
          initialQuery={query}
        />
      </Suspense>

      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        Official source:{" "}
        <a
          href={OFFICIAL_COURSE_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gaucho-blue underline dark:text-gaucho-gold"
        >
          UCSB Curriculum Search
        </a>
      </p>
    </div>
  );
}
