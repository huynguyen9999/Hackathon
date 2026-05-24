"use client";

export type GradesSearchFormProps = {
  departments: string[];
  dept: string;
  query: string;
  sort: "avgGpa" | "offerings" | "name";
  onDeptChange: (dept: string) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: "avgGpa" | "offerings" | "name") => void;
};

export function GradesSearchForm({
  departments,
  dept,
  query,
  sort,
  onDeptChange,
  onQueryChange,
  onSortChange,
}: GradesSearchFormProps) {
  return (
    <form
      className="grid gap-4 rounded-xl border border-gaucho-blue-light/25 bg-white p-5 dark:border-gaucho-gold/20 dark:bg-slate-900/60 sm:grid-cols-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Department
        </span>
        <select
          value={dept}
          onChange={(e) => onDeptChange(e.target.value)}
          className="rounded-lg border border-gaucho-blue/20 bg-slate-50 px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Search courses
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. ECE 130A, CMPSC 16…"
          className="rounded-lg border border-gaucho-blue/20 bg-slate-50 px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Sort by
        </span>
        <div className="flex flex-wrap gap-1 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-1 dark:border-gaucho-gold/15 dark:bg-slate-800">
          {(
            [
              ["name", "Name"],
              ["avgGpa", "Avg GPA"],
              ["offerings", "Offerings"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSortChange(value)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                sort === value
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </label>
    </form>
  );
}
