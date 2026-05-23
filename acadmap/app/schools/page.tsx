import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { loadCoeCatalog } from "@/lib/school-catalog";
import { coeCollegeHubHref } from "@/lib/ucsb-coe";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import { listActiveSchools } from "@/lib/schools/registry";

export const metadata = {
  title: "Schools | iGauchoBack",
  description: "Browse degree planning hubs for universities across the US.",
};

export default async function SchoolsIndexPage() {
  const schools = await listActiveSchools();

  const cards = await Promise.all(
    schools.map(async (school) => {
      let majorCount = 0;
      let liveGraphs = 0;

      for (const college of school.colleges) {
        if (college.catalogType === "coe") {
          const coe = await loadCoeCatalog(school.short_name);
          majorCount += coe?.majors.length ?? 0;
          liveGraphs += coe?.majors.filter((m) => m.roadmap_available).length ?? 0;
        } else if (college.catalogType === "ls" && school.short_name === "ucsb") {
          const ls = await loadUcsbLsCatalog();
          majorCount += ls?.majors.length ?? 0;
          liveGraphs += ls?.majors.filter((m) => m.roadmap_available).length ?? 0;
        } else if (college.catalogType === "ccs" && school.short_name === "ucsb") {
          const ccs = await loadUcsbCcsCatalog();
          majorCount += ccs?.majors.length ?? 0;
        }
      }

      return { school, majorCount, liveGraphs };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Schools" }]}
        title="School hubs"
        description="Pick your university to explore community features, major catalogs, and interactive roadmaps."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {cards.map(({ school, majorCount, liveGraphs }) => (
          <Link
            key={school.short_name}
            href={`/schools/${school.short_name}`}
            className="card-glow group rounded-xl border border-gaucho-blue/20 bg-white p-8 transition hover:border-gaucho-gold/40 dark:bg-gaucho-blue-dark/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
              {school.location}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gaucho-blue dark:text-white group-hover:text-gaucho-gold">
              {school.name}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {school.colleges.length} college
              {school.colleges.length !== 1 ? "s" : ""} · {majorCount} majors cataloged
              {liveGraphs > 0
                ? ` · ${liveGraphs} live roadmap${liveGraphs !== 1 ? "s" : ""}`
                : ""}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-gaucho-blue dark:text-gaucho-gold">
              Open hub →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
