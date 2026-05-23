import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { listGradPrograms } from "@/lib/ucsb-grad-programs";
import { buildCatalogUrl } from "@/lib/ucsb-curriculum-urls";
import { schoolHubHref } from "@/lib/ucsb-coe";

export const metadata = {
  title: "UCSB Graduate Programs | iGauchoBack",
  description:
    "MS and PhD program roadmaps for UCSB engineering departments with links to graduate course catalog.",
};

export default async function UcsbGraduateHubPage() {
  const programs = await listGradPrograms();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Schools", href: "/schools" },
          { label: "UCSB", href: schoolHubHref("ucsb") },
          { label: "Graduate programs" },
        ]}
        eyebrow="MS & PhD"
        title="UCSB graduate programs"
        description="Curated roadmaps for key engineering graduate tracks. Undergrad BS roadmaps remain under Engineering and Letters & Science."
        actions={
          <Link
            href="/schools/ucsb/courses?level=G"
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-800 transition hover:bg-violet-500/20 dark:text-violet-200"
          >
            Browse grad courses →
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <article
            key={program.slug}
            className="card-glow flex flex-col rounded-xl border border-gaucho-blue/20 bg-white p-6 dark:bg-gaucho-blue-dark/40"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-200">
                {program.degree}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {program.department}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gaucho-blue dark:text-white">
              {program.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/roadmap/ucsb/${program.slug}`}
                className="rounded-lg bg-gaucho-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-gaucho-blue-light dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
              >
                View roadmap
              </Link>
              <Link
                href={buildCatalogUrl({
                  subject: program.department,
                  level: "G",
                })}
                className="rounded-lg border border-gaucho-blue/25 px-4 py-2 text-sm font-medium text-gaucho-blue transition hover:border-gaucho-gold/40 dark:text-gaucho-gold"
              >
                Grad courses
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400">
        Undergrad roadmaps:{" "}
        <Link
          href="/schools/ucsb/engineering"
          className="text-gaucho-blue underline dark:text-gaucho-gold"
        >
          College of Engineering
        </Link>
      </p>
    </div>
  );
}
