import Link from "next/link";
import { notFound } from "next/navigation";

import { RoadmapView } from "@/components/RoadmapView";
import { getRoadmapBySlug } from "@/lib/roadmap";

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

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/explore"
            className="mb-2 inline-flex text-xs font-medium text-indigo-300/80 transition hover:text-indigo-200"
          >
            ← Back to explore
          </Link>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-300">
            {roadmap.school.short_name} · {roadmap.major.degree_type}
          </p>
          <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">
            {roadmap.major.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{roadmap.school.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-lg border border-indigo-500/25 bg-slate-900/60 px-2.5 py-1">
            {roadmap.nodes.length} nodes
          </span>
          <span className="rounded-lg border border-indigo-500/25 bg-slate-900/60 px-2.5 py-1">
            {roadmap.edges.length} edges
          </span>
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-emerald-200">
            v{roadmap.version} · {roadmap.status}
          </span>
        </div>
      </header>

      <RoadmapView roadmap={roadmap} />
    </div>
  );
}
