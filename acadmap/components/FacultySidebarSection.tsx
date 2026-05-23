"use client";

import type { DepartmentFacultyFile, FacultyMember } from "@/lib/ucsb-faculty-types";
import { facultyForCareerLabel, facultyForCourse } from "@/lib/ucsb-faculty-match";

export type FacultySidebarSectionProps = {
  faculty: DepartmentFacultyFile;
  nodeType: "course" | "career";
  label: string;
};

function FacultyLink({ member }: { member: FacultyMember }) {
  return (
    <li>
      <a
        href={member.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2 rounded-lg border border-gaucho-blue-light/20 bg-slate-100 px-3 py-2 text-sm text-gaucho-blue transition hover:border-gaucho-blue-light/40 hover:bg-gaucho-blue/5 dark:bg-slate-800/50 dark:text-gaucho-gold-light dark:hover:bg-gaucho-blue-dark/40"
      >
        <span className="text-gaucho-blue-light transition group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
        <span>
          <span className="font-medium">{member.name}</span>
          {member.title ? (
            <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">
              {member.title}
            </span>
          ) : null}
        </span>
      </a>
    </li>
  );
}

export function FacultySidebarSection({
  faculty,
  nodeType,
  label,
}: FacultySidebarSectionProps) {
  const matches =
    nodeType === "course"
      ? facultyForCourse(faculty, label)
      : facultyForCareerLabel(faculty, label);

  if (matches.length === 0) return null;

  const heading =
    nodeType === "course"
      ? "Faculty connected to this course"
      : "Faculty aligned with this path";

  return (
    <section className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold/80">
        {heading}
      </h3>
      <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">
        Planning hints only — check GOLD for current instructors.
      </p>
      <ul className="space-y-2">
        {matches.slice(0, 4).map((member) => (
          <FacultyLink key={member.id} member={member} />
        ))}
      </ul>
      <a
        href={faculty.faculty_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs font-medium text-gaucho-blue hover:underline dark:text-gaucho-gold"
      >
        View department directory ↗
      </a>
    </section>
  );
}
