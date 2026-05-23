import Link from "next/link";
import { notFound } from "next/navigation";

import { GearBanner } from "@/components/GearBanner";
import { MajorCatalogGrid } from "@/components/MajorCatalogGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { SchoolHero } from "@/components/SchoolHero";
import { SourceList } from "@/components/SourceList";
import { loadUcsbCoeCatalog } from "@/lib/ucsb-coe";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "School | AcadMap" };
  }
  const catalog = await loadUcsbCoeCatalog();
  return {
    title: `${catalog?.school.college ?? "UCSB"} | AcadMap`,
    description: `Browse ${catalog?.majors.length ?? 5} engineering majors at UC Santa Barbara.`,
  };
}

export default async function SchoolHubPage({ params }: PageProps) {
  const { school } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const catalog = await loadUcsbCoeCatalog();
  if (!catalog) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: catalog.school.short_name.toUpperCase() },
        ]}
        eyebrow="School hub"
        title={catalog.school.college}
        description="Requirements from the 2025-26 GEAR PDF—prep, upper-division, and electives for all five BS engineering majors."
      />

      <div className="space-y-12">
        <GearBanner gear={catalog.gear} />
        <SchoolHero catalog={catalog} />

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">
                Engineering majors
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a major to open an interactive graph or the official
                curriculum page.
              </p>
            </div>
            <Link
              href="/contribute"
              className="text-sm font-medium text-indigo-300 transition hover:text-violet-200"
            >
              Contribute a roadmap →
            </Link>
          </div>
          <MajorCatalogGrid
            schoolShortName={catalog.school.short_name}
            majors={catalog.majors}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SourceList sources={catalog.sources} />
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-300/80">
              For AI agents
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Catalog data lives in{" "}
              <code className="rounded bg-slate-900 px-1 text-xs">
                data/ucsb/coe-catalog.json
              </code>
              . Interactive graphs use{" "}
              <code className="rounded bg-slate-900 px-1 text-xs">
                data/seeds/
              </code>
              . See{" "}
              <code className="rounded bg-slate-900 px-1 text-xs">
                docs/SITE-LAYOUT.md
              </code>{" "}
              for page structure and delegation roles.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
