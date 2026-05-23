import type { AuditSnapshot, ValidationIssue } from "@/lib/planner/contracts";

export type ExportPlanPayload = {
  title: string;
  majorName: string;
  quarterRows: { quarter: string; courses: string[]; units: number }[];
  audit: AuditSnapshot;
  validationIssues: ValidationIssue[];
};

/**
 * Opens a print-ready window. Browsers can save this as PDF for advisor meetings.
 */
export function exportPlanAsPdf(payload: ExportPlanPayload) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=980,height=720");
  if (!popup) return;

  const issuesHtml =
    payload.validationIssues.length === 0
      ? "<p>No validation issues.</p>"
      : `<ul>${payload.validationIssues
          .map((issue) => `<li>${issue.message}</li>`)
          .join("")}</ul>`;

  const rowsHtml = payload.quarterRows
    .map(
      (row) =>
        `<tr><td>${row.quarter}</td><td>${row.courses.join(", ") || "—"}</td><td>${row.units}</td></tr>`,
    )
    .join("");

  popup.document.write(`
    <html>
      <head>
        <title>${payload.title} — Advisor Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; line-height: 1.4; }
          h1,h2 { margin-bottom: 8px; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          .meta { color: #4b5563; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>${payload.title}</h1>
        <p class="meta">${payload.majorName} · Completion ${payload.audit.completionPercent}% · Remaining ${payload.audit.remainingUnits} units</p>

        <h2>Quarter Plan</h2>
        <table>
          <thead><tr><th>Quarter</th><th>Courses</th><th>Units</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <h2>Requirement Progress</h2>
        <ul>
          ${payload.audit.buckets
            .map((b) => `<li>${b.label}: ${b.completed}/${b.required} units (${b.percent}%)</li>`)
            .join("")}
        </ul>

        <h2>Validation</h2>
        ${issuesHtml}
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.print();
}
