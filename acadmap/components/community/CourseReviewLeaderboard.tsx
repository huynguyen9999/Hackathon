"use client";

import { CourseReviewForm } from "@/components/community/CourseReviewForm";
import { useCommunitySession } from "@/components/community/useCommunitySession";
import type { CourseReviewLeaderboardEntry } from "@/lib/community/types";

export type CourseReviewLeaderboardProps = {
  schoolShortName: string;
  entries: CourseReviewLeaderboardEntry[];
};

export function CourseReviewLeaderboard({
  schoolShortName,
  entries,
}: CourseReviewLeaderboardProps) {
  const session = useCommunitySession();

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Most-reviewed courses
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Leaderboard by review count and rating.
      </p>
      <ol className="mt-4 space-y-2">
        {entries.slice(0, 6).map((e, i) => (
          <li
            key={e.course_code}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-gaucho-blue/20"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold text-gaucho-gold-dark dark:text-gaucho-gold">
                #{i + 1}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {e.course_code}
              </span>
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {e.rating}/5 · diff {e.difficulty}/5 · {e.review_count} reviews
            </span>
          </li>
        ))}
      </ol>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
      ) : null}
      {session.signedIn ? (
        <CourseReviewForm schoolShortName={schoolShortName} />
      ) : null}
    </section>
  );
}
