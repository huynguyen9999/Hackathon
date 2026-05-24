export const APP_NAME = "iGauchoBack";
export const APP_TAGLINE = "Your degree, mapped.";
export const APP_FOOTER_TAGLINE = "University of California degree roadmaps";
export const APP_LOGO_INITIALS = "iG";
export const THEME_STORAGE_KEY = "igauchoback-theme";

export function pageTitle(segment: string): string {
  return `${segment} | ${APP_NAME}`;
}
