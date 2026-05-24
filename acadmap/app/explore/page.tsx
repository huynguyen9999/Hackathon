import Link from "next/link";

import { ExploreCatalog } from "@/components/ExploreCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { filtersFromSearchParams } from "@/lib/explore-filters";
import { loadExploreIndex } from "@/lib/school-catalog";
import { listActiveSchools } from "@/lib/schools/registry";

export const metadata = {
  title: "Explore | iGauchoBack",
  description:
    "Discover majors across schools—filter by campus, college, interest, and interactive graph availability.",
};

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function toURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    }
  }
  return params;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const urlParams = toURLSearchParams(searchParams);
  const initialFilters = filtersFromSearchParams(urlParams);

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

      <ExploreCatalog
        key={urlParams.toString()}
        majors={majors}
        schoolOptions={schoolOptions}
        initialFilters={initialFilters}
      />
    </div>
  );
}
