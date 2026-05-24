import { SchoolHubSection } from "@/components/SchoolHubSection";
import { loadCoeCatalog } from "@/lib/school-catalog";
import { loadUcsbCcsCatalog } from "@/lib/ucsb-ccs";
import { loadUcsbLsCatalog } from "@/lib/ucsb-ls";
import { listActiveSchools } from "@/lib/schools/registry";

export const metadata = {
  title: "Schools | iGauchoBack",
  description: "Browse degree planning hubs for universities across the US.",
};

export default async function SchoolsIndexPage() {
  const schools = await listActiveSchools();

  const cards = await Promise.all(
    schools.map(async (school) => {
      let majorCount = 0;
      let liveGraphs = 0;

      for (const college of school.colleges) {
        if (college.catalogType === "coe") {
          const coe = await loadCoeCatalog(school.short_name);
          majorCount += coe?.majors.length ?? 0;
          liveGraphs += coe?.majors.filter((m) => m.roadmap_available).length ?? 0;
        } else if (college.catalogType === "ls" && school.short_name === "ucsb") {
          const ls = await loadUcsbLsCatalog();
          majorCount += ls?.majors.length ?? 0;
          liveGraphs += ls?.majors.filter((m) => m.roadmap_available).length ?? 0;
        } else if (college.catalogType === "ccs" && school.short_name === "ucsb") {
          const ccs = await loadUcsbCcsCatalog();
          majorCount += ccs?.majors.length ?? 0;
        }
      }

      return {
        short_name: school.short_name,
        name: school.name,
        location: school.location,
        collegesLabel: school.colleges.map((c) => c.label).join(" · "),
        collegeCount: school.colleges.length,
        majorCount,
        liveGraphs,
        preview: school.preview,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SchoolHubSection variant="page" schools={cards} />
    </div>
  );
}
