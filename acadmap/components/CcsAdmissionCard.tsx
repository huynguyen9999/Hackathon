import type { CcsAdmissionRequirements } from "@/lib/ccs-major-detail-types";

export type CcsAdmissionCardProps = {
  admission: CcsAdmissionRequirements;
  applyUrl: string;
};

export function CcsAdmissionCard({ admission, applyUrl }: CcsAdmissionCardProps) {
  return (
    <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/30 to-slate-900/60 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Application requirements
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            CCS admission is separate from the UC application. Apply via the CCS
            online application in addition to UCSB.
          </p>
        </div>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-amber-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Apply to this major ↗
        </a>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {admission.letter_of_intent ? (
          <li className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-amber-200">Letter of intent</span>
            <span className="mt-1 block text-xs text-slate-400">
              Required — separate from UC application essay
            </span>
          </li>
        ) : null}
        {admission.letters_of_recommendation != null ? (
          <li className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-amber-200">
              Letters of recommendation
            </span>
            <span className="mt-1 block text-xs text-slate-400">
              {admission.letters_of_recommendation === 0
                ? "Not accepted for this major"
                : `${admission.letters_of_recommendation} required (PDF upload)`}
            </span>
          </li>
        ) : null}
        {admission.transcripts ? (
          <li className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-amber-200">Transcripts</span>
            <span className="mt-1 block text-xs text-slate-400">
              Unofficial scans from all institutions
            </span>
          </li>
        ) : null}
        {admission.portfolio ? (
          <li className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-amber-200">Portfolio</span>
            <span className="mt-1 block text-xs text-slate-400">
              Work samples required — see apply page for format
            </span>
          </li>
        ) : null}
        {admission.supplemental ? (
          <li className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-amber-200">
              Supplemental materials
            </span>
            <span className="mt-1 block text-xs text-slate-400">
              Encouraged — research, projects, or work samples
            </span>
          </li>
        ) : null}
      </ul>

      {admission.notes.length ? (
        <ul className="mt-4 space-y-1 text-xs text-slate-400">
          {admission.notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
