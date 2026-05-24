/** School-aware subject aliases (transcript label → roadmap label prefix). */
const SUBJECT_ALIASES: Record<string, Record<string, string>> = {
  ucsb: {
    "COMP SCI": "CMPSC",
    "COMPUTER SCIENCE": "CMPSC",
    "COMPUTER SCI": "CMPSC",
    ECON: "ECON",
  },
  ucla: {
    "MECH & AE": "MECH&AE",
    "MECH AND AE": "MECH&AE",
    "MECHANICAL & AEROSPACE ENGR": "MECH&AE",
  },
  berkeley: {
    CS: "COMPSCI",
    "COMP SCI": "COMPSCI",
    "COMPUTER SCIENCE": "COMPSCI",
    "ELECTRICAL ENG": "ELENG",
    "ELECTRICAL ENGINEERING": "ELENG",
  },
};

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSubject(subject: string, school?: string): string {
  const upper = collapseSpaces(subject.toUpperCase());
  const aliases = school ? SUBJECT_ALIASES[school.toLowerCase()] : undefined;
  if (aliases?.[upper]) {
    return aliases[upper];
  }
  return upper;
}

function normalizeCourseNumber(number: string): string {
  return number.toUpperCase().replace(/\s+/g, "");
}

/** Normalize to "SUBJECT NUMBER" form used on roadmap node labels. */
export function normalizeCourseCode(raw: string, school?: string): string | null {
  const trimmed = collapseSpaces(raw.trim());
  if (!trimmed) return null;

  const match = trimmed.match(/^([A-Za-z][A-Za-z\s&]{0,20}?)\s+([A-Z]?\d+[A-Z0-9]{0,3})$/i);
  if (!match) return null;

  const subject = normalizeSubject(match[1], school);
  const number = normalizeCourseNumber(match[2]);
  return `${subject} ${number}`;
}

export function courseCodeKey(code: string, school?: string): string {
  const normalized = normalizeCourseCode(code, school);
  return normalized ?? collapseSpaces(code.toUpperCase());
}
