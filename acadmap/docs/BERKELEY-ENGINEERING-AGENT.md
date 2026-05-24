# Berkeley Engineering — Agent reference

## School registry

- **short_name:** `berkeley`
- **College slug:** `engineering` (College of Engineering)
- **Hub:** `/schools/berkeley`
- **Engineering hub:** `/schools/berkeley/engineering`

## Official sources

| Resource | URL |
|----------|-----|
| Berkeley Engineering home | https://engineering.berkeley.edu/ |
| Majors & minors | https://engineering.berkeley.edu/academics/majors-and-minors/ |
| 2024-25 Undergraduate Guide | https://engineering.berkeley.edu/2024-25-undergraduate-guide/ |
| EECS department | https://eecs.berkeley.edu/ |

## Data files

```
data/berkeley/coe-catalog.json           # 12 BS majors
data/berkeley/coe-majors/eecs.json     # EECS pilot detail
data/berkeley/engineering-sources.json # Per-major source URLs
data/berkeley/major-tags.json
data/seeds/berkeley-eecs.json          # Interactive EECS roadmap
data/demo/community/berkeley.json      # Demo hub content (no Supabase)
```

## 12 BS programs (College of Engineering)

| Slug | Department |
|------|------------|
| aerospace-engineering | Mechanical Engineering |
| bioengineering | Bioengineering |
| civil-engineering | Civil & Environmental Engineering |
| eecs | Electrical Engineering & Computer Sciences |
| energy-engineering | Engineering Science |
| engineering-mathematics-statistics | Engineering Science |
| engineering-physics | Engineering Science |
| environmental-engineering-science | Engineering Science |
| industrial-engineering-operations-research | IEOR |
| materials-science-engineering | Materials Science & Engineering |
| mechanical-engineering | Mechanical Engineering |
| nuclear-engineering | Nuclear Engineering |

## Course code prefixes

- `COMPSCI` — Computer Science
- `EECS` / `ELENG` — Electrical Engineering & Computer Sciences
- `ENGIN` — Engineering (college-wide)
- `CIVENG` — Civil & Environmental Engineering
- `MAT SCI` — Materials Science & Engineering
- `ME` — Mechanical Engineering
- `NUCENG` — Nuclear Engineering
- `IEOR` — Industrial Engineering & Operations Research
- `BIOENG` — Bioengineering

## npm scripts

```bash
npm run sync:berkeley-details      # Sync catalog flags from detail + seeds
npm run validate:berkeley-details  # Validate coe-majors schema + slug alignment
```

## Interactive roadmaps

| Major | Detail | Live map |
|-------|--------|----------|
| EECS | gear + 8-semester plan | `/roadmap/berkeley/eecs` |
| Other 11 majors | catalog summary only | (no seed yet) |

## Notes

- Berkeley uses **semesters**; the detail JSON stores Fall/Spring terms in the shared quarter-plan schema for UI compatibility.
- L&S Computer Science is a separate program outside this CoE pillar.
- Degree audit / planner connector remains UCSB-only.

## Community hub

Demo content ships in `data/demo/community/berkeley.json`. With Supabase configured, community tables support `@berkeley.edu` verified badges via registry `email_domains`.
