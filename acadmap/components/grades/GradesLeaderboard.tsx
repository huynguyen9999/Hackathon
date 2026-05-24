"use client";

import Link from "next/link";

import type { GradesLeaderboardEntry, GradesLeaderboards } from "@/lib/ucsb-grades-types";
import { formatGpa } from "@/lib/ucsb-grades-utils";

export type GradesLeaderboardProps = {
  leaderboards: GradesLeaderboards;
  onSelectCourse: (courseId: string) => void;
};

function LeaderboardColumn({
  title,
  subtitle,
  entries,
  onSelectCourse,
}: {
  title: string;
  subtitle: string;
  entries: GradesLeaderboardEntry[];
  onSelectCourse: (courseId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gaucho-blue-light/25 bg-white dark:border-gaucho-gold/20 dark:bg-slate-900/60">
      <header className="border-b border-gaucho-blue-light/15 px-4 py-3">
        <h3 className="text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
      </header>
      <ol className="divide-y divide-gaucho-blue-light/10">
        {entries.map((entry, i) => (
          <li key={entry.courseId}>
            <button
              type="button"
              onClick={() => onSelectCourse(entry.courseId)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span className="w-5 shrink-0 text-xs font-bold text-slate-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-xs font-semibold text-gaucho-blue dark:text-gaucho-gold">
                  {entry.courseId}
                </span>
                <span className="text-[10px] text-slate-500">
                  {entry.offeringCount} offerings · {entry.totalStudents.toLocaleString()} students
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm text-slate-700 dark:text-slate-300">
                {formatGpa(entry.avgGpa)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GradesLeaderboard({
  leaderboards,
  onSelectCourse,
}: GradesLeaderboardProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Rankings use enrollment-weighted average GPA from Daily Nexus data (undergraduate
        courses with sufficient enrollment).{" "}
        <Link
          href="https://dailynexus.com/interactives/grades/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gaucho-blue underline dark:text-gaucho-gold"
        >
          See methodology on Daily Nexus
        </Link>
        .
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        <LeaderboardColumn
          title="Highest avg GPA"
          subtitle="Top undergraduate courses"
          entries={leaderboards.highestGpa}
          onSelectCourse={onSelectCourse}
        />
        <LeaderboardColumn
          title="Lowest avg GPA"
          subtitle="Challenging courses"
          entries={leaderboards.lowestGpa}
          onSelectCourse={onSelectCourse}
        />
        <LeaderboardColumn
          title="Most offered"
          subtitle="Frequently scheduled"
          entries={leaderboards.mostOffered}
          onSelectCourse={onSelectCourse}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Click a course to open its full grade history in the search tab.
      </p>
    </div>
  );
}
