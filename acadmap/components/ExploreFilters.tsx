"use client";

import type {
  ExploreCollege,
  ExploreFiltersState,
  ExperienceType,
  InterestTag,
} from "@/lib/explore-types";

const COLLEGE_OPTIONS: { value: ExploreCollege; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "letters-science", label: "L&S" },
  { value: "creative-studies", label: "CCS" },
  { value: "graduate", label: "Graduate" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceType; label: string }[] = [
  { value: "graph", label: "Interactive graph" },
  { value: "guide", label: "Major guide" },
  { value: "catalog", label: "Catalog entry" },
];

const INTEREST_OPTIONS: { value: InterestTag; label: string }[] = [
  { value: "stem", label: "STEM" },
  { value: "social-sciences", label: "Social sciences" },
  { value: "arts-humanities", label: "Arts & humanities" },
  { value: "pre-professional", label: "Pre-professional" },
];

export type ExploreFiltersProps = {
  filters: ExploreFiltersState;
  departments: string[];
  degreeTypes: string[];
  schoolOptions?: { value: string; label: string }[];
  onChange: (next: ExploreFiltersState) => void;
  className?: string;
};

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-2.5 py-1 text-xs font-medium transition",
        active
          ? "bg-gaucho-blue text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
          : "border border-gaucho-blue/15 bg-white text-slate-600 hover:border-gaucho-blue/30 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/40 dark:text-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ExploreFilters({
  filters,
  departments,
  degreeTypes,
  schoolOptions = [],
  onChange,
  className = "",
}: ExploreFiltersProps) {
  const patch = (partial: Partial<ExploreFiltersState>) =>
    onChange({ ...filters, ...partial });

  return (
    <aside
      className={`space-y-6 rounded-lg border border-gaucho-blue/10 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30 ${className}`}
    >
      {schoolOptions.length > 0 ? (
        <FilterSection title="School">
          {schoolOptions.map(({ value, label }) => (
            <Chip
              key={value}
              active={filters.schools.includes(value)}
              onClick={() =>
                patch({ schools: toggleInList(filters.schools, value) })
              }
            >
              {label.replace("UC ", "")}
            </Chip>
          ))}
        </FilterSection>
      ) : null}

      <FilterSection title="College">
        {COLLEGE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            active={filters.colleges.includes(value)}
            onClick={() =>
              patch({ colleges: toggleInList(filters.colleges, value) })
            }
          >
            {label}
          </Chip>
        ))}
      </FilterSection>

      <FilterSection title="Experience">
        {EXPERIENCE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            active={filters.experience.includes(value)}
            onClick={() =>
              patch({ experience: toggleInList(filters.experience, value) })
            }
          >
            {label}
          </Chip>
        ))}
      </FilterSection>

      <FilterSection title="Interest">
        {INTEREST_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            active={filters.interestTags.includes(value)}
            onClick={() =>
              patch({
                interestTags: toggleInList(filters.interestTags, value),
              })
            }
          >
            {label}
          </Chip>
        ))}
      </FilterSection>

      {degreeTypes.length > 0 && (
        <FilterSection title="Degree">
          {degreeTypes.map((dt) => (
            <Chip
              key={dt}
              active={filters.degreeTypes.includes(dt)}
              onClick={() =>
                patch({
                  degreeTypes: toggleInList(filters.degreeTypes, dt),
                })
              }
            >
              {dt}
            </Chip>
          ))}
        </FilterSection>
      )}

      <FilterSection title="Admission">
        {(
          [
            ["all", "All"],
            ["open", "Open"],
            ["selective", "Selective"],
          ] as const
        ).map(([value, label]) => (
          <Chip
            key={value}
            active={filters.selective === value}
            onClick={() => patch({ selective: value })}
          >
            {label}
          </Chip>
        ))}
      </FilterSection>

      <FilterSection title="Quick">
        <Chip
          active={filters.graphOnly}
          onClick={() => patch({ graphOnly: !filters.graphOnly })}
        >
          Has live graph
        </Chip>
        <Chip
          active={filters.undecidedFriendly}
          onClick={() =>
            patch({ undecidedFriendly: !filters.undecidedFriendly })
          }
        >
          Undecided-friendly
        </Chip>
      </FilterSection>

      {departments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
            Department
          </h3>
          <select
            multiple
            value={filters.departments}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (o) => o.value,
              );
              patch({ departments: selected });
            }}
            className="h-28 w-full rounded-md border border-gaucho-blue/15 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50 dark:text-slate-200"
            aria-label="Filter by department"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500">Hold Cmd/Ctrl to select multiple</p>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...filters,
            colleges: [],
            experience: [],
            degreeTypes: [],
            selective: "all",
            departments: [],
            interestTags: [],
            graphOnly: false,
            undecidedFriendly: false,
            query: filters.query,
          })
        }
        className="w-full rounded-md border border-gaucho-blue/15 py-2 text-xs font-medium text-slate-600 transition hover:bg-gaucho-blue/5 dark:border-gaucho-gold/20 dark:text-slate-400"
      >
        Clear filters
      </button>
    </aside>
  );
}
