import Link from "next/link";
import { notFound } from "next/navigation";

import { CollegeBanner } from "@/components/CollegeBanner";
import { MajorCatalogGrid } from "@/components/MajorCatalogGrid";
import { GradProgramCard } from "@/components/graduate/GradProgramCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { SchoolHero } from "@/components/SchoolHero";
import { SourceList } from "@/components/SourceList";
import { loadCoeCatalog } from "@/lib/school-catalog";
import {
  coeMajorHubHref,
  schoolHubHref,
} from "@/lib/ucsb-coe";
import {
  getSchoolConfig,
  schoolHasCollege,
} from "@/lib/schools/registry";
import {
  getGradProgram,
  listGradPrograms,
} from "@/lib/ucsb-grad-programs";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  const config = await getSchoolConfig(params.school);
  if (!config) {
    return { title: "Engineering | iGauchoBack" };
  }
  const catalog = await loadCoeCatalog(params.school);
  return {
    title: `${catalog?.school.college ?? "Engineering"} | iGauchoBack`,
    description: `Browse engineering majors at ${config.name}.`,
  };
}

export default async function EngineeringHubPage({ params }: PageProps) {
  const { school } = params;

  const config = await getSchoolConfig(school);
  if (!config || !(await schoolHasCollege(school, "engineering"))) {
    notFound();
  }

  const catalog = await loadCoeCatalog(school);
  if (!catalog) {
    notFound();
  }

  const shortName = catalog.school.short_name;
  const isUcla = shortName === "ucla";
  const badgeLabel = isUcla ? "Announcement" : "GEAR";
  const ctaLabel = isUcla ? "View requirements" : "View GEAR plan";
  const dataPath = `data/${shortName}/coe-catalog.json`;
  const gradPrograms =
    shortName === "ucsb" ? await listGradPrograms() : [];
  const gradProgramDetails =
    shortName === "ucsb"
      ? await Promise.all(
          gradPrograms.map(async (program) => ({
            program,
            detail: await getGradProgram(program.slug),
          })),
        )
      : [];

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
        eyebrow={isUcla ? "Henry Samueli School" : "College of Engineering"}
        title={catalog.school.college}
        description={
          isUcla
            ? "Requirements from the 2025-26 UCLA Samueli Announcement — 10 BS engineering programs."
            : "Requirements from the 2025-26 GEAR PDF — prep, upper-division, and electives for all BS engineering majors."
        }
      />

      <div className="space-y-12">
        <CollegeBanner
          variant="engineering"
          coeCatalog={catalog}
          schoolShortName={shortName}
        />
        <SchoolHero catalog={catalog} schoolShortName={shortName} />

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Engineering majors
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Select a major for requirements or an interactive graph.
              </p>
            </div>
            <Link
              href="/contribute"
              className="text-sm font-medium text-gaucho-blue transition hover:text-gaucho-blue-light dark:text-gaucho-gold"
            >
              Contribute a roadmap →
            </Link>
          </div>
          <MajorCatalogGrid
            majors={catalog.majors}
            getMajorHref={(slug) => coeMajorHubHref(shortName, slug)}
            badgeLabel={badgeLabel}
            ctaLabel={ctaLabel}
            showRequirementsLevel
          />
        </section>

        {gradProgramDetails.length > 0 && (
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  Graduate engineering (MS & PhD)
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Interactive roadmaps for CoE graduate programs.
                </p>
              </div>
              <Link
                href="/schools/ucsb/graduate"
                className="text-sm font-medium text-violet-700 transition hover:text-violet-900 dark:text-violet-200"
              >
                Full graduate hub →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {gradProgramDetails.map(({ program, detail }) => (
                <GradProgramCard
                  key={program.slug}
                  program={program}
                  detail={detail}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <SourceList sources={catalog.sources} />
          <div className="rounded-xl border border-gaucho-blue-light/20 bg-gaucho-blue/5 p-5 dark:bg-gaucho-blue-dark/20">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
              Data files
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <code className="rounded bg-white px-1 text-xs dark:bg-slate-900">
                {dataPath}
              </code>
              {" · "}
              <code className="rounded bg-white px-1 text-xs dark:bg-slate-900">
                data/seeds/
              </code>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
