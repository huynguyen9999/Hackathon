import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorCatalogGrid } from "@/components/MajorCatalogGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { SchoolHero } from "@/components/SchoolHero";
import { SourceList } from "@/components/SourceList";
import {
  coeMajorHubHref,
  loadUcsbCoeCatalog,
  schoolHubHref,
} from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Engineering | iGauchoBack" };
  }
  const catalog = await loadUcsbCoeCatalog();
  return {
    title: `${catalog?.school.college ?? "Engineering"} | iGauchoBack`,
    description: `Browse ${catalog?.majors.length ?? 5} engineering majors at UC Santa Barbara (GEAR 2025-26).`,
  };
}

export default async function EngineeringHubPage({ params }: PageProps) {
  const { school } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCoeCatalog();
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
          { label: "Engineering" },
        ]}
        eyebrow="College of Engineering"
        title={catalog.school.college}
        description="Requirements from the 2025-26 GEAR PDF—prep, upper-division, and electives for all five BS engineering majors."
      />

      <div className="space-y-12">
        <CollegeBanner variant="engineering" coeCatalog={catalog} />
        <SchoolHero catalog={catalog} />

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Engineering majors
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Select a major for GEAR requirements or an interactive graph.
              </p>
            </div>
            <Link
              href="/contribute"
              className="text-sm font-medium text-gaucho-blue dark:text-gaucho-gold transition hover:text-gaucho-blue dark:text-gaucho-gold-light"
            >
              Contribute a roadmap →
            </Link>
          </div>
          <MajorCatalogGrid
            majors={catalog.majors}
            getMajorHref={(slug) => coeMajorHubHref(shortName, slug)}
            badgeLabel="GEAR"
            ctaLabel="View GEAR plan"
            showRequirementsLevel
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SourceList sources={catalog.sources} />
          <div className="rounded-xl border border-gaucho-blue-light/20 bg-gaucho-blue/5 dark:bg-gaucho-blue-dark/20 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-blue/80 dark:text-gaucho-gold/80">
              Data files
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <code className="rounded bg-white dark:bg-slate-900 px-1 text-xs">
                data/ucsb/coe-catalog.json
              </code>
              {" · "}
              <code className="rounded bg-white dark:bg-slate-900 px-1 text-xs">
                data/seeds/
              </code>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
