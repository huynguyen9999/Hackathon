import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { DepartmentFacultyCard } from "@/components/DepartmentFacultyCard";
import { MajorRegulationsCard } from "@/components/MajorRegulationsCard";
import { MajorRequirements } from "@/components/MajorRequirements";
import { MajorSheetRequirements } from "@/components/MajorSheetRequirements";
import { ProgramVariantsCard } from "@/components/ProgramVariantsCard";
import { QuarterTimeline } from "@/components/QuarterTimeline";
import { PageHeader } from "@/components/layout/PageHeader";
import { catalogProgramUrl } from "@/lib/ucsb-dept-urls";
import {
  getUcsbLsMajorBySlug,
  loadLsMajorDetail,
  loadUcsbLsCatalog,
  lsCollegeHubHref,
} from "@/lib/ucsb-ls";
import { majorRoadmapHref } from "@/lib/ucsb-paths";
import { schoolHubHref } from "@/lib/ucsb-coe";
import { loadDepartmentFacultyForMajor } from "@/lib/ucsb-faculty";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Major | iGauchoBack" };
  }
  const major = await getUcsbLsMajorBySlug(params.major);
  if (!major) return { title: "Major not found | iGauchoBack" };
  return {
    title: `${major.name} | iGauchoBack`,
    description: `UCSB ${major.name} L&S requirements (LASAR + department major sheet).`,
  };
}

export default async function LettersScienceMajorPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbLsCatalog();
  const major = await getUcsbLsMajorBySlug(majorSlug);
  const detail = await loadLsMajorDetail(majorSlug);
  const departmentFaculty = await loadDepartmentFacultyForMajor(majorSlug);

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
          { label: "Letters & Science", href: lsCollegeHubHref(shortName) },
          { label: major.name },
        ]}
        eyebrow={`${major.degree_type} · ${catalog.lasar.catalog_year}`}
        title={major.name}
        description={major.department}
        actions={
          <>
            {major.roadmap_available ? (
              <Link
                href={roadmapHref}
                className="rounded-xl bg-gradient-to-r bg-gaucho-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gaucho-blue-light"
              >
                Open interactive roadmap
              </Link>
            ) : null}
            {major.major_sheet_url ? (
              <a
                href={major.major_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gaucho-blue/40 px-5 py-2.5 text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold-light transition hover:bg-gaucho-blue/5"
              >
                Major sheet PDF ↗
              </a>
            ) : null}
            {major.plan_of_study_url ? (
              <a
                href={major.plan_of_study_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 dark:border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                Plan of study ↗
              </a>
            ) : null}
            {departmentFaculty?.faculty_url ? (
              <a
                href={departmentFaculty.faculty_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 dark:border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                Department faculty ↗
              </a>
            ) : null}
            {major.admissions_url ? (
              <a
                href={major.admissions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gaucho-blue/40 px-5 py-2.5 text-sm font-semibold text-gaucho-blue dark:text-gaucho-gold-light transition hover:bg-gaucho-blue/5"
              >
                Admissions ↗
              </a>
            ) : null}
            <a
              href={
                major.catalog_program_code
                  ? catalogProgramUrl(major.catalog_program_code)
                  : major.curriculum_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-300 dark:border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              UCSB Catalog ↗
            </a>
          </>
        }
      />

      <div className="space-y-8">
        {!detail && major.requirements_level === "partial" ? (
          <p className="rounded-xl border border-gaucho-blue/30 bg-gaucho-gold/10 dark:bg-gaucho-blue/25 px-4 py-3 text-sm text-gaucho-blue dark:text-gaucho-gold-light/90">
            Requirements below are summarized. Verify on the official catalog before
            planning.
          </p>
        ) : null}

        <CollegeBanner variant="letters-science" lsCatalog={catalog} />

        {detail ? (
          <>
            <MajorSheetRequirements detail={detail} />
            <MajorRegulationsCard regulations={detail.regulations} />
            {departmentFaculty ? (
              <DepartmentFacultyCard
                faculty={departmentFaculty}
                careerOutcomes={major.career_outcomes ?? []}
              />
            ) : null}
            {detail.program_variants?.length ? (
              <ProgramVariantsCard variants={detail.program_variants} />
            ) : null}
            <QuarterTimeline
              detail={detail}
              lasarFramework={catalog.requirements_framework}
            />
            {major.roadmap_available ? (
              <section className="rounded-xl border border-dashed border-gaucho-blue/30 bg-slate-100 dark:bg-slate-900/30 p-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive graph shows prerequisite chains from the major sheet.
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
          <MajorRequirements
            major={major}
            requirementsLabel="Major requirements"
            pageRefLabel={undefined}
          />
        )}

        <p className="rounded-xl border border-gaucho-blue/25 bg-gaucho-gold/10 dark:bg-gaucho-blue/20 px-4 py-3 text-sm text-gaucho-blue dark:text-gaucho-gold-light/90">
          College-wide LASAR rules (GE, writing, 180+ units) apply in addition to
          the major requirements above. See{" "}
          <a
            href={catalog.lasar.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gaucho-blue dark:text-gaucho-gold underline"
          >
            LASAR
          </a>{" "}
          and{" "}
          <a
            href="https://duels.ucsb.edu/degree-planning/degree-requirements"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gaucho-blue dark:text-gaucho-gold underline"
          >
            DUELS degree requirements
          </a>
          .
        </p>
      </div>
    </div>
  );
}
