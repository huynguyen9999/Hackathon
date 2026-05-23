/**
 * Fetch PSTAT faculty listing + profile pages into data/ucsb/faculty/pstat.json.
 * Preserves manual roles, career_tags, and teaches from existing file.
 *
 * Run from acadmap/: npm run fetch:faculty:pstat
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

import type {
  DepartmentFacultyFile,
  FacultyCategory,
  FacultyMember,
  FacultyRole,
} from "../lib/ucsb-faculty-types";

const ROOT = path.join(process.cwd());
const OUT_DIR = path.join(ROOT, "data", "ucsb", "faculty");
const OUT_PATH = path.join(OUT_DIR, "pstat.json");

const LISTING_URL = "https://www.pstat.ucsb.edu/people/faculty";
const BASE_URL = "https://www.pstat.ucsb.edu";

type ParsedListingMember = {
  id: string;
  name: string;
  title: string;
  pronouns?: string;
  email?: string;
  profile_url: string;
  category: FacultyCategory;
};

function inferRoles(title: string): FacultyRole[] {
  const normalized = title.toLowerCase();
  const roles: FacultyRole[] = [];
  if (
    normalized.includes("department chair") &&
    !normalized.includes("vice chair")
  ) {
    roles.push("department_chair");
  }
  if (normalized.includes("undergraduate vice chair")) {
    roles.push("undergraduate_vice_chair");
  } else if (normalized.includes("graduate vice chair")) {
    roles.push("graduate_vice_chair");
  }
  return roles;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseListing(html: string): ParsedListingMember[] {
  const members: ParsedListingMember[] = [];
  let currentCategory: FacultyCategory = "faculty";

  const sectionPattern =
    /<h2[^>]*>([^<]+)<\/h2>[\s\S]*?(?=<h2|$)/gi;
  const sections = Array.from(html.matchAll(sectionPattern));

  const processBlock = (block: string, category: FacultyCategory) => {
    const rowPattern =
      /<div class="views-row">([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/g;
    for (const rowMatch of Array.from(block.matchAll(rowPattern))) {
      const row = rowMatch[1];
      const hrefMatch = row.match(/href="(\/people\/faculty\/[^"]+)"/);
      const nameMatch = row.match(
        /<h4>\s*<strong><a[^>]*>([^<]+)<\/a><\/strong>/,
      );
      const pronounsMatch = row.match(/<h6>([^<]+)<\/h6>/);
      const titleMatch = row.match(/<h6>[\s\S]*?<\/h6>\s*<p>([^<]+)<\/p>/);
      const emailMatch = row.match(/mailto:([^"]+)/);

      if (!hrefMatch || !nameMatch) continue;

      const slug = hrefMatch[1].replace("/people/faculty/", "");
      members.push({
        id: slug,
        name: stripHtml(nameMatch[1]),
        title: titleMatch ? stripHtml(titleMatch[1]) : "",
        pronouns: pronounsMatch ? stripHtml(pronounsMatch[1]) : undefined,
        email: emailMatch ? emailMatch[1] : undefined,
        profile_url: `${BASE_URL}${hrefMatch[1]}`,
        category,
      });
    }
  };

  if (sections.length === 0) {
    processBlock(html, "faculty");
    return members;
  }

  for (const section of sections) {
    const heading = stripHtml(section[1]).toLowerCase();
    if (heading.includes("continuing lecturer")) {
      currentCategory = "continuing_lecturer";
    } else if (heading.includes("visiting")) {
      currentCategory = "visiting";
    } else if (heading.includes("affiliated")) {
      currentCategory = "affiliated";
    } else if (heading.includes("faculty")) {
      currentCategory = "faculty";
    }
    processBlock(section[0], currentCategory);
  }

  return members;
}

async function fetchProfileDetails(
  profileUrl: string,
): Promise<{ office?: string; research_areas?: string[] }> {
  const res = await fetch(profileUrl);
  if (!res.ok) return {};
  const html = await res.text();

  const officeMatch = html.match(
    /field--name-field-address[\s\S]*?field--item">([^<]+)</,
  );
  const metaResearch = html.match(
    /meta name="description" content="Research:\s*([^"]+)"/i,
  );
  const bodyResearch = html.match(
    /<p><strong>Research:<\/strong>\s*([^<]+)<\/p>/i,
  );

  const researchRaw = metaResearch?.[1] ?? bodyResearch?.[1];
  const research_areas = researchRaw
    ? researchRaw
        .split(/[;,]|\band\b/)
        .map((part) => stripHtml(part))
        .filter(Boolean)
    : undefined;

  return {
    office: officeMatch ? stripHtml(officeMatch[1]) : undefined,
    research_areas,
  };
}

function loadExisting(): Map<string, FacultyMember> {
  if (!existsSync(OUT_PATH)) return new Map();
  const data = JSON.parse(readFileSync(OUT_PATH, "utf-8")) as DepartmentFacultyFile;
  return new Map(data.members.map((member) => [member.id, member]));
}

function mergeMember(
  parsed: ParsedListingMember,
  profile: { office?: string; research_areas?: string[] },
  existing?: FacultyMember,
): FacultyMember {
  const inferredRoles = inferRoles(parsed.title);
  const roles =
    existing?.roles && existing.roles.length > 0
      ? existing.roles
      : inferredRoles.length > 0
        ? inferredRoles
        : undefined;

  return {
    id: parsed.id,
    name: parsed.name,
    title: parsed.title,
    roles,
    category: parsed.category,
    pronouns: parsed.pronouns,
    email: parsed.email ?? existing?.email,
    office: profile.office ?? existing?.office,
    profile_url: parsed.profile_url,
    research_areas: profile.research_areas ?? existing?.research_areas,
    career_tags: existing?.career_tags,
    teaches: existing?.teaches,
  };
}

async function main() {
  console.log(`Fetching ${LISTING_URL}...`);
  const listingRes = await fetch(LISTING_URL);
  if (!listingRes.ok) {
    throw new Error(`Failed to fetch listing: ${listingRes.status}`);
  }
  const listingHtml = await listingRes.text();
  const parsed = parseListing(listingHtml);
  console.log(`Parsed ${parsed.length} people from listing.`);

  const existingMap = loadExisting();
  const members: FacultyMember[] = [];

  for (const person of parsed) {
    process.stdout.write(`  Profile: ${person.name}...`);
    const profile = await fetchProfileDetails(person.profile_url);
    members.push(
      mergeMember(person, profile, existingMap.get(person.id)),
    );
    console.log(" done");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const output: DepartmentFacultyFile = {
    department_slug: "pstat",
    department: "Department of Statistics & Applied Probability",
    faculty_url: LISTING_URL,
    source_url: LISTING_URL,
    last_updated: new Date().toISOString().slice(0, 10),
    members,
  };

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${members.length} members to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
