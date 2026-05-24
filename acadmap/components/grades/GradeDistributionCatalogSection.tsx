"use client";

import { useEffect, useState } from "react";

import { GradeDistributionChart } from "@/components/grades/GradeDistributionChart";
import type { CourseGradeAggregate } from "@/lib/ucsb-grades-types";
import { buildGradesUrl, normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";
import { formatGpa } from "@/lib/ucsb-grades-utils";
import Link from "next/link";

export type GradeDistributionCatalogSectionProps = {
  courseId: string;
};

export function GradeDistributionCatalogSection({
  courseId,
}: GradeDistributionCatalogSectionProps) {
  const [detail, setDetail] = useState<CourseGradeAggregate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDetail(null);

    const normalized = normalizeGradesCourseId(courseId);
    void fetch(`/api/ucsb/grades?course=${encodeURIComponent(normalized)}`)
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as CourseGradeAggregate;
        setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <section className="mb-6">
        <p className="text-xs text-slate-500">Loading grade distribution…</p>
      </section>
    );
  }

  if (!detail) return null;

  return (
    <section className="mb-6 rounded-lg border border-teal-500/20 bg-teal-50/50 px-3 py-3 dark:bg-teal-950/20">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-200">
        Grade distribution
      </h3>
      <p className="mb-2 text-xs text-teal-900/90 dark:text-teal-100/90">
        Avg GPA {formatGpa(detail.rollup.avgGpa)} · {detail.rollup.offeringCount}{" "}
        quarters on record
      </p>
      <GradeDistributionChart counts={detail.rollup.gradeDistribution} compact />
      <Link
        href={buildGradesUrl({ course: detail.courseId })}
        className="mt-2 inline-block text-xs font-medium text-teal-800 underline dark:text-teal-200"
      >
        Full grade history →
      </Link>
    </section>
  );
}
