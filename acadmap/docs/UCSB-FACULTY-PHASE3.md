# UCSB Faculty — Phase 3: Course instructors (GOLD / schedule)

Phase 1–2 store **planning hints** (`teaches[]` on faculty JSON). Phase 3 adds live or periodic instructor data from UCSB GOLD.

## Current state

- AcadMap sidebar shows faculty linked via manual `teaches` tags (e.g. PSTAT 173 → Michael Ludkovski).
- Copy explicitly says: *"Planning hints only — check GOLD for current instructors."*
- No GOLD API or scrape exists in this repo today.

## Options evaluated

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Manual `teaches` hints** (Phase 1) | Zero infra, stable, good for roadmaps | Can go stale; not quarter-specific | Keep as baseline |
| **Periodic GOLD export / scrape** | Quarter-accurate | Fragile HTML; auth; maintenance each term | Defer until demand proven |
| **Official schedule API** (if UCSB exposes one) | Reliable | May not exist publicly | Investigate with registrar / IT |
| **Supabase `course_offerings` table** | Enables "Fall 2026: Prof. X" in sidebar | Needs ingest job + RLS | Best long-term if live data is required |

## Suggested Phase 3 implementation (when ready)

1. Add `course_offerings` table: `course_code`, `quarter`, `instructor_name`, `instructor_profile_url`, `source`, `fetched_at`.
2. Nightly or term-start job: fetch GOLD public schedule pages or approved export.
3. Extend `FacultySidebarSection` to prefer live offerings when `quarter` matches current term; fall back to `teaches[]`.
4. Link out to GOLD for enrollment either way — AcadMap does not replace registration.

## Out of scope

- Rate-my-professor style reviews
- Replacing GOLD for section selection
- Caching full faculty bios (always link to department sites)

## Trigger to start Phase 3

Start when at least **3 L&S departments** have faculty JSON and users ask for quarter-specific instructors on roadmap nodes.
