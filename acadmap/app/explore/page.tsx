import Link from "next/link";
import { Suspense } from "react";

import { ExploreCatalog } from "@/components/ExploreCatalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { loadUcsbExploreIndex } from "@/lib/ucsb-explore-index";

export const metadata = {
  title: "Explore | iGauchoBack",
  description:
    "Discover all UCSB majors—filter by college, interest, and interactive graph availability.",
};

function ExploreCatalogFallback() {
  return (
    <p className="text-sm text-slate-500">Loading majors catalog…</p>
  );
}

export default async function ExplorePage() {
  const majors = await loadUcsbExploreIndex();
  const graphCount = majors.filter((m) => m.hasInteractiveGraph).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Explore" }]}
        title="Explore majors"
        description={`All ${majors.length} UCSB catalog majors across Engineering, L&S, and CCS. ${graphCount} have interactive graphs—use filters to discover by interest, college, or career path.`}
        actions={
          <Link href="/schools/ucsb" className="btn-secondary text-sm">
            UCSB colleges
          </Link>
        }
      />

      <Suspense fallback={<ExploreCatalogFallback />}>
        <ExploreCatalog majors={majors} />
      </Suspense>
    </div>
  );
}
