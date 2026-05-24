import Link from "next/link";

import { SchoolHubSection } from "@/components/SchoolHubSection";
import { listActiveSchools } from "@/lib/schools/registry";

const FEATURES = [
  {
    title: "Visual prerequisites",
    description:
      "See how courses connect—prerequisites, recommendations, and parallel paths at a glance.",
  },
  {
    title: "School community hubs",
    description:
      "Ask questions, read course reviews, and see where alumni landed—scoped to your campus.",
  },
  {
    title: "Community driven",
    description:
      "Browse seed roadmaps today; contribute your program and vote on the best maps.",
  },
] as const;

export default async function HomePage() {
  const schools = await listActiveSchools();

  return (
    <div>
      <section className="border-b border-gaucho-blue/10 bg-white dark:border-gaucho-gold/10 dark:bg-gaucho-blue-dark/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-gaucho-gold-dark dark:text-gaucho-gold">
            Degree planning for every campus
          </p>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gaucho-blue sm:text-5xl dark:text-white">
            Your degree,{" "}
            <span className="text-gaucho-gold-dark dark:text-gaucho-gold">
              mapped.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Official requirements, interactive roadmaps, and student community hubs—
            one stop shop for planning your major.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-primary">
              Explore roadmaps
            </Link>
            <Link href="/schools" className="btn-secondary">
              Browse schools
            </Link>
            <Link
              href="/roadmap/ucla/computer-science"
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-gaucho-blue hover:underline dark:text-slate-400 dark:hover:text-gaucho-gold"
            >
              UCLA CS sample graph
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-teal-500/20 bg-gradient-to-r from-teal-50 to-white dark:from-teal-950/30 dark:to-gaucho-blue-dark/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
              UCSB Grades
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gaucho-blue dark:text-white">
              Compare course GPAs before you enroll
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Daily Nexus open data · GE explorer · instructor history
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/schools/ucsb/grades"
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Grade search
            </Link>
            <Link
              href="/schools/ucsb/grades?tab=ge"
              className="rounded-lg border border-teal-500/30 px-4 py-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-500/10 dark:text-teal-200"
            >
              GE explorer
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-violet-500/20 bg-gradient-to-r from-violet-50 to-white dark:from-violet-950/30 dark:to-gaucho-blue-dark/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-200">
              UCSB Graduate
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gaucho-blue dark:text-white">
              Planning MS or PhD at UCSB?
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              50+ departments · 5 interactive CoE roadmaps · grad course catalog
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/schools/ucsb/graduate"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              Graduate hub
            </Link>
            <Link
              href="/schools/ucsb/courses?level=G"
              className="rounded-lg border border-violet-500/30 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-500/10 dark:text-violet-200"
            >
              Browse grad courses
            </Link>
          </div>
        </div>
      </section>

      <SchoolHubSection
        variant="home"
        schools={schools.map((school) => ({
          short_name: school.short_name,
          name: school.name,
          location: school.location,
          collegesLabel: school.colleges.map((c) => c.label).join(" · "),
        }))}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
          Why iGauchoBack
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="rounded-lg border border-gaucho-blue/10 bg-white p-5 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30"
            >
              <h3 className="text-base font-semibold text-gaucho-blue dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
