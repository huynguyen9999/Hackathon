import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { LsFrameworkCard } from "@/components/LsFrameworkCard";
import { LsMajorCatalog } from "@/components/LsMajorCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceList } from "@/components/SourceList";
import {
  loadUcsbLsCatalog,
  lsCollegeHubHref,
} from "@/lib/ucsb-ls";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Letters & Science | iGauchoBack" };
  }
  const catalog = await loadUcsbLsCatalog();
  return {
    title: `${catalog?.school.college ?? "L&S"} | iGauchoBack`,
    description: `Browse ${catalog?.majors.length ?? 0} L&S majors at UC Santa Barbara (LASAR + DUELS).`,
  };
}

export default async function LettersScienceHubPage({ params }: PageProps) {
  const { school } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbLsCatalog();
  if (!catalog) {
    notFound();
  }

  const shortName = catalog.school.short_name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          {
            label: shortName.toUpperCase(),
            href: schoolHubHref(shortName),
          },
          { label: "Letters & Science" },
        ]}
        eyebrow="College of Letters & Science"
        title={catalog.college.name}
        description="Major prep and upper-division requirements from department sites, DUELS, and UCSB Admissions—plus LASAR college-wide rules."
      />

      <div className="space-y-12">
        <CollegeBanner variant="letters-science" lsCatalog={catalog} />

        <section className="card-glow rounded-2xl border border-gaucho-blue/25 bg-gradient-to-br from-slate-900/90 via-gaucho-blue-dark/30 to-slate-900/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/90">
            {catalog.school.name}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
            {catalog.school.college}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{catalog.school.location}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-lg border border-gaucho-blue/30 bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 text-xs text-gaucho-blue dark:text-gaucho-gold-light">
              {catalog.majors.length} majors in catalog
            </span>
            <span className="rounded-lg border border-slate-300 dark:border-slate-600/40 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
              Updated {catalog.last_updated}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={catalog.college.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gaucho-blue/40 px-4 py-2 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold-light transition hover:bg-gaucho-blue/5"
            >
              L&S college site ↗
            </Link>
            <Link
              href={catalog.college.admissions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 dark:border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              Admissions majors ↗
            </Link>
            <Link
              href={catalog.lasar.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gaucho-blue/40 bg-gaucho-blue/5 dark:bg-gaucho-blue/40 px-4 py-2 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold-light transition hover:bg-gaucho-blue/40"
            >
              {catalog.lasar.catalog_year} LASAR ↗
            </Link>
          </div>
        </section>

        <LsFrameworkCard framework={catalog.requirements_framework} />

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">L&S majors</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Department URLs follow{" "}
              <code className="text-xs text-gaucho-blue dark:text-gaucho-gold">
                https://&#123;dept&#125;.ucsb.edu/
              </code>{" "}
              or{" "}
              <code className="text-xs text-gaucho-blue dark:text-gaucho-gold">
                https://www.&#123;dept&#125;.ucsb.edu/
              </code>
              .
            </p>
          </div>
          <LsMajorCatalog majors={catalog.majors} schoolShortName={shortName} />
        </section>

        <SourceList sources={catalog.sources} />
      </div>
    </div>
  );
}
