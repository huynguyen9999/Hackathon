"use client";

import { useEffect, useState } from "react";

import { GradeDistributionSummary } from "@/components/grades/GradesCourseDetail";
import type { CourseGradeAggregate } from "@/lib/ucsb-grades-types";
import { normalizeGradesCourseId } from "@/lib/ucsb-grades-urls";

export type GradeDistributionSidebarSectionProps = {
  courseLabel: string;
};

export function GradeDistributionSidebarSection({
  courseLabel,
}: GradeDistributionSidebarSectionProps) {
  const [detail, setDetail] = useState<CourseGradeAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    setDetail(null);

    const courseId = normalizeGradesCourseId(courseLabel);
    void fetch(`/api/ucsb/grades?course=${encodeURIComponent(courseId)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setMissing(true);
          return;
        }
        const data = (await res.json()) as CourseGradeAggregate;
        setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseLabel]);

  if (loading) {
    return (
      <section className="mb-6 rounded-lg border border-teal-500/20 bg-teal-50/50 px-3 py-2.5 dark:bg-teal-950/10">
        <p className="text-xs text-teal-800 dark:text-teal-200">
          Loading grade data…
        </p>
      </section>
    );
  }

  if (missing || !detail) {
    return null;
  }

  return (
    <GradeDistributionSummary
      courseId={detail.courseId}
      avgGpa={detail.rollup.avgGpa}
      offeringCount={detail.rollup.offeringCount}
      gradeDistribution={detail.rollup.gradeDistribution}
    />
  );
}
