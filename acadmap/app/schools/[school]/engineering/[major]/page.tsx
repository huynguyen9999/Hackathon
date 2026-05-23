import Link from "next/link";
import { notFound } from "next/navigation";

import { CoeQuarterTimeline } from "@/components/CoeQuarterTimeline";
import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorRegulationsCard } from "@/components/MajorRegulationsCard";
import { MajorRequirements } from "@/components/MajorRequirements";
import { MajorSheetRequirements } from "@/components/MajorSheetRequirements";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadCoeCatalog, loadCoeMajorDetail } from "@/lib/school-catalog";
import {
  coeCollegeHubHref,
  getCoeMajorBySlug,
  majorRoadmapHref,
  schoolHubHref,
} from "@/lib/ucsb-coe";
import {
  getSchoolConfig,
  schoolHasCollege,
} from "@/lib/schools/registry";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  const config = await getSchoolConfig(params.school);
  if (!config) {
    return { title: "Major | iGauchoBack" };
  }
  const major = await getCoeMajorBySlug(params.school, params.major);
  if (!major) return { title: "Major not found | iGauchoBack" };
  const sourceLabel = params.school === "ucla" ? "Samueli" : "GEAR";
  return {
    title: `${major.name} (${sourceLabel}) | iGauchoBack`,
    description: `${config.name} ${major.name} requirements and quarter plan.`,
  };
}

export default async function EngineeringMajorPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  const config = await getSchoolConfig(school);
  if (!config || !(await schoolHasCollege(school, "engineering"))) {
    notFound();
  }

  const catalog = await loadCoeCatalog(school);
  const major = await getCoeMajorBySlug(school, majorSlug);
  const detail = await loadCoeMajorDetail(school, majorSlug);

  if (!catalog || !major) {
    notFound();
  }

  const shortName = catalog.school.short_name;
  const isUcla = shortName === "ucla";
  const roadmapHref = majorRoadmapHref(shortName, major.slug);
  const pdfLabel = isUcla ? "Announcement PDF" : "GEAR PDF";
  const requirementsLabel = isUcla
    ? "Samueli major requirements"
    : "GEAR major requirements";

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
              className="rounded-xl border border-gaucho-blue-light/40 px-5 py-2.5 text-sm font-semibold text-gaucho-blue transition hover:bg-gaucho-blue-dark/50 dark:text-gaucho-gold-light"
            >
              {pdfLabel} ↗
            </a>
            {major.curriculum_url ? (
              <a
                href={major.curriculum_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
              >
                Department curriculum ↗
              </a>
            ) : null}
          </>
        }
      />

      <div className="space-y-8">
        <CollegeBanner
          variant="engineering"
          coeCatalog={catalog}
          schoolShortName={shortName}
        />

        {detail ? (
          <>
            <MajorSheetRequirements detail={detail} />
            <MajorRegulationsCard regulations={detail.regulations} />
            <CoeQuarterTimeline
              detail={detail}
              coeGeFramework={catalog.gear_framework}
            />
            {major.roadmap_available ? (
              <section className="rounded-xl border border-dashed border-gaucho-blue-light/30 bg-slate-100 p-6 text-center dark:bg-slate-900/30">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive graph shows prerequisite chains from official sources.
                </p>
                <Link
                  href={roadmapHref}
                  className="mt-4 inline-flex text-sm font-medium text-gaucho-blue hover:text-gaucho-blue-light dark:text-gaucho-gold"
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
              requirementsLabel={requirementsLabel}
              pageRefLabel={
                major.gear_page != null
                  ? ` · ${isUcla ? "Announcement" : "GEAR"} p.${major.gear_page}`
                  : undefined
              }
            />
            <p className="rounded-xl border border-gaucho-blue/25 bg-gaucho-gold/10 px-4 py-3 text-sm text-gaucho-blue dark:bg-gaucho-blue/20 dark:text-gaucho-gold-light/90">
              Interactive roadmap coming soon. Requirements above are from{" "}
              {catalog.gear.catalog_year} official sources.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
