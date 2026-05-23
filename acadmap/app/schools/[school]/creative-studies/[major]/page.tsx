import Link from "next/link";
import { notFound } from "next/navigation";

import { CcsAdmissionCard } from "@/components/CcsAdmissionCard";
import { CcsQuarterTimeline } from "@/components/CcsQuarterTimeline";
import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorRegulationsCard } from "@/components/MajorRegulationsCard";
import { MajorRequirements } from "@/components/MajorRequirements";
import { MajorSheetRequirements } from "@/components/MajorSheetRequirements";
import { ProgramVariantsCard } from "@/components/ProgramVariantsCard";
import { SourceList } from "@/components/SourceList";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getUcsbCcsMajorBySlug,
  loadCcsMajorDetail,
  loadUcsbCcsCatalog,
  ccsCollegeHubHref,
} from "@/lib/ucsb-ccs";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string; major: string };
};

function catalogProgramUrl(code: string): string {
  return `https://catalog.ucsb.edu/programs/${code}`;
}

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Major | AcadMap" };
  }
  const major = await getUcsbCcsMajorBySlug(params.major);
  if (!major) return { title: "Major not found | AcadMap" };
  return {
    title: `${major.name} | AcadMap`,
    description: `UCSB CCS ${major.name} — admission requirements, major sheet, and 4-year plan.`,
  };
}

export default async function CreativeStudiesMajorPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCcsCatalog();
  const major = await getUcsbCcsMajorBySlug(majorSlug);
  const detail = await loadCcsMajorDetail(majorSlug);

  if (!catalog || !major) {
    notFound();
  }

  const shortName = catalog.school.short_name;
  const ploUrl = detail?.sources.find((s) =>
    s.title.toLowerCase().includes("plo"),
  )?.url;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: shortName.toUpperCase(), href: schoolHubHref(shortName) },
          {
            label: "Creative Studies",
            href: ccsCollegeHubHref(shortName),
          },
          { label: major.name },
        ]}
        eyebrow={`${major.degree_type} · ${catalog.handbook.catalog_year}`}
        title={major.name}
        description={major.department}
        actions={
          <>
            {major.major_sheet_url ? (
              <a
                href={major.major_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:from-amber-500 hover:to-orange-500"
              >
                Major sheet PDF ↗
              </a>
            ) : null}
            {major.admissions_url ? (
              <a
                href={major.admissions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-amber-500/40 px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-950/50"
              >
                Apply to CCS ↗
              </a>
            ) : null}
            {major.catalog_program_code ? (
              <a
                href={catalogProgramUrl(major.catalog_program_code)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
              >
                UCSB Catalog ↗
              </a>
            ) : null}
            {ploUrl ? (
              <a
                href={ploUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
              >
                Program learning outcomes ↗
              </a>
            ) : null}
            <a
              href={major.department_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-amber-500/40 px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-950/50"
            >
              CCS major page ↗
            </a>
            <a
              href={catalog.handbook.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
            >
              Student handbook ↗
            </a>
            <a
              href={catalog.college.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
            >
              How to apply ↗
            </a>
          </>
        }
      />

      <div className="space-y-8">
        {detail?.quality_tier === "flexible" ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/90">
            This CCS major uses an advisor-negotiated curriculum. The plan below is
            suggested — finalize every quarter with your faculty advisor.
          </p>
        ) : null}

        <CollegeBanner variant="creative-studies" ccsCatalog={catalog} />

        {detail ? (
          <>
            <CcsAdmissionCard
              admission={detail.admission_requirements}
              applyUrl={major.admissions_url ?? catalog.college.apply_url}
            />
            <MajorSheetRequirements detail={detail} />
            <MajorRegulationsCard regulations={detail.regulations} />
            {detail.program_variants?.length ? (
              <ProgramVariantsCard variants={detail.program_variants} />
            ) : null}
            <CcsQuarterTimeline
              detail={detail}
              ccsFramework={catalog.requirements_framework}
            />
            <SourceList sources={detail.sources} />
          </>
        ) : (
          <MajorRequirements
            major={major}
            requirementsLabel="Major requirements"
            pageRefLabel={undefined}
          />
        )}

        <p className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
          College-wide CCS rules (8 GE courses unrelated to major, Ethnicity, 180
          units, quarterly faculty advising) apply in addition to major
          requirements. See{" "}
          <a
            href={catalog.handbook.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 underline"
          >
            Student Handbook
          </a>{" "}
          and{" "}
          <a
            href={catalog.college.catalog_degrees_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 underline"
          >
            UCSB Catalog — CCS degrees
          </a>
          .
        </p>
      </div>
    </div>
  );
}
