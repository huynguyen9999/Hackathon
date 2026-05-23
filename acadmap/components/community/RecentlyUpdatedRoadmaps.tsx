import Link from "next/link";

import type { RecentRoadmap } from "@/lib/community/types";

export type RecentlyUpdatedRoadmapsProps = {
  roadmaps: RecentRoadmap[];
};

export function RecentlyUpdatedRoadmaps({ roadmaps }: RecentlyUpdatedRoadmapsProps) {
  if (roadmaps.length === 0) return null;

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/40">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Recently updated roadmaps
      </h2>
      <ul className="mt-4 space-y-2">
        {roadmaps.slice(0, 5).map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-gaucho-blue/5 dark:hover:bg-gaucho-blue/30"
            >
              <span className="font-medium text-gaucho-blue dark:text-gaucho-gold">
                {r.major_name}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(r.updated_at).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
