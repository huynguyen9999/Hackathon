"use client";

import type { UcsbCourseLevel, UcsbQuarter, UcsbSubject } from "@/lib/ucsb-curriculum-types";

export type CourseSearchFormProps = {
  subjects: UcsbSubject[];
  quarters: UcsbQuarter[];
  quarter: string;
  subject: string;
  level: UcsbCourseLevel;
  query: string;
  onQuarterChange: (quarter: string) => void;
  onSubjectChange: (subject: string) => void;
  onLevelChange: (level: UcsbCourseLevel) => void;
  onQueryChange: (query: string) => void;
};

const LEVEL_OPTIONS: { value: UcsbCourseLevel; label: string }[] = [
  { value: "U", label: "Undergraduate" },
  { value: "G", label: "Graduate" },
  { value: "A", label: "All" },
];

export function CourseSearchForm({
  subjects,
  quarters,
  quarter,
  subject,
  level,
  query,
  onQuarterChange,
  onSubjectChange,
  onLevelChange,
  onQueryChange,
}: CourseSearchFormProps) {
  return (
    <form
      className="grid gap-4 rounded-xl border border-gaucho-blue-light/25 bg-white p-5 dark:border-gaucho-gold/20 dark:bg-slate-900/60 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Subject area
        </span>
        <select
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="rounded-lg border border-gaucho-blue/20 bg-slate-50 px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        >
          {subjects.map((s) => (
            <option key={s.subjectCode} value={s.subjectCode}>
              {s.subjectCode} — {s.subjectTranslation}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Quarter
        </span>
        <select
          value={quarter}
          onChange={(e) => onQuarterChange(e.target.value)}
          className="rounded-lg border border-gaucho-blue/20 bg-slate-50 px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        >
          {quarters.map((q) => (
            <option key={q.code} value={q.code}>
              {q.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Course level
        </legend>
        <div className="flex flex-wrap gap-1 rounded-lg border border-gaucho-blue/15 bg-slate-50 p-1 dark:border-gaucho-gold/15 dark:bg-slate-800">
          {LEVEL_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onLevelChange(value)}
              className={[
                "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition",
                level === value
                  ? value === "G"
                    ? "bg-violet-600 text-white"
                    : "bg-gaucho-blue text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
                  : "text-slate-600 hover:text-gaucho-blue dark:text-slate-300 dark:hover:text-gaucho-gold-light",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
          Filter results
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by course code or title…"
          className="rounded-lg border border-gaucho-blue/20 bg-slate-50 px-3 py-2 text-sm dark:border-gaucho-gold/20 dark:bg-slate-800"
        />
      </label>
    </form>
  );
}
