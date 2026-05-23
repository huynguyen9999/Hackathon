import gradBridges from "@/data/ucsb/grad-bridges.json";

export type GradBridge = {
  courseLabel: string;
  programSlugs: string[];
  note?: string;
};

export type GradBridgeLookup = {
  programSlugs: string[];
  note?: string;
};

const bridgeMap = new Map<string, GradBridgeLookup>(
  gradBridges.bridges.map((b) => [
    b.courseLabel.toUpperCase(),
    { programSlugs: b.programSlugs, note: b.note },
  ]),
);

export function getGradBridgeForCourse(
  label: string,
): GradBridgeLookup | undefined {
  return bridgeMap.get(label.trim().toUpperCase());
}

export const GRAD_PROGRAM_LABELS: Record<string, string> = {
  "electrical-engineering-ms": "MS Electrical Engineering",
  "computer-science-ms": "MS Computer Science",
  "computer-science-phd": "PhD Computer Science",
  "mechanical-engineering-ms": "MS Mechanical Engineering",
  "chemical-engineering-ms": "MS Chemical Engineering",
};
