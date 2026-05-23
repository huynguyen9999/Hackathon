import { ExploreCatalog } from "@/components/ExploreCatalog";
import { getApprovedRoadmapList } from "@/lib/roadmap";

export const metadata = {
  title: "Explore | AcadMap",
  description: "Browse degree roadmaps by school and major.",
};

export default async function ExplorePage() {
  const roadmaps = await getApprovedRoadmapList();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Explore roadmaps
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Search by school or major. Each card opens an interactive graph of
          courses, prerequisites, and career paths.
        </p>
      </header>

      <ExploreCatalog roadmaps={roadmaps} />
    </div>
  );
}
