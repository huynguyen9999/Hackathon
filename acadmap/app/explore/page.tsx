import Link from "next/link";

import { ExploreCatalog } from "@/components/ExploreCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { getApprovedRoadmapList } from "@/lib/roadmap";

export const metadata = {
  title: "Explore | AcadMap",
  description: "Browse degree roadmaps by school and major.",
};

export default async function ExplorePage() {
  const roadmaps = await getApprovedRoadmapList();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Explore" }]}
        title="Explore roadmaps"
        description="Search by school or major. Each card opens an interactive graph of courses, prerequisites, and career paths."
        actions={
          <Link
            href="/schools/ucsb"
            className="rounded-xl border border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-sm font-medium text-indigo-800 dark:text-indigo-200 transition hover:bg-indigo-900/50"
          >
            UCSB colleges
          </Link>
        }
      />

      <ExploreCatalog roadmaps={roadmaps} />
    </div>
  );
}
