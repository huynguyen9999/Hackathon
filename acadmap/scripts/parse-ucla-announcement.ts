/**
 * Draft parser for UCLA Samueli Announcement PDF curriculum tables.
 * Usage: npm run parse:ucla-announcement -- [path-to-pdf-text-or-json]
 *
 * Output: stdout JSON draft for data/ucla/coe-majors/*.json (human QA required)
 */

const ANNOUNCEMENT_URL =
  "https://www.seasoasa.ucla.edu/wp-content/uploads/seasoasa/UCLASamueli-Anncmt-25-26.pdf";

const MAJORS = [
  "aerospace-engineering",
  "bioengineering",
  "chemical-engineering",
  "civil-engineering",
  "computer-engineering",
  "computer-science",
  "computer-science-and-engineering",
  "electrical-engineering",
  "materials-engineering",
  "mechanical-engineering",
];

console.log(
  JSON.stringify(
    {
      source: ANNOUNCEMENT_URL,
      catalog_year: "2025-2026",
      majors: MAJORS,
      note:
        "Run against extracted PDF text; curriculum tables start ~page 176. Course codes: COM SCI, EC ENGR, MECH&AE, CH ENGR, CEE, MAT SCI, BIOENGR.",
    },
    null,
    2,
  ),
);
