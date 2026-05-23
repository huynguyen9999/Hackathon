import Link from "next/link";
import { notFound } from "next/navigation";

import { CoeQuarterTimeline } from "@/components/CoeQuarterTimeline";
import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorRegulationsCard } from "@/components/MajorRegulationsCard";
import { MajorRequirements } from "@/components/MajorRequirements";
import { MajorSheetRequirements } from "@/components/MajorSheetRequirements";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  coeCollegeHubHref,
  getUcsbMajorBySlug,
  loadCoeMajorDetail,
  loadUcsbCoeCatalog,
  majorRoadmapHref,
  schoolHubHref,
} from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Major | iGauchoBack" };
  }
  const major = await getUcsbMajorBySlug(params.major);
  if (!major) return { title: "Major not found | iGauchoBack" };
  return {
    title: `${major.name} (GEAR) | iGauchoBack`,
    description: `UCSB ${major.name} GEAR requirements and 4-year quarter plan.`,
  };
}

export default async function EngineeringMajorPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCoeCatalog();
  const major = await getUcsbMajorBySlug(majorSlug);
  const detail = await loadCoeMajorDetail(majorSlug);

  if (!catalog || !major) {
    notFound();
  }

  const shortName = catalog.school.short_name;
  const roadmapHref = majorRoadmapHref(shortName, major.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: shortName.toUpperCase(), href: schoolHubHref(shortName) },
          { label: "Engineering", href: coeCollegeHubHref(shortName) },
          { label: major.name },
        ]}
        eyebrow={`${major.degree_type} · ${catalog.gear.catalog_year}`}
        title={major.name}
        description={major.department}
        actions={
          <>
            {major.roadmap_available ? (
              <Link
                href={roadmapHref}
                className="rounded-xl bg-gradient-to-r from-gaucho-blue to-gaucho-blue-light px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gaucho-blue-dark/30 transition hover:from-gaucho-blue-light hover:to-gaucho-gold"
              >
                Open interactive roadmap
              </Link>
            ) : null}
            <a
              href={catalog.gear.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gaucho-blue-light/40 px-5 py-2.5 text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold-light transition hover:bg-gaucho-blue-dark/50"
            >
              GEAR PDF ↗
            </a>
            {major.curriculum_url ? (
              <a
                href={major.curriculum_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 dark:border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                Department curriculum ↗
              </a>
            ) : null}
          </>
        }
      />

      <div className="space-y-8">
        <CollegeBanner variant="engineering" coeCatalog={catalog} />

        {detail ? (
          <>
            <MajorSheetRequirements detail={detail} />
            <MajorRegulationsCard regulations={detail.regulations} />
            <CoeQuarterTimeline
              detail={detail}
              coeGeFramework={catalog.gear_framework}
            />
            {major.roadmap_available ? (
              <section className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-100 dark:bg-slate-900/30 p-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive graph shows prerequisite chains from GEAR.
                </p>
                <Link
                  href={roadmapHref}
                  className="mt-4 inline-flex text-sm font-medium text-gaucho-blue dark:text-gaucho-gold hover:text-gaucho-blue dark:text-gaucho-gold-light"
                >
                  View roadmap graph →
                </Link>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <MajorRequirements
              major={major}
              requirementsLabel="GEAR major requirements"
              pageRefLabel={
                major.gear_page != null ? ` · GEAR p.${major.gear_page}` : undefined
              }
            />
            <p className="rounded-xl border border-gaucho-blue/25 bg-gaucho-gold/10 dark:bg-gaucho-blue/20 px-4 py-3 text-sm text-gaucho-blue dark:text-gaucho-gold-light/90">
              Interactive roadmap coming soon. Requirements above are from GEAR
              2025-26.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
