"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { filterSchoolsByQuery } from "@/lib/school-search";

export type SchoolHubCardData = {
  short_name: string;
  name: string;
  location: string;
  collegesLabel: string;
  collegeCount?: number;
  majorCount?: number;
  liveGraphs?: number;
  preview?: boolean;
};

export type SchoolHubSectionProps = {
  schools: SchoolHubCardData[];
  variant?: "home" | "page";
};

function isEarlyPreview(school: SchoolHubCardData): boolean {
  return school.preview === true || (school.liveGraphs ?? 0) <= 2;
}

function EarlyPreviewBadge() {
  return (
    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
      Early preview
    </span>
  );
}

function HomeSchoolCard({ school }: { school: SchoolHubCardData }) {
  const majorCount = school.majorCount ?? 0;
  const liveGraphs = school.liveGraphs ?? 0;

  return (
    <Link
      href={`/schools/${school.short_name}`}
      className="card-glow group flex flex-col rounded-lg border border-gaucho-blue/15 bg-white p-6 transition hover:border-gaucho-gold/40 dark:bg-gaucho-blue-dark/50"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue-light dark:text-gaucho-gold">
          {school.location}
        </p>
        {isEarlyPreview(school) ? <EarlyPreviewBadge /> : null}
      </div>
      <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
        {school.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {majorCount > 0
          ? `${majorCount} majors cataloged`
          : school.collegesLabel}
        {liveGraphs > 0
          ? ` · ${liveGraphs} live roadmap${liveGraphs !== 1 ? "s" : ""}`
          : ""}
      </p>
      <span className="mt-4 text-sm font-medium text-gaucho-blue group-hover:text-gaucho-gold dark:text-gaucho-gold">
        Open community hub →
      </span>
    </Link>
  );
}

function PageSchoolCard({ school }: { school: SchoolHubCardData }) {
  const collegeCount = school.collegeCount ?? 0;
  const majorCount = school.majorCount ?? 0;
  const liveGraphs = school.liveGraphs ?? 0;

  return (
    <Link
      href={`/schools/${school.short_name}`}
      className="card-glow group rounded-xl border border-gaucho-blue/20 bg-white p-8 transition hover:border-gaucho-gold/40 dark:bg-gaucho-blue-dark/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
          {school.location}
        </p>
        {isEarlyPreview(school) ? <EarlyPreviewBadge /> : null}
      </div>
      <h2 className="mt-2 text-2xl font-bold text-gaucho-blue dark:text-white group-hover:text-gaucho-gold">
        {school.name}
      </h2>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {majorCount} majors cataloged
        {liveGraphs > 0
          ? ` · ${liveGraphs} live roadmap${liveGraphs !== 1 ? "s" : ""}`
          : ""}
        {collegeCount > 0
          ? ` · ${collegeCount} college${collegeCount !== 1 ? "s" : ""}`
          : ""}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-gaucho-blue dark:text-gaucho-gold">
        Open hub →
      </span>
    </Link>
  );
}

function SchoolHubEmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gaucho-blue/20 bg-gaucho-blue/5 px-6 py-12 text-center dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/30">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        No schools match &ldquo;{query}&rdquo;. Try UCSB or UCLA, or clear your
        search.
      </p>
    </div>
  );
}

export function SchoolHubSection({
  schools,
  variant = "home",
}: SchoolHubSectionProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const filtered = useMemo(
    () => filterSchoolsByQuery(schools, query),
    [schools, query],
  );

  const searchBar = (
    <SearchBar
      onSearch={handleSearch}
      placeholder="Search by school name..."
      label="Search schools"
      inputId={variant === "home" ? "school-hub-search-home" : "school-hub-search-page"}
      className="w-full sm:max-w-xs"
    />
  );

  const countLabel =
    query.trim().length > 0 ? (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {filtered.length} of {schools.length} school
        {schools.length !== 1 ? "s" : ""}
      </p>
    ) : null;

  const grid =
    filtered.length === 0 ? (
      <SchoolHubEmptyState query={query} />
    ) : (
      <div
        className={
          variant === "home"
            ? "grid gap-4 sm:grid-cols-2"
            : "grid gap-6 md:grid-cols-2"
        }
      >
        {filtered.map((school) =>
          variant === "home" ? (
            <HomeSchoolCard key={school.short_name} school={school} />
          ) : (
            <PageSchoolCard key={school.short_name} school={school} />
          ),
        )}
      </div>
    );

  if (variant === "page") {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: "Schools" }]}
          title="School hubs"
          description="Pick your university to explore community features, major catalogs, and interactive roadmaps."
          actions={searchBar}
        />
        {countLabel && <div className="mb-4">{countLabel}</div>}
        {grid}
      </>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
          School hubs
        </h2>
        {searchBar}
      </div>
      {countLabel && <div className="mb-4">{countLabel}</div>}
      {grid}
    </section>
  );
}
