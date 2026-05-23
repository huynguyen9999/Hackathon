/** URL path helpers safe for client and server components. */

export const LS_COLLEGE_SLUG = "letters-science";
export const COE_COLLEGE_SLUG = "engineering";

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

export function schoolHubHref(schoolShortName: string): string {
  return `/schools/${schoolShortName}`;
}

export function majorRoadmapHref(
  schoolShortName: string,
  majorSlug: string,
): string {
  return `/roadmap/${schoolShortName}/${majorSlug}`;
}
