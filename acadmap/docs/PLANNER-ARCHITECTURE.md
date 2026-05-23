# Planner Architecture

## Goals

- Support 4-year / 8-quarter drag-and-drop planning inside roadmap pages.
- Persist plan versions for advisor collaboration and comments.
- Overlay prerequisite validation, AP/transfer completions, and degree-audit progress.

## Data Contracts

Core contracts live in `lib/planner/contracts.ts`:

- `Plan`
- `PlanVersion`
- `PlannedCourseState`
- `ExternalCredit`
- `AuditSnapshot`
- `ValidationIssue`

## Runtime Flow

1. `RoadmapPage` loads roadmap + UCSB connector rules.
2. `RoadmapView` renders graph, analysis panel, and planner workspace.
3. `PlannerWorkspace` uses `use-plan-state`:
   - local cache via `localStorage`
   - collaborative save/load via `/api/plans*`
4. Validation and audit recompute on every planner-state change:
   - `validatePlannerState()`
   - `buildAuditSnapshot()`

## Collaboration and Security

Planner tables and RLS policies are in `supabase/schema.sql`.

- owner/advisor can edit plans and create versions
- viewer is read-only
- comments require membership
- share tokens are owner-issued

## Feature Flags

- `ENABLE_PLANNER_COLLAB` gates planner UI and collaboration workflows
- `USE_OFFICIAL_UCSB_CONNECTOR` selects live connector implementation (placeholder for now)

## Rollout Stages

1. Internal advising + developer users
2. Beta cohort (invite-only)
3. Campus-wide release after audit quality baseline is met
