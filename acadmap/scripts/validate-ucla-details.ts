/**
 * Validates UCLA coe-majors detail files against coe-catalog.json slugs.
 */
import { promises as fs } from "fs";
import path from "path";

async function main() {
  const catalogPath = path.join(process.cwd(), "data", "ucla", "coe-catalog.json");
  const majorsDir = path.join(process.cwd(), "data", "ucla", "coe-majors");

  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf-8")) as {
    majors: { slug: string; detail_available?: boolean }[];
  };

  const detailFiles = await fs.readdir(majorsDir);
  const slugs = new Set(
    detailFiles.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
  );

  let errors = 0;
  for (const m of catalog.majors) {
    if (m.detail_available && !slugs.has(m.slug)) {
      console.error(`Missing detail file for ${m.slug}`);
      errors++;
    }
  }

  for (const slug of slugs) {
    if (!catalog.majors.some((m) => m.slug === slug)) {
      console.error(`Orphan detail file: ${slug}.json`);
      errors++;
    }
  }

  if (errors > 0) {
    process.exit(1);
  }
  console.log(`Validated ${slugs.size} UCLA coe-majors detail files.`);
}

main();
