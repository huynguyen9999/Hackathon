import Link from "next/link";

const FEATURES = [
  {
    title: "Visual prerequisites",
    description:
      "See how courses connect—prerequisites, recommendations, and parallel paths at a glance.",
  },
  {
    title: "Career outcomes",
    description:
      "Trace from capstone courses to roles like hardware, firmware, and ASIC design.",
  },
  {
    title: "Community driven",
    description:
      "Browse seed roadmaps today; contribute your program and vote on the best maps.",
  },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-gaucho-blue/10 bg-white dark:border-gaucho-gold/10 dark:bg-gaucho-blue-dark/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-gaucho-gold-dark dark:text-gaucho-gold">
            UC Santa Barbara
          </p>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gaucho-blue sm:text-5xl dark:text-white">
            Your degree,{" "}
            <span className="text-gaucho-gold-dark dark:text-gaucho-gold">
              mapped.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Course requirements, prerequisites, and graduation plans from official
            UCSB sources—Engineering GEAR, L&S LASAR, and CCS major sheets.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-primary">
              Explore roadmaps
            </Link>
            <Link href="/schools/ucsb" className="btn-secondary">
              UCSB colleges
            </Link>
            <Link
              href="/roadmap/ucsb/electrical-engineering"
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-gaucho-blue hover:underline dark:text-slate-400 dark:hover:text-gaucho-gold"
            >
              EE sample graph
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
          Colleges
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/schools/ucsb/engineering"
            className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/15 bg-white p-5 transition hover:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue-light">
              Engineering
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              CoE · GEAR 2025-26
            </h3>
            <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
              5 BS majors · EE interactive roadmap
            </p>
            <span className="mt-3 text-sm font-medium text-gaucho-blue group-hover:text-gaucho-blue-light dark:text-gaucho-gold">
              View majors →
            </span>
          </Link>
          <Link
            href="/schools/ucsb/letters-science"
            className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/15 bg-white p-5 transition hover:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue-light">
              Letters & Science
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              L&S · LASAR + DUELS
            </h3>
            <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
              58+ majors · department requirements
            </p>
            <span className="mt-3 text-sm font-medium text-gaucho-blue group-hover:text-gaucho-blue-light dark:text-gaucho-gold">
              View majors →
            </span>
          </Link>
          <Link
            href="/schools/ucsb/creative-studies"
            className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/15 bg-white p-5 transition hover:border-gaucho-blue/30 dark:bg-gaucho-blue-dark/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue-light">
              Creative Studies
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              CCS · 9 majors
            </h3>
            <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
              Major sheets, admission reqs, 4-year plans
            </p>
            <span className="mt-3 text-sm font-medium text-gaucho-blue group-hover:text-gaucho-blue-light dark:text-gaucho-gold">
              View majors →
            </span>
          </Link>
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
