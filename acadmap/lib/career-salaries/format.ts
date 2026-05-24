import type { CareerSalaryProfile } from "@/lib/types";

function formatUsd(amount: number): string {
  if (amount >= 1000) {
    const k = amount / 1000;
    return k % 1 === 0 ? `$${k}K` : `$${k.toFixed(0)}K`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

/** Compact line for career hex nodes. */
export function formatSalaryCompact(salary: CareerSalaryProfile): string | null {
  if (salary.salary_type === "stipend_or_na") {
    return salary.note ?? "Grad stipend varies";
  }
  if (salary.range_low != null && salary.range_high != null) {
    return `Entry ${formatUsd(salary.range_low)}–${formatUsd(salary.range_high)}/yr`;
  }
  if (salary.median != null) {
    return `Entry ~${formatUsd(salary.median)}/yr`;
  }
  return null;
}

/** Full summary for sidebar. */
export function formatSalaryDetail(salary: CareerSalaryProfile): {
  headline: string;
  california?: string;
  sourceLabel: string;
} {
  if (salary.salary_type === "stipend_or_na") {
    return {
      headline:
        salary.note ??
        "Graduate stipend or fellowship — not a full-time salary. Amount varies by program.",
      sourceLabel: `${salary.source_name} · ${salary.as_of}`,
    };
  }

  let headline: string;
  if (
    salary.median != null &&
    salary.range_low != null &&
    salary.range_high != null
  ) {
    headline = `US entry-level total pay: ${formatUsd(salary.range_low)}–${formatUsd(salary.range_high)}/yr (median ${formatUsd(salary.median)})`;
  } else if (salary.median != null) {
    headline = `US entry-level median total pay: ${formatUsd(salary.median)}/yr`;
  } else if (salary.range_low != null && salary.range_high != null) {
    headline = `US entry-level total pay: ${formatUsd(salary.range_low)}–${formatUsd(salary.range_high)}/yr`;
  } else {
    headline = "Salary estimate unavailable";
  }

  let california: string | undefined;
  if (salary.california_median != null) {
    california =
      salary.california_note ??
      `California median ~${formatUsd(salary.california_median)}/yr (often higher than US average).`;
  } else if (salary.california_note) {
    california = salary.california_note;
  }

  return {
    headline,
    california,
    sourceLabel: `${salary.source_name} · ${salary.as_of}`,
  };
}
