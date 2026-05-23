#!/usr/bin/env node
/**
 * Fetch live curriculum from UCSB Developer API when UCSB_API_KEY is set.
 * Run: UCSB_API_KEY=... npm run fetch:ucsb-curriculum
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type {
  UcsbCourseLevel,
  UcsbCurriculumSnapshot,
} from "../lib/ucsb-curriculum-types";

const API_SEARCH =
  "https://api.ucsb.edu/academics/curriculums/v1/classes/search";
const API_SUBJECTS =
  "https://api.ucsb.edu/students/lookups/v1/subjects";

const ROOT = path.join(process.cwd(), "data", "ucsb", "curriculum");

async function fetchJson(url: string, apiKey: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "ucsb-api-version": "1.0",
      "ucsb-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`);
  }
  return response.json();
}

async function main(): Promise<void> {
  const apiKey = process.env.UCSB_API_KEY?.trim();
  if (!apiKey) {
    console.error("UCSB_API_KEY is required. Use npm run seed:ucsb-curriculum for static snapshots.");
    process.exit(1);
  }

  const quarter = process.env.UCSB_QUARTER ?? "20252";
  const subjectsArg = process.env.UCSB_SUBJECTS ?? "ECE,CMPSC,ME,CH E,MATH,PSTAT";
  const subjects = subjectsArg.split(",").map((s) => s.trim()).filter(Boolean);
  const levels: UcsbCourseLevel[] = ["U", "G", "A"];

  const subjectsJson = await fetchJson(API_SUBJECTS, apiKey);
  await mkdir(ROOT, { recursive: true });
  await writeFile(
    path.join(ROOT, "subjects.json"),
    `${JSON.stringify({ subjects: subjectsJson }, null, 2)}\n`,
  );

  for (const subjectCode of subjects) {
    for (const level of levels) {
      let url: string;
      if (level === "A") {
        url = `${API_SEARCH}?quarter=${quarter}&subjectCode=${encodeURIComponent(subjectCode)}&pageNumber=1&pageSize=100&includeClassSections=true`;
      } else {
        url = `${API_SEARCH}?quarter=${quarter}&subjectCode=${encodeURIComponent(subjectCode)}&objLevelCode=${level}&pageNumber=1&pageSize=100&includeClassSections=true`;
      }

      const json = (await fetchJson(url, apiKey)) as {
        classes?: UcsbCurriculumSnapshot["courses"];
      };

      const snapshot: UcsbCurriculumSnapshot = {
        quarter,
        subjectCode,
        level,
        fetchedAt: new Date().toISOString(),
        courses: (json.classes ?? []) as UcsbCurriculumSnapshot["courses"],
      };

      const dir = path.join(ROOT, "snapshots", quarter);
      await mkdir(dir, { recursive: true });
      const fileName = `${subjectCode.toUpperCase()}-${level}.json`;
      await writeFile(
        path.join(dir, fileName),
        `${JSON.stringify(snapshot, null, 2)}\n`,
      );
      console.log(`Wrote ${quarter}/${fileName}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
