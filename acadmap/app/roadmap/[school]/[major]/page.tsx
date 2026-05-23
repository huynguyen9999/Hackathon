import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { RoadmapView } from "@/components/RoadmapView";
import { getRoadmapBySlug } from "@/lib/roadmap";
import {
  coeCollegeHubHref,
  coeMajorHubHref,
  isCoeMajorSlug,
  schoolHubHref,
} from "@/lib/ucsb-coe";
import { lsCollegeHubHref, lsMajorHubHref } from "@/lib/ucsb-ls";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  const { school, major } = params;
  const roadmap = await getRoadmapBySlug(school, major);

  if (!roadmap) {
    return { title: "Roadmap not found | AcadMap" };
  }

  return {
    title: `${roadmap.school.short_name.toUpperCase()} ${roadmap.major.name} | AcadMap`,
    description: `Degree roadmap for ${roadmap.major.name} at ${roadmap.school.name}.`,
  };
}

export default async function RoadmapPage({ params }: PageProps) {
  const { school, major } = params;
  const roadmap = await getRoadmapBySlug(school, major);

  if (!roadmap) {
    notFound();
  }

  const isUcsb = roadmap.school.short_name === "ucsb";
  const isCoe = isUcsb ? await isCoeMajorSlug(major) : false;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          ...(isUcsb
            ? [
                {
                  label: "UCSB",
                  href: schoolHubHref("ucsb"),
                },
                {
                  label: isCoe ? "Engineering" : "Letters & Science",
                  href: isCoe
                    ? coeCollegeHubHref("ucsb")
                    : lsCollegeHubHref("ucsb"),
                },
                {
                  label: roadmap.major.name,
                  href: isCoe
                    ? coeMajorHubHref("ucsb", major)
                    : lsMajorHubHref("ucsb", major),
                },
                { label: "Roadmap" },
              ]
            : [
                { label: roadmap.school.short_name.toUpperCase() },
                { label: roadmap.major.name },
              ]),
        ]}
        eyebrow={`${roadmap.school.short_name} · ${roadmap.major.degree_type}`}
        title={roadmap.major.name}
        description={roadmap.school.name}
        actions={
          <>
            <span className="rounded-lg border border-indigo-500/25 bg-white dark:bg-slate-900/60 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
              {roadmap.nodes.length} nodes
            </span>
            <span className="rounded-lg border border-indigo-500/25 bg-white dark:bg-slate-900/60 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
              {roadmap.edges.length} edges
            </span>
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-200">
              v{roadmap.version} · {roadmap.status}
            </span>
          </>
        }
      />

      <RoadmapView roadmap={roadmap} />
    </div>
  );
}
