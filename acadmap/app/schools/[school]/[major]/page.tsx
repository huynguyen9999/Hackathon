import Link from "next/link";
import { notFound } from "next/navigation";

import { GearBanner } from "@/components/GearBanner";
import { MajorRequirements } from "@/components/MajorRequirements";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getUcsbMajorBySlug,
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
    title: `${major.name} (GEAR ${new Date().getFullYear()}) | AcadMap`,
    description: `UCSB ${major.name} requirements from the College of Engineering GEAR.`,
  };
}

export default async function MajorHubPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCoeCatalog();
  const major = await getUcsbMajorBySlug(majorSlug);

  if (!catalog || !major) {
    notFound();
  }

  const roadmapHref = majorRoadmapHref(catalog.school.short_name, major.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          {
            label: catalog.school.short_name.toUpperCase(),
            href: schoolHubHref(catalog.school.short_name),
          },
          { label: major.name },
        ]}
        eyebrow={`${major.degree_type} · ${catalog.gear.catalog_year}`}
        title={major.name}
        description={major.department}
        actions={
          major.roadmap_available ? (
            <Link
              href={roadmapHref}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500"
            >
              Open interactive roadmap
            </Link>
          ) : (
            <a
              href={major.curriculum_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-indigo-500/40 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-950/50"
            >
              Official curriculum ↗
            </a>
          )
        }
      />

      <div className="space-y-8">
        <GearBanner gear={catalog.gear} />
        <MajorRequirements major={major} />

        {major.roadmap_available ? (
          <section className="rounded-xl border border-dashed border-indigo-500/30 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">
              The interactive graph shows core prerequisite chains from GEAR.
              Electives and GE requirements are listed above—not every GEAR
              course appears on the graph yet.
            </p>
            <Link
              href={roadmapHref}
              className="mt-4 inline-flex text-sm font-medium text-indigo-300 hover:text-violet-200"
            >
              View roadmap graph →
            </Link>
          </section>
        ) : (
          <p className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
            Interactive roadmap coming soon. Requirements above are from GEAR
            2025-26; use the department link for the 4-year plan grid.
          </p>
        )}
      </div>
    </div>
  );
}
