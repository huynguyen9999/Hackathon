"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ExploreCompareModal } from "@/components/ExploreCompareModal";
import { ExploreFilters } from "@/components/ExploreFilters";
import {
  ExploreGoalLanes,
  GOAL_LANE_PRESETS,
} from "@/components/ExploreGoalLanes";
import { ExploreMajorCard } from "@/components/ExploreMajorCard";
import { SearchBar } from "@/components/SearchBar";
import {
  COLLEGE_LABELS,
  getUniqueDegreeTypes,
  getUniqueDepartments,
} from "@/lib/explore-utils";
import {
  countActiveFilters,
  filterExploreMajors,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/explore-filters";
import type {
  ExploreCollege,
  ExploreFiltersState,
  ExploreMajor,
  ExploreViewMode,
  GoalLaneId,
} from "@/lib/explore-types";

export type ExploreCatalogProps = {
  majors: ExploreMajor[];
  schoolOptions?: { value: string; label: string }[];
};

function groupByCollege(
  majors: ExploreMajor[],
): Record<ExploreCollege, ExploreMajor[]> {
  return {
    engineering: majors.filter((m) => m.college === "engineering"),
    "letters-science": majors.filter((m) => m.college === "letters-science"),
    "creative-studies": majors.filter((m) => m.college === "creative-studies"),
    graduate: majors.filter((m) => m.college === "graduate"),
  };
}

function groupByDepartment(
  majors: ExploreMajor[],
): Record<string, ExploreMajor[]> {
  const groups: Record<string, ExploreMajor[]> = {};
  for (const m of majors) {
    if (!groups[m.department]) groups[m.department] = [];
    groups[m.department].push(m);
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function ActiveFilterChips({
  filters,
  onChange,
}: {
  filters: ExploreFiltersState;
  onChange: (f: ExploreFiltersState) => void;
}) {
  const chips: { label: string; clear: () => void }[] = [];

  for (const c of filters.colleges) {
    chips.push({
      label: COLLEGE_LABELS[c],
      clear: () =>
        onChange({
          ...filters,
          colleges: filters.colleges.filter((x) => x !== c),
        }),
    });
  }
  for (const s of filters.schools) {
    chips.push({
      label: s.toUpperCase(),
      clear: () =>
        onChange({
          ...filters,
          schools: filters.schools.filter((x) => x !== s),
        }),
    });
  }
  for (const t of filters.interestTags) {
    chips.push({
      label: t.replace("-", " "),
      clear: () =>
        onChange({
          ...filters,
          interestTags: filters.interestTags.filter((x) => x !== t),
        }),
    });
  }
  if (filters.graphOnly) {
    chips.push({
      label: "Live graph",
      clear: () => onChange({ ...filters, graphOnly: false }),
    });
  }
  if (filters.undecidedFriendly) {
    chips.push({
      label: "Undecided-friendly",
      clear: () => onChange({ ...filters, undecidedFriendly: false }),
    });
  }
  if (filters.selective !== "all") {
    chips.push({
      label: filters.selective === "selective" ? "Selective" : "Open admission",
      clear: () => onChange({ ...filters, selective: "all" }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1 rounded-full bg-gaucho-blue/10 px-2.5 py-1 text-xs font-medium text-gaucho-blue dark:bg-gaucho-gold/15 dark:text-gaucho-gold"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  );
}

function ExploreEmptyState({
  query,
  hasGraphResults,
}: {
  query: string;
  hasGraphResults: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gaucho-blue/20 bg-gaucho-blue/5 px-6 py-12 text-center dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/30">
      {query ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No majors match &ldquo;{query}&rdquo;. Try clearing filters or
          browsing by interest cluster.
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No majors match your filters.
          </p>
          {!hasGraphResults && (
            <p className="mt-2 text-xs text-slate-500">
              Many majors have a requirements guide even without an interactive
              graph yet.
            </p>
          )}
        </>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/schools" className="btn-secondary text-xs">
          Browse school hubs
        </Link>
        <Link href="/contribute" className="btn-primary text-xs">
          Help build a graph
        </Link>
      </div>
    </div>
  );
}

function NoGraphBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="mb-4 rounded-lg border border-gaucho-gold/25 bg-gaucho-gold/10 px-4 py-3 text-sm text-gaucho-blue-dark dark:text-gaucho-gold-light">
      {count} major{count !== 1 ? "s" : ""} in your results{" "}
      {count !== 1 ? "don't" : "doesn't"} have an interactive graph yet—open the{" "}
      <strong>major guide</strong> for requirements, or{" "}
      <Link href="/contribute" className="font-medium underline">
        contribute
      </Link>{" "}
      to help build one.
    </div>
  );
}

export function ExploreCatalog({ majors, schoolOptions = [] }: ExploreCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const [filters, setFilters] = useState<ExploreFiltersState>(initialFilters);
  const [activeLane, setActiveLane] = useState<GoalLaneId | null>(null);
  const [compareQueue, setCompareQueue] = useState<ExploreMajor[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const departments = useMemo(() => getUniqueDepartments(majors), [majors]);
  const degreeTypes = useMemo(() => getUniqueDegreeTypes(majors), [majors]);

  const effectiveFilters = useMemo(() => {
    if (!activeLane) return filters;
    return { ...filters, ...GOAL_LANE_PRESETS[activeLane] };
  }, [filters, activeLane]);

  const filtered = useMemo(
    () => filterExploreMajors(majors, effectiveFilters),
    [majors, effectiveFilters],
  );

  const noGraphCount = filtered.filter((m) => !m.hasInteractiveGraph).length;

  const pushFilters = useCallback(
    (next: ExploreFiltersState) => {
      setFilters(next);
      setActiveLane(null);
      const qs = filtersToSearchParams(next).toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    },
    [router],
  );

  const handleSearch = useCallback(
    (q: string) => {
      pushFilters({ ...filters, query: q });
    },
    [filters, pushFilters],
  );

  const handleLane = (lane: GoalLaneId | null) => {
    setActiveLane(lane);
  };

  const handleCompare = (major: ExploreMajor) => {
    setCompareQueue((prev) => {
      if (prev.some((m) => m.id === major.id)) return prev;
      const next = [...prev, major].slice(-2);
      return next;
    });
  };

  const comparePair: [ExploreMajor, ExploreMajor] | null =
    compareQueue.length === 2
      ? [compareQueue[0], compareQueue[1]]
      : null;

  const setView = (view: ExploreViewMode) => {
    pushFilters({ ...filters, view });
  };

  const renderGrid = (items: ExploreMajor[]) => (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((major) => (
        <li key={major.id}>
          <ExploreMajorCard
            major={major}
            onCompare={handleCompare}
            compareDisabled={
              compareQueue.length >= 2 &&
              !compareQueue.some((m) => m.id === major.id)
            }
          />
        </li>
      ))}
    </ul>
  );

  const renderResults = () => {
    if (filtered.length === 0) {
      return (
        <ExploreEmptyState
          query={effectiveFilters.query}
          hasGraphResults={majors.some((m) => m.hasInteractiveGraph)}
        />
      );
    }

    if (effectiveFilters.view === "college") {
      const byCollege = groupByCollege(filtered);
      return (
        <div className="space-y-8">
          {(Object.keys(byCollege) as ExploreCollege[]).map((college) => {
            const items = byCollege[college];
            if (items.length === 0) return null;
            return (
              <section key={college}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
                  {COLLEGE_LABELS[college]} ({items.length})
                </h2>
                {renderGrid(items)}
              </section>
            );
          })}
        </div>
      );
    }

    if (effectiveFilters.view === "department") {
      const byDept = groupByDepartment(filtered);
      return (
        <div className="space-y-4">
          {Object.entries(byDept).map(([dept, items]) => (
            <details
              key={dept}
              className="rounded-lg border border-gaucho-blue/10 bg-white dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30"
              open={Object.keys(byDept).length <= 8}
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gaucho-blue dark:text-white">
                {dept} ({items.length})
              </summary>
              <div className="border-t border-gaucho-blue/10 p-4 dark:border-gaucho-gold/10">
                {renderGrid(items)}
              </div>
            </details>
          ))}
        </div>
      );
    }

    return renderGrid(filtered);
  };

  return (
    <>
      <ExploreGoalLanes activeLane={activeLane} onSelectLane={handleLane} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          onSearch={handleSearch}
          defaultValue={filters.query}
          className="w-full sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filtered.length} of {majors.length} majors
          </span>
          {countActiveFilters(effectiveFilters) > 0 && (
            <span className="rounded-full bg-gaucho-gold/20 px-2 py-0.5 text-xs font-medium text-gaucho-blue-dark dark:text-gaucho-gold">
              {countActiveFilters(effectiveFilters)} filters
            </span>
          )}
          {compareQueue.length > 0 && (
            <button
              type="button"
              onClick={() => setCompareQueue([])}
              className="text-xs text-slate-500 hover:text-gaucho-blue"
            >
              Clear compare ({compareQueue.length}/2)
            </button>
          )}
        </div>
      </div>

      <ActiveFilterChips filters={effectiveFilters} onChange={pushFilters} />

      <div className="mb-4 mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">View:</span>
        {(
          [
            ["grid", "Grid"],
            ["college", "By college"],
            ["department", "By department"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={[
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              effectiveFilters.view === mode
                ? "bg-gaucho-blue text-white dark:bg-gaucho-gold dark:text-gaucho-blue-dark"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gaucho-blue/40",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto text-xs font-medium text-gaucho-blue dark:text-gaucho-gold lg:hidden"
          onClick={() => setMobileFiltersOpen((o) => !o)}
        >
          {mobileFiltersOpen ? "Hide filters" : "Show filters"}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div
          className={[
            "lg:w-64 lg:shrink-0",
            mobileFiltersOpen ? "block" : "hidden lg:block",
          ].join(" ")}
        >
          <ExploreFilters
            filters={filters}
            departments={departments}
            degreeTypes={degreeTypes}
            schoolOptions={schoolOptions}
            onChange={pushFilters}
          />
        </div>

        <div className="min-w-0 flex-1">
          <NoGraphBanner count={noGraphCount} />
          {renderResults()}
        </div>
      </div>

      <ExploreCompareModal
        majors={comparePair}
        onClose={() => setCompareQueue([])}
      />
    </>
  );
}
