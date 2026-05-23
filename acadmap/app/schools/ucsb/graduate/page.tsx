import { PageHeader } from "@/components/layout/PageHeader";
import { GradDepartmentIndex } from "@/components/graduate/GradDepartmentIndex";
import { GradProgramCard } from "@/components/graduate/GradProgramCard";
import { GraduateBanner } from "@/components/graduate/GraduateBanner";
import { schoolHubHref } from "@/lib/ucsb-coe";
import {
  getGradHubStats,
  getGradProgram,
  getGradSources,
  listGradDepartmentsByDivision,
  listGradDivisions,
  listGradPrograms,
} from "@/lib/ucsb-grad-programs";

export const metadata = {
  title: "UCSB Graduate Programs | iGauchoBack",
  description:
    "MS and PhD programs across UCSB — Graduate Division department index, grad course catalog, and interactive CoE roadmaps.",
};

export default async function UcsbGraduateHubPage() {
  const [
    programs,
    sources,
    stats,
    divisions,
    departmentsByDivision,
  ] = await Promise.all([
    listGradPrograms(),
    getGradSources(),
    getGradHubStats(),
    listGradDivisions(),
    listGradDepartmentsByDivision(),
  ]);

  const programDetails = await Promise.all(
    programs.map(async (program) => ({
      program,
      detail: await getGradProgram(program.slug),
    })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Schools", href: "/schools" },
          { label: "UCSB", href: schoolHubHref("ucsb") },
          { label: "Graduate programs" },
        ]}
        eyebrow="Graduate Division"
        title="UCSB graduate programs"
        description="Official department index, graduate course catalog, and interactive MS/PhD roadmaps for College of Engineering pilots."
      />

      <div className="space-y-14">
        <GraduateBanner
          sources={sources}
          departmentCount={stats.departmentCount}
          roadmapCount={stats.roadmapCount}
        />

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Interactive roadmaps
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              CoE MS and PhD pilot programs with prerequisite graphs.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {programDetails.map(({ program, detail }) => (
              <GradProgramCard
                key={program.slug}
                program={program}
                detail={detail}
              />
            ))}
          </div>
        </section>

        <GradDepartmentIndex
          divisions={divisions}
          departmentsByDivision={departmentsByDivision}
        />
      </div>
    </div>
  );
}
