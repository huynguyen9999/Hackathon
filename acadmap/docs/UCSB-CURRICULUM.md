# UCSB Curriculum Catalog

iGauchoBack ships a **snapshot-first** UCSB course catalog with optional live refresh via the UCSB Developer API.

## Data sources

| Source | Role |
|--------|------|
| [Official ASPX search](https://my.sa.ucsb.edu/public/curriculum/coursesearch.aspx) | Enroll restrictions, textbook info — link out from course detail |
| [UCSB Developer API](https://developer.ucsb.edu/) | Live curriculum when `UCSB_API_KEY` is set |
| `data/ucsb/curriculum/snapshots/` | Committed JSON for deploy without a key |

## Level codes

- **`U`** — Undergraduate
- **`G`** — Graduate
- **`A`** — All (omit `objLevelCode` on the API)

## Quarter format

Quarter codes are `YYYYQ` where Q is:

- `1` Winter
- `2` Spring
- `3` Summer (when listed)
- `4` Fall

Example: `20261` = Fall 2026.

## Environment variables

```bash
UCSB_API_KEY=                    # optional; enables live curriculum fetch
UCSB_CURRICULUM_CACHE_HOURS=24   # Next.js revalidate window for live API
```

## Scripts

```bash
npm run seed:ucsb-curriculum      # write subjects, quarters, demo snapshots (no key)
npm run fetch:ucsb-curriculum     # refresh snapshots from live API (requires key)
npm run validate:ucsb-curriculum  # CI schema checks
```

## App routes

- **UI:** `/schools/ucsb/courses?quarter=20252&subject=ECE&level=G&q=291`
- **API:** `GET /api/ucsb/courses?quarter=&subject=&level=&q=`

## Integration boundary

The curriculum client (`lib/ucsb-curriculum.ts`) is the second official UCSB provider alongside the degree-audit connector documented in [UCSB-INTEGRATION-BOUNDARY.md](./UCSB-INTEGRATION-BOUNDARY.md).

Roadmap sidebar nodes link to the catalog via **View in course catalog** (pre-filled subject + course number).

## Graduate programs (Phase 2)

- Hub: `/schools/ucsb/graduate`
- Program catalog: `data/ucsb/grad-programs/`
- Roadmap seeds: `data/seeds/ucsb-*-ms.json`, `ucsb-computer-science-phd.json`
- Undergrad ↔ grad bridges: `data/ucsb/grad-bridges.json`
