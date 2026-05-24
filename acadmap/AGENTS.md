# iGauchoBack — Agent delegation guide

Use this file when running **multiple Cursor agents** (or subagents) in parallel. Each role owns a slice of the repo; avoid overlapping edits without coordination.

## Project north star

**iGauchoBack** — school-specific, major-specific degree roadmaps with real course codes and career outcome nodes. MVP runs on JSON seeds; production graduates to Supabase.

## Agent roles

| Agent | Owns | Do not touch |
|-------|------|----------------|
| **Platform** | `package.json`, `next.config.js`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `README.md`, deploy/Vercel | Graph node UI, seed JSON content |
| **Data & API** | `lib/types.ts`, `lib/roadmap.ts`, `lib/env.ts`, `data/seeds/**`, `app/api/**`, `supabase/schema.sql` | React Flow components |
| **Graph UI** | `components/RoadmapGraph.tsx`, `NodeCard.tsx`, `CareerNode.tsx`, `RoadmapView.tsx`, `Sidebar.tsx`, `lib/flow.ts` | API routes, SQL |
| **Product pages** | `app/page.tsx`, `app/explore/**`, `app/contribute/**`, `SearchBar.tsx`, `ExploreCatalog.tsx`, `ContributeForm.tsx`, `Navbar.tsx` | `schema.sql`, seed data |
| **Auth & DB** | `lib/supabase.ts`, Supabase RLS, GitHub OAuth, wiring `POST /api/roadmaps` to DB, votes | Landing copy, graph layout |

## Parallel workstreams (suggested order)

### Phase 1 — Done

- [x] Canonical types (`NodeType`, `EdgeType`, `RoadmapStatus`, snake_case fields)
- [x] Seed JSON format + UCSB EE sample
- [x] API: approved list, detail, POST (auth + pending), schools with roadmaps
- [x] `supabase/schema.sql` aligned to spec (`nodes`, `edges`, `external_id`)

### Phase 2 — UCSB GEAR 2025-26 (primary source)

**GEAR Research agent** (read-only)

> Use https://engineering.ucsb.edu/sites/default/files/docs/25-26_GEAR.pdf. Update `data/ucsb/coe-catalog.json` and `docs/GEAR-25-26.md`. Include prep, upper-div, elective units per major.

**Research agent** (read-only)

> Supplement with department grids (ece.ucsb.edu, ce.ucsb.edu). Update `docs/UCSB-COE-RESEARCH.md`. Cite URLs.

**Product agent**

> UCSB overview at `/schools/ucsb`; CoE at `/schools/ucsb/engineering`; L&S at `/schools/ucsb/letters-science`. See `docs/SITE-LAYOUT.md`. Use `CollegeBanner`, `MajorCatalogGrid`, `SchoolHero`, `LsFrameworkCard`, `PageHeader`.

**L&S research agent** (read-only)

> Use https://admissions.sa.ucsb.edu/majors (58 L&S majors) and https://duels.ucsb.edu/degree-planning/degree-requirements. Department URLs live in `lib/ucsb-dept-urls.ts`. Run `npm run fetch:ls` to merge into `data/ucsb/ls-catalog.json`. See `docs/UCSB-LS-RESEARCH.md`.

**L&S cluster agents** (parallel QA)

> Split majors across sciences, social sciences, humanities, and languages/arts. Edit `lib/ucsb-dept-urls.ts`, then run `npm run fetch:ls` + `npm run validate:ls`. Prompt templates in `docs/UCSB-LS-RESEARCH.md`.

**L&S major sheet agent** (Wave 1+)

> Parse department major sheet PDF → write `data/ucsb/ls-majors/{slug}.json` following `lib/ucsb-major-detail-types.ts`. Add URLs to `data/ucsb/major-sheet-sources.json`. Run `npm run validate:details` + `npm run sync:details`. Use FMS or **Actuarial Science** as reference (BS/MS tracks). Parallel cluster assignments: `docs/LS-MAJOR-AGENT-CLUSTERS.md`. Batch scaffold: `npm run generate:details`.

**CoE GEAR agent** (Wave 2 — one per major)

> Parse GEAR p.{N} GRID → `data/ucsb/coe-majors/{slug}.json` + `data/seeds/ucsb-{slug}.json`. Run `npm run validate:coe-details` + `npm run sync:coe-details`. See `docs/COE-GEAR-AGENT-CLUSTERS.md`. Reference: `coe-majors/electrical-engineering.json`.

**Data agent** — per major

> Create `data/seeds/ucsb-{slug}.json` from catalog core courses + official prerequisites. Mark `roadmap_available: true` in catalog when done (or run `npm run sync:details` after seed exists). FMS pilot: `data/seeds/ucsb-financial-mathematics-and-statistics.json`.

### Phase 3 — Split across agents

**Data agent** (done)

- [x] Apply `supabase/schema.sql` in Supabase SQL editor.
- [x] Implement `lib/roadmap.ts` Supabase paths (approved roadmaps only).
- [x] Seed `schools` / `majors` from JSON via `npm run migrate:seeds`.
- [x] Harden `POST /api/roadmaps` with validation + `pending` status.

**Graph agent**

1. Edge styling by `edge_type` (prerequisite vs recommended vs leads_to).
2. Layout helper (dagre) optional — keep manual positions in seeds for MVP.
3. Mobile: collapsible sidebar, pinch-zoom notes in README.

**Product agent** (partial)

- [x] Explore: SSR catalog, empty states.
- [x] Contribute: GitHub auth + seed JSON upload.
- [ ] Landing: screenshots / demo GIF.

**Auth agent** (done)

- [x] `middleware.ts` session refresh (`@supabase/ssr`).
- [x] Protect `/contribute` and POST routes.
- [x] Contributor attribution on `roadmaps.contributor_id`.
- [x] Maintainer `PATCH /api/roadmaps/[id]` for approve/reject.

## Conventions

- **Imports**: `@/` alias only.
- **Client components**: `'use client'` on anything using React Flow or browser APIs.
- **Server-only**: `lib/roadmap.ts` seed loading uses `fs` — never import from client components.
- **Slugs**: URL `/roadmap/[school]/[major]` maps to `school.shortName` + `major.slug` (e.g. `ucsb` + `electrical-engineering`).
- **Node types**: `course` | `career` | `skill` in DB; React Flow `type` is `course` or `career`.
- **Styling**: CSS vars in `app/globals.css`; indigo/violet palette; no new UI libraries without discussion.

## Commands

```bash
cd acadmap
npm install
cp .env.example .env.local   # optional until Supabase is live
npm run dev                  # http://localhost:3000
npm run fetch:ls             # merge 58 L&S majors into ls-catalog.json
npm run validate:ls          # assert catalog integrity
npm run generate:details     # auto-generate catalog-tier ls-majors for all 58 majors
npm run validate:details     # validate ls-majors/*.json schema
npm run validate:coe-details  # validate coe-majors/*.json
npm run sync:coe-details      # sync detail + roadmap flags into coe-catalog.json
npm run check:community-setup # verify Supabase env vars
npm run migrate:seeds         # import data/seeds/*.json to Supabase (needs SERVICE_ROLE_KEY)
```

If the parent folder path contains `:`, prefer:

```bash
./node_modules/.bin/next dev
```

## Handoff checklist

Before merging agent work:

1. `npm run build` passes.
2. `/roadmap/ucsb/electrical-engineering` renders graph + sidebar.
3. `GET /api/roadmaps` and `GET /api/schools` return seed data without env vars.
4. No secrets in git (only `.env.example`).

## Prompt templates for subagents

**Data agent**

> Extend `lib/roadmap.ts` to fetch approved roadmaps from Supabase when `isSupabaseConfigured()`. Map DB rows to existing `Roadmap` type. Keep JSON seeds as fallback.

**Graph agent**

> In `RoadmapGraph.tsx`, style edges by `data.edgeType`. Add legend component. Do not change API or seed file format.

**Product agent**

> Improve `/explore` with school grouping and responsive cards. Use existing `getAllRoadmaps()` and `SearchBar`.

**Auth agent**

> Add Supabase GitHub OAuth to `/contribute` and protect `POST /api/roadmaps`. Follow `supabase/schema.sql` RLS policies.
