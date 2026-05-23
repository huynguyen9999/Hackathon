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
    return { title: "Major | AcadMap" };
  }
  const major = await getUcsbMajorBySlug(params.major);
  if (!major) return { title: "Major not found | AcadMap" };
  return {
    title: `${major.name} (GEAR) | AcadMap`,
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
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500"
              >
                Open interactive roadmap
              </Link>
            ) : null}
            <a
              href={catalog.gear.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-indigo-500/40 px-5 py-2.5 text-sm font-semibold text-indigo-800 dark:text-indigo-200 transition hover:bg-indigo-950/50"
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
              <section className="rounded-xl border border-dashed border-indigo-500/30 bg-slate-100 dark:bg-slate-900/30 p-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive graph shows prerequisite chains from GEAR.
                </p>
                <Link
                  href={roadmapHref}
                  className="mt-4 inline-flex text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:text-violet-800 dark:text-violet-200"
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
            <p className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-100/90">
              Interactive roadmap coming soon. Requirements above are from GEAR
              2025-26.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
