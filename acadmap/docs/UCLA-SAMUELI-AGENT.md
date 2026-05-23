# UCLA Samueli — Agent reference

## School registry

- **short_name:** `ucla`
- **College slug:** `engineering` (Henry Samueli School of Engineering)
- **Hub:** `/schools/ucla`
- **Engineering hub:** `/schools/ucla/engineering`

## Official sources

| Resource | URL |
|----------|-----|
| Samueli home | https://samueli.ucla.edu/ |
| 2025-26 Announcement PDF | https://www.seasoasa.ucla.edu/wp-content/uploads/seasoasa/UCLASamueli-Anncmt-25-26.pdf |
| SEASOASA | https://www.seasoasa.ucla.edu/ |

## Data files

```
data/ucla/coe-catalog.json       # 10 BS majors
data/ucla/coe-majors/{slug}.json # Detail pages (CS, EE, ME)
data/ucla/major-tags.json
data/seeds/ucla-computer-science.json  # Pilot interactive roadmap
data/demo/community/ucla.json    # Demo hub content (no Supabase)
```

## 10 BS programs (Announcement p.5)

| Slug | Department |
|------|------------|
| aerospace-engineering | Mechanical & Aerospace |
| bioengineering | Bioengineering |
| chemical-engineering | Chemical & Biomolecular |
| civil-engineering | Civil & Environmental |
| computer-engineering | Computer Science |
| computer-science | Computer Science |
| computer-science-and-engineering | Computer Science |
| electrical-engineering | Electrical & Computer |
| materials-engineering | Materials Science |
| mechanical-engineering | Mechanical & Aerospace |

## Course code prefixes

- `COM SCI` — Computer Science
- `EC ENGR` — Electrical & Computer Engineering
- `MECH&AE` — Mechanical & Aerospace
- `CH ENGR` — Chemical Engineering
- `CEE` — Civil & Environmental
- `MAT SCI` — Materials Science
- `BIOENGR` — Bioengineering

## npm scripts

```bash
npm run parse:ucla-announcement   # Draft parser metadata
npm run validate:ucla-details     # Validate coe-majors vs catalog
```

## Community hub

Demo content ships in `data/demo/community/ucla.json`. With Supabase configured, run `supabase/migrations/002_community.sql` for live Q&A, announcements, reviews, and alumni outcomes.

Verification: GitHub sign-in email `@ucla.edu` sets verified student badge on answers.
