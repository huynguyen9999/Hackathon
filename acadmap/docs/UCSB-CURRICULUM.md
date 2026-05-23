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

## Graduate programs

### Discovery paths

- **Navbar:** Graduate → `/schools/ucsb/graduate`
- **Home:** UCSB Graduate featured strip
- **School hub:** Graduate pillar card above undergraduate colleges
- **Explore:** Filter by **Graduate** college or **Grad school at UCSB** goal lane
- **Engineering hub:** Graduate engineering section with CoE MS/PhD cards
- **Courses:** Callout when `level=G` linking to graduate hub

### Data files

| File | Purpose |
|------|---------|
| `data/ucsb/grad-programs/index.json` | Interactive roadmap pilots (5 CoE programs) |
| `data/ucsb/grad-programs/departments.json` | Full Graduate Division department index |
| `data/ucsb/grad-programs/sources.json` | Official ucsb.edu + graddiv.ucsb.edu links |
| `data/ucsb/grad-bridges.json` | Undergrad course → grad program sidebar callouts |

Full degree requirements live in department handbooks and on [Graduate Division](https://www.graddiv.ucsb.edu/graduate-programs/departments). The department index is the authoritative outbound link; iGauchoBack adds interactive roadmaps only where seeded.

### Routes

- Hub: `/schools/ucsb/graduate`
- Roadmap seeds: `data/seeds/ucsb-*-ms.json`, `ucsb-computer-science-phd.json`
- Undergrad ↔ grad bridges: `data/ucsb/grad-bridges.json`
