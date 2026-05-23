/** URL path helpers safe for client and server components. */

export const LS_COLLEGE_SLUG = "letters-science";
export const COE_COLLEGE_SLUG = "engineering";
export const CCS_COLLEGE_SLUG = "creative-studies";

export function lsMajorHubHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/schools/${schoolShortName}/${LS_COLLEGE_SLUG}/${majorSlug}`;
}

export function lsCollegeHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}/${LS_COLLEGE_SLUG}`;
}

export function coeMajorHubHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/schools/${schoolShortName}/${COE_COLLEGE_SLUG}/${majorSlug}`;
}

export function coeCollegeHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}/${COE_COLLEGE_SLUG}`;
}

export function ccsMajorHubHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/schools/${schoolShortName}/${CCS_COLLEGE_SLUG}/${majorSlug}`;
}

export function ccsCollegeHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}/${CCS_COLLEGE_SLUG}`;
}

export function schoolHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}`;
}

export function majorRoadmapHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/roadmap/${schoolShortName}/${majorSlug}`;
}
