export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function isPlannerCollabEnabled(): boolean {
  return process.env.ENABLE_PLANNER_COLLAB === "true";
}

export function isOfficialUcsbConnectorEnabled(): boolean {
  return process.env.USE_OFFICIAL_UCSB_CONNECTOR === "true";
}

export function getUcsbApiKey(): string | undefined {
  const key = process.env.UCSB_API_KEY?.trim();
  return key || undefined;
}

export function getUcsbCurriculumCacheHours(): number {
  const raw = process.env.UCSB_CURRICULUM_CACHE_HOURS;
  const parsed = raw ? Number.parseInt(raw, 10) : 24;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
}
