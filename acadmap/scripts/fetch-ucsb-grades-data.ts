#!/usr/bin/env node
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const RAW_DIR = path.join(process.cwd(), "data", "ucsb", "grades", "raw");

const FILES = [
  {
    name: "courseGrades.csv",
    url: "https://raw.githubusercontent.com/dailynexusdata/grades-data/main/courseGrades.csv",
  },
  {
    name: "ges.csv",
    url: "https://raw.githubusercontent.com/dailynexusdata/grades-data/main/ges.csv",
  },
] as const;

async function main(): Promise<void> {
  await mkdir(RAW_DIR, { recursive: true });

  for (const file of FILES) {
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
    }
    const text = await response.text();
    await writeFile(path.join(RAW_DIR, file.name), text, "utf8");
    console.log(`Wrote ${file.name} (${text.length} bytes)`);
  }

  console.log("Downloaded Daily Nexus grades data to data/ucsb/grades/raw/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
