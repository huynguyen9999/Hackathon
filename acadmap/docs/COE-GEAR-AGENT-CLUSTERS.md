# CoE GEAR — parallel agent workflow

One agent per engineering major (5 total — run in parallel).

## Per-major agent prompt

```
You are upgrading UCSB CoE major {SLUG} to GEAR fidelity.

1. Parse GEAR 2025-26 p.{GEAR_PAGE} requirement sheet + GRID table (units per quarter).
   PDF: https://engineering.ucsb.edu/sites/default/files/docs/25-26_GEAR.pdf
2. Cross-check data/ucsb/gear-sources.json dept course_grid_url.
3. Update data/ucsb/coe-majors/{slug}.json (quality_tier: "gear").
4. Update data/seeds/ucsb-{slug}.json (~20 nodes, prereq edges, 3-4 careers).
5. Run npm run validate:coe-details && npm run sync:coe-details && npm run build.
```

## Major assignments

| Agent | Major | Slug | GEAR page |
|-------|-------|------|-----------|
| A | Chemical Engineering | chemical-engineering | 14 |
| B | Computer Engineering | computer-engineering | 16 |
| C | Computer Science | computer-science | 18 |
| D | Electrical Engineering | electrical-engineering | 20 |
| E | Mechanical Engineering | mechanical-engineering | 22 |

## QA checklist

1. `quarter_totals` match GEAR GRID TOTAL rows exactly.
2. Lab courses (ECE 10AL, etc.) listed with correct units.
3. Elective pools use GEAR labels (ECE Elective, CMPEN Elective, Field Elective).
4. CS includes `science_courses` List A (8u) + List B (12u).
5. Regulations: letter grade for major, 12 min units/qtr, 215-unit cap.

## Pipeline

```bash
cd acadmap
npm run validate:coe-details
npm run sync:coe-details
npm run build
```

Reference detail: `data/ucsb/coe-majors/electrical-engineering.json`
