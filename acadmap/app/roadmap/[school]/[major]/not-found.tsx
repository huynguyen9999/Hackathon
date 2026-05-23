import Link from "next/link";

export default function RoadmapNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Roadmap not found</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        We don&apos;t have a roadmap for that school and major yet. Browse
        available maps or contribute one.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/explore"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Explore
        </Link>
        <Link
          href="/contribute"
          className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-semibold text-indigo-900 dark:text-indigo-100 hover:bg-white dark:bg-slate-900"
        >
          Contribute
        </Link>
      </div>
    </div>
  );
}
