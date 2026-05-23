"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  GradDepartment,
  GradDivision,
} from "@/lib/ucsb-grad-programs-types";
import { getDepartmentRoadmapSlugs } from "@/lib/ucsb-grad-utils";
import { buildCatalogUrl } from "@/lib/ucsb-curriculum-urls";

export type GradDepartmentIndexProps = {
  divisions: GradDivision[];
  departmentsByDivision: Record<string, GradDepartment[]>;
};

export function GradDepartmentIndex({
  divisions,
  departmentsByDivision,
}: GradDepartmentIndexProps) {
  const [query, setQuery] = useState("");
  const [activeDivision, setActiveDivision] = useState<string>(
    divisions[0]?.id ?? "engineering",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = departmentsByDivision[activeDivision] ?? [];
    if (!q) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.subjectCode ?? "").toLowerCase().includes(q) ||
        d.degrees.some((deg) => deg.toLowerCase().includes(q)),
    );
  }, [activeDivision, departmentsByDivision, query]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            All graduate departments
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Official Graduate Division index — roadmaps where we have them.
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments…"
          className="w-full max-w-xs rounded-lg border border-gaucho-blue/20 bg-white px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-1 dark:border-gaucho-gold/15 dark:bg-slate-800/50">
        {divisions.map((div) => (
          <button
            key={div.id}
            type="button"
            onClick={() => setActiveDivision(div.id)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              activeDivision === div.id
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300 dark:hover:text-gaucho-gold-light",
            ].join(" ")}
          >
            {div.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gaucho-blue-light/25 dark:border-gaucho-gold/20">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gaucho-blue-light/20 bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/40">
            <tr>
              <th className="px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold">
                Department
              </th>
              <th className="hidden px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold sm:table-cell">
                Degrees
              </th>
              <th className="px-4 py-3 font-semibold text-gaucho-blue dark:text-gaucho-gold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No departments match your search.
                </td>
              </tr>
            ) : (
              filtered.map((dept) => {
                const roadmapSlugs = getDepartmentRoadmapSlugs(dept);
                return (
                  <tr
                    key={`${dept.division}-${dept.name}`}
                    className="border-b border-gaucho-blue-light/10 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {dept.name}
                      </p>
                      {dept.subjectCode && (
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          {dept.subjectCode}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                        {dept.degrees.map((deg) => (
                          <span
                            key={deg}
                            className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-200"
                          >
                            {deg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {dept.degrees.map((deg) => (
                          <span
                            key={deg}
                            className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-200"
                          >
                            {deg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {roadmapSlugs.map((slug) => (
                          <Link
                            key={slug}
                            href={`/roadmap/ucsb/${slug}`}
                            className="rounded-md bg-gaucho-blue px-2.5 py-1 text-xs font-medium text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
                          >
                            Roadmap
                          </Link>
                        ))}
                        {dept.subjectCode && (
                          <Link
                            href={buildCatalogUrl({
                              subject: dept.subjectCode,
                              level: "G",
                            })}
                            className="rounded-md border border-gaucho-blue/25 px-2.5 py-1 text-xs font-medium text-gaucho-blue dark:text-gaucho-gold"
                          >
                            Courses
                          </Link>
                        )}
                        <a
                          href={dept.graddiv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-slate-300/50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                        >
                          Official ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
