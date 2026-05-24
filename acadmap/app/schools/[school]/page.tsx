import Link from "next/link";
import { notFound } from "next/navigation";

import { SchoolHubCommunity } from "@/components/community/SchoolHubCommunity";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadCommunityHubData } from "@/lib/community/data";
import { loadCoeCatalog } from "@/lib/school-catalog";
import {
  ccsCollegeHubHref,
  coeCollegeHubHref,
  lsCollegeHubHref,
} from "@/lib/ucsb-paths";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import { getGradHubStats } from "@/lib/ucsb-grad-programs";
import { getGradesMeta } from "@/lib/ucsb-grades";
import {
  getSchoolConfig,
  listActiveSchools,
} from "@/lib/schools/registry";

type PageProps = {
  params: { school: string };
};

function collegeHubHref(school: string, slug: string): string {
  switch (slug) {
    case "engineering":
      return coeCollegeHubHref(school);
    case "letters-science":
      return lsCollegeHubHref(school);
    case "creative-studies":
      return ccsCollegeHubHref(school);
    default:
      return `/schools/${school}/${slug}`;
  }
}

export async function generateStaticParams() {
  const schools = await listActiveSchools();
  return schools.map((s) => ({ school: s.short_name }));
}

export async function generateMetadata({ params }: PageProps) {
  const config = await getSchoolConfig(params.school);
  if (!config) {
    return { title: "School | iGauchoBack" };
  }
  return {
    title: `${config.name} | iGauchoBack`,
    description: `Community hub, roadmaps, and major requirements for ${config.name}.`,
  };
}

export default async function SchoolHubPage({ params }: PageProps) {
  const { school } = params;
  const config = await getSchoolConfig(school);

  if (!config) {
    notFound();
  }

  const communityData = await loadCommunityHubData(school);
  const gradStats =
    school === "ucsb" ? await getGradHubStats() : null;
  const gradesMeta =
    school === "ucsb" ? await getGradesMeta() : null;
  const isPreviewSchool = config.preview === true;

  const collegeStats = await Promise.all(
    config.colleges.map(async (college) => {
      if (college.catalogType === "coe") {
        const catalog = await loadCoeCatalog(school);
        const live = catalog?.majors.filter((m) => m.roadmap_available).length ?? 0;
        return {
          college,
          majorCount: catalog?.majors.length ?? 0,
          liveGraphs: live,
        };
      }
      if (college.catalogType === "ls" && school === "ucsb") {
        const ls = await loadUcsbLsCatalog();
        return { college, majorCount: ls?.majors.length ?? 0, liveGraphs: 0 };
      }
      if (college.catalogType === "ccs" && school === "ucsb") {
        const ccs = await loadUcsbCcsCatalog();
        return { college, majorCount: ccs?.majors.length ?? 0, liveGraphs: 0 };
      }
      return { college, majorCount: 0, liveGraphs: 0 };
    }),
  );

  const previewLiveGraphs = collegeStats.reduce(
    (sum, { liveGraphs }) => sum + liveGraphs,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Schools", href: "/schools" }, { label: config.name }]}
        eyebrow={config.location}
        title={`${config.name} hub`}
        description="Community Q&A, course reviews, alumni outcomes, and college major catalogs — your one-stop shop for degree planning."
      />

      {isPreviewSchool && school === "ucla" && (
        <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-50 px-5 py-4 dark:bg-amber-950/25">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
            Early preview
          </p>
          <p className="mt-2 text-sm text-amber-950 dark:text-amber-100">
            Samueli preview — {previewLiveGraphs} interactive roadmap
            {previewLiveGraphs !== 1 ? "s" : ""} (Computer Science, Electrical
            Engineering). More majors coming soon.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/roadmap/ucla/computer-science"
              className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
            >
              CS roadmap →
            </Link>
            <Link
              href="/roadmap/ucla/electrical-engineering"
              className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
            >
              EE roadmap →
            </Link>
          </div>
        </section>
      )}

      {isPreviewSchool && school === "berkeley" && (
        <section className="mt-8 rounded-xl border border-amber-500/30 bg-amber-50 px-5 py-4 dark:bg-amber-950/25">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
            Early preview
          </p>
          <p className="mt-2 text-sm text-amber-950 dark:text-amber-100">
            Berkeley Engineering preview — {previewLiveGraphs} interactive
            roadmap (EECS). More majors coming soon.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/roadmap/berkeley/eecs"
              className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 dark:text-amber-200"
            >
              EECS roadmap →
            </Link>
          </div>
        </section>
      )}

      <SchoolHubCommunity schoolShortName={school} data={communityData} />

      {gradesMeta && (
        <section className="mt-14">
          <Link
            href="/schools/ucsb/grades"
            className="card-glow group flex flex-col rounded-xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-50/80 to-white p-8 transition hover:border-teal-500/50 dark:from-teal-950/25 dark:to-gaucho-blue-dark/40"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
              Student essentials · Daily Nexus data
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gaucho-blue group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-200">
              Grade distributions & GE explorer
            </h2>
            <p className="mt-3 max-w-2xl flex-1 text-sm text-slate-600 dark:text-slate-400">
              {gradesMeta.courseCount.toLocaleString()} courses tracked from{" "}
              {gradesMeta.quarterRange.from} through {gradesMeta.quarterRange.to}.
              Search GPA history, browse GE areas, and compare leaderboards.
            </p>
            <p className="mt-4 text-sm font-medium text-teal-700 dark:text-teal-200">
              Open grades hub →
            </p>
          </Link>
        </section>
      )}

      {gradStats && (
        <section className="mt-14">
          <Link
            href="/schools/ucsb/graduate"
            className="card-glow group flex flex-col rounded-xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-50/80 to-white p-8 transition hover:border-violet-500/50 dark:from-violet-950/25 dark:to-gaucho-blue-dark/40"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-200">
              Graduate Division · MS & PhD
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gaucho-blue group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-200">
              Graduate programs
            </h2>
            <p className="mt-3 max-w-2xl flex-1 text-sm text-slate-600 dark:text-slate-400">
              {gradStats.departmentCount} departments from the official Graduate
              Division index, {gradStats.roadmapCount} interactive CoE roadmaps,
              and a graduate-level course catalog.
            </p>
            <p className="mt-4 text-sm font-medium text-violet-700 dark:text-violet-200">
              Open graduate hub →
            </p>
          </Link>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Undergraduate colleges
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Browse official requirements and interactive roadmaps by college.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collegeStats.map(({ college, majorCount, liveGraphs }) => (
            <Link
              key={college.slug}
              href={collegeHubHref(school, college.slug)}
              className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/20 bg-white p-8 transition hover:border-gaucho-gold/40 dark:bg-gaucho-blue-dark/40"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
                {college.subtitle}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gaucho-blue group-hover:text-gaucho-blue-light dark:text-white dark:group-hover:text-gaucho-gold">
                {college.label}
              </h3>
              <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {college.description}
              </p>
              <p className="mt-4 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold">
                {majorCount} majors
                {liveGraphs > 0 ? ` · ${liveGraphs} live graph${liveGraphs !== 1 ? "s" : ""}` : ""}{" "}
                →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
