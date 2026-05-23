# UCSB College of Engineering — Research snapshot

Compiled for iGauchoBack from official UCSB sources (May 2026). Not a live scrape—verify before academic planning.

## College overview

- **Name:** Robert Mehrabian College of Engineering
- **URL:** https://engineering.ucsb.edu/undergraduate
- **Undergraduate BS majors (5):** Chemical Engineering, Computer Engineering, Computer Science, Electrical Engineering, Mechanical Engineering
- **Source:** [Majors & Programs](https://engineering.ucsb.edu/undergraduate/majors-programs)

## Departments & program pages

| Major | Slug | Department / notes | Curriculum source |
|-------|------|-------------------|-------------------|
| Electrical Engineering | `electrical-engineering` | ECE | [ECE Course GRID](https://www.ece.ucsb.edu/undergrad/timeline-advising/grid-table-view) |
| Computer Engineering | `computer-engineering` | ECE + CS joint | [CE 4-Year Plan](https://www.ce.ucsb.edu/undergrad/curriculum/4-year-plan) |
| Computer Science | `computer-science` | CS | [CS undergrad](https://cs.ucsb.edu/education/undergraduate) |
| Mechanical Engineering | `mechanical-engineering` | ME | [ME undergrad](https://me.ucsb.edu/undergraduate) |
| Chemical Engineering | `chemical-engineering` | ChE | [ChE undergrad](https://www.chemengr.ucsb.edu/undergraduate) |

## EE prerequisite chain (high level)

From the ECE typical GRID (2024–2025):

1. **Year 1:** ECE 3, 5, 6 · MATH 3A/3B/4A · PHYS 7A/7B
2. **Year 2:** ECE 10A/10B/10C (+ labs) · ECE 130A · MATH 4B, 6A, 6B · PHYS 7C/7D
3. **Year 3:** ECE 15A · ECE 152A · ECE 134 · ECE 139 · electives
4. **Year 4:** ECE 153A · ECE 188A/B/C (senior project) · ENGR 101

**Example catalog prerequisite:** ECE 154A requires ECE 152A (min C-) — [catalog.ucsb.edu](https://catalog.ucsb.edu/courses/ECE%20154A)

## Agent next steps

1. **Research agent** — Refresh `data/ucsb/coe-catalog.json` from GRID + catalog each quarter.
2. **Data agent** — Generate `data/seeds/ucsb-{major}.json` with nodes/edges per `docs/SITE-LAYOUT.md`.
3. **Graph agent** — Layout: freshman left → senior center → careers right.

Structured catalog: `data/ucsb/coe-catalog.json`
