import type { DepartmentFacultyFile, FacultyMember } from "@/lib/ucsb-faculty-types";
import { FACULTY_ROLE_LABELS } from "@/lib/ucsb-faculty-types";
import {
  getCareerAlignedFaculty,
  getKeyContacts,
} from "@/lib/ucsb-faculty-match";

export type DepartmentFacultyCardProps = {
  faculty: DepartmentFacultyFile;
  careerOutcomes: string[];
};

function FacultyRow({ member }: { member: FacultyMember }) {
  const roleLabels =
    member.roles?.map((role) => FACULTY_ROLE_LABELS[role]).join(" · ") ?? null;

  return (
    <li className="rounded-xl border border-gaucho-blue/20 bg-white/60 px-4 py-3 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <a
            href={member.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-900 hover:text-gaucho-blue dark:text-slate-50 dark:hover:text-gaucho-gold"
          >
            {member.name} ↗
          </a>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {member.title}
          </p>
          {roleLabels ? (
            <p className="mt-1 text-xs font-medium text-gaucho-blue dark:text-gaucho-gold">
              {roleLabels}
            </p>
          ) : null}
        </div>
        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="text-sm text-gaucho-blue hover:underline dark:text-gaucho-gold"
          >
            {member.email}
          </a>
        ) : null}
      </div>
      {member.research_areas?.length ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {member.research_areas.slice(0, 3).join("; ")}
        </p>
      ) : null}
    </li>
  );
}

export function DepartmentFacultyCard({
  faculty,
  careerOutcomes,
}: DepartmentFacultyCardProps) {
  const keyContacts = getKeyContacts(faculty);
  const alignedFaculty = getCareerAlignedFaculty(faculty, careerOutcomes).filter(
    (member) => !keyContacts.some((contact) => contact.id === member.id),
  );

  return (
    <section className="rounded-2xl border border-gaucho-blue/25 bg-gaucho-blue/5 dark:bg-gaucho-blue/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Department faculty
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Planning context for {faculty.department.replace(/^Department of /, "")}.
            Full bios stay on the official site.
          </p>
        </div>
        <a
          href={faculty.faculty_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gaucho-blue/40 px-3 py-1.5 text-sm font-medium text-gaucho-blue transition hover:bg-gaucho-blue/5 dark:bg-gaucho-blue/30 dark:text-gaucho-gold-light"
        >
          Full directory ↗
        </a>
      </div>

      {keyContacts.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold-light/90">
            Key contacts
          </h3>
          <ul className="mt-3 space-y-2">
            {keyContacts.map((member) => (
              <FacultyRow key={member.id} member={member} />
            ))}
          </ul>
        </div>
      ) : null}

      {alignedFaculty.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold-light/90">
            Research aligned with your path
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Faculty whose focus overlaps common career outcomes for this major.
          </p>
          <ul className="mt-3 space-y-2">
            {alignedFaculty.slice(0, 5).map((member) => (
              <FacultyRow key={member.id} member={member} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
