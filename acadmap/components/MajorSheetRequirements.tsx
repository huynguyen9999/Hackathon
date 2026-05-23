import type {
  RequirementBlock,
  CourseRef,
} from "@/lib/ucsb-major-detail-types";

function CourseRow({ course }: { course: CourseRef }) {
  const alt =
    course.alternatives?.length &&
    ` (or ${course.alternatives.join(", ")})`;
  return (
    <li className="flex flex-col gap-0.5 text-sm text-slate-300">
      <span>
        <span className="font-mono text-indigo-200">{course.code}</span>
        {course.title && (
          <span className="text-slate-400"> — {course.title}</span>
        )}
        {course.units != null && (
          <span className="text-slate-500"> · {course.units} units</span>
        )}
        {alt ? <span className="text-slate-500">{alt}</span> : null}
      </span>
      {course.notes && (
        <span className="text-xs text-slate-500">{course.notes}</span>
      )}
    </li>
  );
}

function BlockSection({ block }: { block: RequirementBlock }) {
  const unitLabel =
    block.units != null
      ? `${block.units} units`
      : block.unit_range
        ? `${block.unit_range} units`
        : block.choose_units
          ? `${block.choose_units} units required`
          : null;

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-slate-950/40 p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100">{block.label}</h3>
        {unitLabel && (
          <span className="text-xs text-indigo-300/80">{unitLabel}</span>
        )}
      </div>
      {block.choose_n != null && (
        <p className="mb-2 text-xs text-slate-500">
          Choose {block.choose_n} from:
        </p>
      )}
      <ul className="space-y-2">
        {block.courses.map((c) => (
          <CourseRow key={c.code} course={c} />
        ))}
      </ul>
      {block.notes?.map((note) => (
        <p key={note} className="mt-3 text-xs text-amber-100/80">
          {note}
        </p>
      ))}
    </div>
  );
}

export type MajorSheetRequirementsProps = {
  detail: {
    catalog_year: string;
    pre_major?: RequirementBlock;
    preparation: RequirementBlock;
    upper_division: RequirementBlock[];
    electives?: RequirementBlock;
    science_courses?: RequirementBlock;
    notes?: string[];
  };
};

export function MajorSheetRequirements({ detail }: MajorSheetRequirementsProps) {
  return (
    <div className="card-glow rounded-2xl border border-teal-500/20 bg-slate-900/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-50">
          Official major sheet — {detail.catalog_year}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Parsed from department major sheet. Verify on GOLD progress check.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {detail.pre_major && <BlockSection block={detail.pre_major} />}
        <BlockSection block={detail.preparation} />
      </div>

      <div className="mt-5 grid gap-5">
        {detail.upper_division.map((block) => (
          <BlockSection key={block.label} block={block} />
        ))}
        {detail.electives && <BlockSection block={detail.electives} />}
        {"science_courses" in detail && detail.science_courses && (
          <BlockSection block={detail.science_courses} />
        )}
      </div>

      {detail.notes?.length ? (
        <ul className="mt-5 space-y-1 text-xs text-slate-500">
          {detail.notes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
