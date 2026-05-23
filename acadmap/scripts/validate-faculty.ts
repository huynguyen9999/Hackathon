/**
 * Validate department faculty JSON files.
 *
 * Run from acadmap/: npm run validate:faculty
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

import type {
  DepartmentFacultyFile,
  FacultyMember,
  FacultyRole,
} from "../lib/ucsb-faculty-types";

const ROOT = path.join(process.cwd());
const FACULTY_DIR = path.join(ROOT, "data", "ucsb", "faculty");

const VALID_ROLES: FacultyRole[] = [
  "department_chair",
  "undergraduate_vice_chair",
  "graduate_vice_chair",
];

function fail(message: string): never {
  console.error(`VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function validateMember(member: FacultyMember, file: string) {
  if (!member.id) fail(`${file}: member missing id`);
  if (!member.name) fail(`${file}: ${member.id} missing name`);
  if (!member.title) fail(`${file}: ${member.id} missing title`);
  if (!member.profile_url?.startsWith("http")) {
    fail(`${file}: ${member.id} missing valid profile_url`);
  }
  for (const role of member.roles ?? []) {
    if (!VALID_ROLES.includes(role)) {
      fail(`${file}: ${member.id} has invalid role ${role}`);
    }
  }
}

function validateFile(filePath: string) {
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as DepartmentFacultyFile;
  const file = path.basename(filePath);

  if (!data.department_slug) fail(`${file}: missing department_slug`);
  if (!data.department) fail(`${file}: missing department`);
  if (!data.faculty_url?.startsWith("http")) {
    fail(`${file}: missing faculty_url`);
  }
  if (!Array.isArray(data.members) || data.members.length === 0) {
    fail(`${file}: members must be a non-empty array`);
  }

  const ids = new Set<string>();
  for (const member of data.members) {
    validateMember(member, file);
    if (ids.has(member.id)) fail(`${file}: duplicate id ${member.id}`);
    ids.add(member.id);
  }
}

function main() {
  const files = readdirSync(FACULTY_DIR).filter((name) => name.endsWith(".json"));
  if (files.length === 0) {
    fail("No faculty JSON files found in data/ucsb/faculty/");
  }

  for (const file of files) {
    validateFile(path.join(FACULTY_DIR, file));
  }

  console.log(`Validated ${files.length} faculty file(s).`);
}

main();
