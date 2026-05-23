import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { CcsFrameworkCard } from "@/components/CcsFrameworkCard";
import { MajorCatalogGrid } from "@/components/MajorCatalogGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceList } from "@/components/SourceList";
import { schoolHubHref } from "@/lib/ucsb-coe";
import {
  ccsCollegeHubHref,
  ccsMajorHubHref,
  loadUcsbCcsCatalog,
} from "@/lib/ucsb-ccs";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Creative Studies | AcadMap" };
  }
  const catalog = await loadUcsbCcsCatalog();
  return {
    title: `${catalog?.college.name ?? "CCS"} | AcadMap`,
    description: `Browse ${catalog?.majors.length ?? 0} CCS majors at UC Santa Barbara with major sheets, admission requirements, and 4-year plans.`,
  };
}

export default async function CreativeStudiesHubPage({ params }: PageProps) {
  const { school } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCcsCatalog();
  if (!catalog) {
    notFound();
  }

  const shortName = catalog.school.short_name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: shortName.toUpperCase(), href: schoolHubHref(shortName) },
          { label: "Creative Studies" },
        ]}
        eyebrow="College of Creative Studies"
        title={catalog.college.name}
        description="Nine selective majors with accelerated curricula, faculty mentorship, and research from day one — plus CCS General Education and official major sheets."
      />

      <div className="space-y-12">
        <CollegeBanner variant="creative-studies" ccsCatalog={catalog} />

        <section className="card-glow rounded-2xl border border-amber-500/25 bg-gradient-to-br from-slate-900/90 via-amber-950/20 to-slate-900/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-300/90">
            {catalog.school.name}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            {catalog.school.college}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{catalog.school.location}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-lg border border-amber-500/30 bg-slate-950/50 px-3 py-1.5 text-xs text-amber-200">
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
              className="rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-950/50"
            >
              CCS college site ↗
            </Link>
            <Link
              href={catalog.college.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-900/40"
            >
              How to apply ↗
            </Link>
            <Link
              href={catalog.handbook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
            >
              {catalog.handbook.catalog_year} Handbook ↗
            </Link>
            <Link
              href={catalog.college.catalog_degrees_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-600/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
            >
              UCSB Catalog ↗
            </Link>
          </div>
        </section>

        <CcsFrameworkCard framework={catalog.requirements_framework} />

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-50">CCS majors</h2>
            <p className="mt-1 text-sm text-slate-400">
              Each major has a dedicated apply page, major sheet PDF, and suggested
              4-year plan on AcadMap.
            </p>
          </div>
          <MajorCatalogGrid
            majors={catalog.majors}
            getMajorHref={(slug) => ccsMajorHubHref(shortName, slug)}
            badgeLabel="CCS"
            ctaLabel="View major sheet & plan"
            showRequirementsLevel
          />
        </section>

        <SourceList sources={catalog.sources} />
      </div>
    </div>
  );
}
