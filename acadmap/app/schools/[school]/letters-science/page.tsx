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
  lsMajorHubHref,
} from "@/lib/ucsb-ls";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Letters & Science | AcadMap" };
  }
  const catalog = await loadUcsbLsCatalog();
  return {
    title: `${catalog?.school.college ?? "L&S"} | AcadMap`,
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

        <section className="card-glow rounded-2xl border border-teal-500/25 bg-gradient-to-br from-slate-900/90 via-teal-950/30 to-slate-900/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-300/90">
            {catalog.school.name}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            {catalog.school.college}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{catalog.school.location}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-lg border border-teal-500/30 bg-slate-950/50 px-3 py-1.5 text-xs text-teal-200">
              {catalog.majors.length} majors in catalog
            </span>
            <span className="rounded-lg border border-slate-600/40 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-400">
              Updated {catalog.last_updated}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={catalog.college.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-teal-500/40 px-4 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-950/50"
            >
              L&S college site ↗
            </Link>
            <Link
              href={catalog.college.admissions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
            >
              Admissions majors ↗
            </Link>
            <Link
              href={catalog.lasar.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-teal-500/40 bg-teal-950/40 px-4 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-900/40"
            >
              {catalog.lasar.catalog_year} LASAR ↗
            </Link>
          </div>
        </section>

        <LsFrameworkCard framework={catalog.requirements_framework} />

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-50">L&S majors</h2>
            <p className="mt-1 text-sm text-slate-400">
              Department URLs follow{" "}
              <code className="text-xs text-teal-300">
                https://&#123;dept&#125;.ucsb.edu/
              </code>{" "}
              or{" "}
              <code className="text-xs text-teal-300">
                https://www.&#123;dept&#125;.ucsb.edu/
              </code>
              .
            </p>
          </div>
          <LsMajorCatalog
            majors={catalog.majors}
            getMajorHref={(slug) => lsMajorHubHref(shortName, slug)}
          />
        </section>

        <SourceList sources={catalog.sources} />
      </div>
    </div>
  );
}
