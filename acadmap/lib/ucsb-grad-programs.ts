import { promises as fs } from "fs";
import path from "path";

export type GradProgramSummary = {
  slug: string;
  name: string;
  department: string;
  degree: string;
};

export type GradProgramDetail = GradProgramSummary & {
  description: string;
  source_url: string;
  required_courses: string[];
  milestones?: string[];
};

const GRAD_DIR = path.join(process.cwd(), "data", "ucsb", "grad-programs");

export async function listGradPrograms(): Promise<GradProgramSummary[]> {
  const index = await readJson<{ programs: GradProgramSummary[] }>(
    path.join(GRAD_DIR, "index.json"),
  );
  return index?.programs ?? [];
}

export async function getGradProgram(
  slug: string,
): Promise<GradProgramDetail | null> {
  return readJson<GradProgramDetail>(path.join(GRAD_DIR, `${slug}.json`));
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
