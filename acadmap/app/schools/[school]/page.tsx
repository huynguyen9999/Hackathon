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
    return { title: "School | iGauchoBack" };
  }
  return {
    title: "UC Santa Barbara | iGauchoBack",
    description:
      "Browse UCSB College of Engineering (GEAR), College of Letters & Science (LASAR), and College of Creative Studies (CCS) major requirements.",
  };
}

const COLLEGE_CARDS = [
  {
    slug: "engineering",
    href: (s: string) => coeCollegeHubHref(s),
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
    title: "College of Letters & Science",
    subtitle: "80+ majors across 45+ departments",
    description:
      "LASAR + DUELS · Prep, upper-division, electives for popular majors",
    stats: (lsCount: number) => `${lsCount} majors cataloged`,
  },
  {
    slug: "creative-studies",
    href: (s: string) => ccsCollegeHubHref(s),
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
        description="iGauchoBack catalogs graduation requirements from official UCSB sources—GEAR for Engineering, LASAR/DUELS for Letters & Science, and CCS major sheets for Creative Studies."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COLLEGE_CARDS.map((card) => {
          const isEng = card.slug === "engineering";
          const isCcs = card.slug === "creative-studies";
          const border =
            "border-gaucho-blue/20 hover:border-gaucho-gold/40";
          const stat = isEng
            ? card.stats(coe.majors.length, coeLive)
            : isCcs
              ? card.stats(ccs.majors.length)
              : card.stats(ls.majors.length);

          return (
            <Link
              key={card.slug}
              href={card.href(shortName)}
              className={`card-glow group flex flex-col rounded-lg border bg-white p-8 transition dark:bg-gaucho-blue-dark/40 ${border}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gaucho-gold-dark dark:text-gaucho-gold">
                {card.subtitle}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gaucho-blue group-hover:text-gaucho-blue-light dark:text-white dark:group-hover:text-gaucho-gold">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {card.description}
              </p>
              <p className="mt-4 text-sm font-medium text-gaucho-blue dark:text-gaucho-gold">
                {stat} →
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-slate-900 dark:text-slate-500">
        Sources:{" "}
        <a
          href="https://admissions.sa.ucsb.edu/majors"
          className="text-gaucho-blue hover:underline dark:text-gaucho-gold"
          target="_blank"
          rel="noopener noreferrer"
        >
          UCSB Admissions
        </a>
        {" · "}
        <a
          href={schoolHubHref(shortName)}
          className="text-gaucho-blue hover:underline dark:text-gaucho-gold"
        >
          iGauchoBack UCSB hub
        </a>
      </p>
    </div>
  );
}
