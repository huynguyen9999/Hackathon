import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { coeCollegeHubHref, loadUcsbCoeCatalog, schoolHubHref } from "@/lib/ucsb-coe";
import { ccsCollegeHubHref, loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbLsCatalog, lsCollegeHubHref } from "@/lib/ucsb-ls";

type PageProps = {
  params: { school: string };
};

export async function generateMetadata({ params }: PageProps) {
  if (params.school !== "ucsb") {
    return { title: "School | AcadMap" };
  }
  return {
    title: "UC Santa Barbara | AcadMap",
    description:
      "Browse UCSB College of Engineering (GEAR), College of Letters & Science (LASAR), and College of Creative Studies (CCS) major requirements.",
  };
}

const COLLEGE_CARDS = [
  {
    slug: "engineering",
    href: (s: string) => coeCollegeHubHref(s),
    accent: "indigo",
    title: "College of Engineering",
    subtitle: "Robert Mehrabian College of Engineering",
    description:
      "5 BS majors · GEAR 2025-26 PDF · Interactive EE roadmap",
    stats: (coeCount: number, live: number) =>
      `${coeCount} majors · ${live} live graph${live !== 1 ? "s" : ""}`,
  },
  {
    slug: "letters-science",
    href: (s: string) => lsCollegeHubHref(s),
    accent: "teal",
    title: "College of Letters & Science",
    subtitle: "80+ majors across 45+ departments",
    description:
      "LASAR + DUELS · Prep, upper-division, electives for popular majors",
    stats: (lsCount: number) => `${lsCount} majors cataloged`,
  },
  {
    slug: "creative-studies",
    href: (s: string) => ccsCollegeHubHref(s),
    accent: "amber",
    title: "College of Creative Studies",
    subtitle: "9 selective majors · research from day one",
    description:
      "Major sheets, admission requirements, and 4-year plans for all CCS majors",
    stats: (ccsCount: number) => `${ccsCount} majors with detail pages`,
  },
] as const;

export default async function UcsbOverviewPage({ params }: PageProps) {
  const { school } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const coe = await loadUcsbCoeCatalog();
  const ls = await loadUcsbLsCatalog();
  const ccs = await loadUcsbCcsCatalog();

  if (!coe || !ls || !ccs) {
    notFound();
  }

  const coeLive = coe.majors.filter((m) => m.roadmap_available).length;
  const shortName = coe.school.short_name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        breadcrumbs={[{ label: "Explore", href: "/explore" }, { label: "UCSB" }]}
        eyebrow="UC Santa Barbara"
        title="Choose your college"
        description="AcadMap catalogs graduation requirements from official UCSB sources—GEAR for Engineering, LASAR/DUELS for Letters & Science, and CCS major sheets for Creative Studies."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COLLEGE_CARDS.map((card) => {
          const isEng = card.slug === "engineering";
          const isCcs = card.slug === "creative-studies";
          const border =
            card.accent === "teal"
              ? "border-teal-500/25 hover:border-teal-400/40"
              : card.accent === "amber"
                ? "border-amber-500/25 hover:border-amber-400/40"
                : "border-indigo-500/25 hover:border-violet-400/40";
          const stat = isEng
            ? card.stats(coe.majors.length, coeLive)
            : isCcs
              ? card.stats(ccs.majors.length)
              : card.stats(ls.majors.length);

          return (
            <Link
              key={card.slug}
              href={card.href(shortName)}
              className={`card-glow group flex flex-col rounded-2xl border bg-slate-900/60 p-8 transition ${border}`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  card.accent === "teal"
                    ? "text-teal-300"
                    : card.accent === "amber"
                      ? "text-amber-300"
                      : "text-violet-300"
                }`}
              >
                {card.subtitle}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50 group-hover:text-indigo-100">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-slate-400">
                {card.description}
              </p>
              <p
                className={`mt-4 text-sm font-medium ${
                  card.accent === "teal"
                    ? "text-teal-300"
                    : card.accent === "amber"
                      ? "text-amber-300"
                      : "text-indigo-300"
                }`}
              >
                {stat} →
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-slate-500">
        Sources:{" "}
        <a
          href="https://admissions.sa.ucsb.edu/majors"
          className="text-indigo-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          UCSB Admissions
        </a>
        {" · "}
        <a
          href={schoolHubHref(shortName)}
          className="text-indigo-400 hover:underline"
        >
          AcadMap UCSB hub
        </a>
      </p>
    </div>
  );
}
