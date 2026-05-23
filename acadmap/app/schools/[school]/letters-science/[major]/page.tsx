import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorRequirements } from "@/components/MajorRequirements";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUcsbLsMajorBySlug, loadUcsbLsCatalog, lsCollegeHubHref } from "@/lib/ucsb-ls";
import { schoolHubHref } from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "Major | AcadMap" };
  }
  const major = await getUcsbLsMajorBySlug(params.major);
  if (!major) return { title: "Major not found | AcadMap" };
  return {
    title: `${major.name} | AcadMap`,
    description: `UCSB ${major.name} L&S requirements (LASAR + department curriculum).`,
  };
}

export default async function LettersScienceMajorPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbLsCatalog();
  const major = await getUcsbLsMajorBySlug(majorSlug);

  if (!catalog || !major) {
    notFound();
  }

  const shortName = catalog.school.short_name;

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
            {major.department_url ? (
              <a
                href={major.department_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-teal-500/40 px-5 py-2.5 text-sm font-semibold text-teal-200 transition hover:bg-teal-950/50"
              >
                Department site ↗
              </a>
            ) : null}
            <a
              href={major.curriculum_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-600/40 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
            >
              Curriculum / plan ↗
            </a>
          </>
        }
      />

      <div className="space-y-8">
        <CollegeBanner variant="letters-science" lsCatalog={catalog} />
        <MajorRequirements
          major={major}
          requirementsLabel="Major requirements"
          pageRefLabel={undefined}
        />
        <p className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
          College-wide LASAR rules (GE, writing, 180+ units) apply in addition to
          the major requirements above. See{" "}
          <a
            href={catalog.lasar.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-300 underline"
          >
            LASAR
          </a>{" "}
          and{" "}
          <a
            href="https://duels.ucsb.edu/degree-planning/degree-requirements"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-300 underline"
          >
            DUELS degree requirements
          </a>
          .
        </p>
      </div>
    </div>
  );
}
