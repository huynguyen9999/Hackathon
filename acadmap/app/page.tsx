import Link from "next/link";

const FEATURES = [
  {
    title: "Visual prerequisites",
    description:
      "See how courses connect—prerequisites, recommendations, and parallel paths at a glance.",
    icon: "◇",
  },
  {
    title: "Career outcomes",
    description:
      "Trace from capstone courses to roles like hardware, firmware, and ASIC design.",
    icon: "◆",
  },
  {
    title: "Community driven",
    description:
      "Browse seed roadmaps today; contribute your program and vote on the best maps.",
    icon: "○",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-200">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Hackathon-ready · JSON seeds + Supabase
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-gradient-brand">Your degree,</span>
          <br />
          <span className="text-slate-100">mapped.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
          AcadMap turns sprawling catalogs into interactive graphs—courses,
          prerequisites, and where they can take you.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/explore"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500"
          >
            Explore roadmaps
          </Link>
          <Link
            href="/roadmap/ucsb/electrical-engineering"
            className="rounded-xl border border-indigo-500/40 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:border-violet-400/50 hover:bg-slate-800/80"
          >
            View UCSB EE sample
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-indigo-300/80">
          Why AcadMap
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="card-glow rounded-2xl border border-indigo-500/20 bg-slate-900/50 p-6 transition hover:border-violet-400/30 hover:bg-slate-900/70"
            >
              <span
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-lg text-violet-300 ring-1 ring-indigo-400/30"
                aria-hidden
              >
                {feature.icon}
              </span>
              <h3 className="text-lg font-semibold text-slate-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
