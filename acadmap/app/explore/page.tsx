import Link from "next/link";
import { Suspense } from "react";

import { ExploreCatalog } from "@/components/ExploreCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadExploreIndex } from "@/lib/school-catalog";
import { listActiveSchools } from "@/lib/schools/registry";

export const metadata = {
  title: "Explore | iGauchoBack",
  description:
    "Discover majors across schools—filter by campus, college, interest, and interactive graph availability.",
};

function ExploreCatalogFallback() {
  return (
    <p className="text-sm text-slate-500">Loading majors catalog…</p>
  );
}

export default async function ExplorePage() {
  const [majors, schools] = await Promise.all([
    loadExploreIndex(),
    listActiveSchools(),
  ]);
  const graphCount = majors.filter((m) => m.hasInteractiveGraph).length;
  const schoolOptions = schools.map((s) => ({
    value: s.short_name,
    label: s.name,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Explore" }]}
        title="Explore majors"
        description={`${majors.length} catalog majors across ${schools.length} schools. ${graphCount} have interactive graphs—use filters to discover by campus, interest, college, or career path.`}
        actions={
          <Link href="/schools" className="btn-secondary text-sm">
            School hubs
          </Link>
        }
      />

      <Suspense fallback={<ExploreCatalogFallback />}>
        <ExploreCatalog majors={majors} schoolOptions={schoolOptions} />
      </Suspense>
    </div>
  );
}
