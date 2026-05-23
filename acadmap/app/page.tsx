import Link from "next/link";

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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
          School hubs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {schools.map((school) => (
            <Link
              key={school.short_name}
              href={`/schools/${school.short_name}`}
              className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/15 bg-white p-6 transition hover:border-gaucho-gold/40 dark:bg-gaucho-blue-dark/50"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue-light dark:text-gaucho-gold">
                {school.location}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {school.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {school.colleges.map((c) => c.label).join(" · ")}
              </p>
              <span className="mt-4 text-sm font-medium text-gaucho-blue group-hover:text-gaucho-gold dark:text-gaucho-gold">
                Open community hub →
              </span>
            </Link>
          ))}
        </div>
      </section>

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
