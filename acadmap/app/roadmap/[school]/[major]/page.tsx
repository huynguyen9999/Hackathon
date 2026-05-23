import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { RoadmapView } from "@/components/RoadmapView";
import { isPlannerCollabEnabled } from "@/lib/env";
import { getUcsbConnector } from "@/lib/integrations/ucsb/connector";
import { getRoadmapBySlug } from "@/lib/roadmap";
import {
  getDefaultQuarter,
  listQuarters,
} from "@/lib/ucsb-curriculum";
import {
  coeCollegeHubHref,
  coeMajorHubHref,
  isCoeMajorSlug,
  schoolHubHref,
} from "@/lib/ucsb-coe";
import { lsCollegeHubHref, lsMajorHubHref } from "@/lib/ucsb-ls";
import { loadDepartmentFacultyForMajor } from "@/lib/ucsb-faculty";

type PageProps = {
  params: { school: string; major: string };
};

export async function generateMetadata({ params }: PageProps) {
  const { school, major } = params;
  const roadmap = await getRoadmapBySlug(school, major);

  if (!roadmap) {
    return { title: "Roadmap not found | iGauchoBack" };
  }

  return {
    title: `${roadmap.school.short_name.toUpperCase()} ${roadmap.major.name} | iGauchoBack`,
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
  const isUcla = roadmap.school.short_name === "ucla";
  const isGrad = ["MS", "PhD", "MA"].includes(roadmap.major.degree_type);
  const isCoe =
    !isGrad && (await isCoeMajorSlug(major, roadmap.school.short_name));
  const departmentFaculty =
    isUcsb && !isCoe && !isGrad
      ? await loadDepartmentFacultyForMajor(major)
      : null;

  const defaultCatalogQuarter = isUcsb
    ? getDefaultQuarter(await listQuarters())
    : undefined;

  const plannerCollabEnabled = isPlannerCollabEnabled();
  const connector = getUcsbConnector();
  const [auditRules, creditRules] = await Promise.all([
    connector.getDegreeAuditRules(roadmap.school.short_name, roadmap.major.slug),
    connector.getCreditRules(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          ...(isUcsb
            ? isGrad
              ? [
                  {
                    label: "UCSB",
                    href: schoolHubHref("ucsb"),
                  },
                  {
                    label: "Graduate",
                    href: "/schools/ucsb/graduate",
                  },
                  { label: roadmap.major.name },
                  { label: "Roadmap" },
                ]
              : [
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
            : isUcla && isCoe
              ? [
                  {
                    label: "UCLA",
                    href: schoolHubHref("ucla"),
                  },
                  {
                    label: "Engineering",
                    href: coeCollegeHubHref("ucla"),
                  },
                  {
                    label: roadmap.major.name,
                    href: coeMajorHubHref("ucla", major),
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
            <span className="rounded-lg border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
              {roadmap.nodes.length} nodes
            </span>
            <span className="rounded-lg border border-gaucho-blue-light/25 bg-white dark:bg-slate-900/60 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
              {roadmap.edges.length} edges
            </span>
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-200">
              v{roadmap.version} · {roadmap.status}
            </span>
          </>
        }
      />

      <RoadmapView
        roadmap={roadmap}
        departmentFaculty={departmentFaculty}
        defaultCatalogQuarter={defaultCatalogQuarter}
        auditRules={auditRules}
        apRules={creditRules.apRules}
        transferRules={creditRules.transferRules}
        plannerCollabEnabled={plannerCollabEnabled}
      />
    </div>
  );
}
