# UCSB College of Letters & Science — research notes

AcadMap catalogs L&S majors in `data/ucsb/ls-catalog.json`. Sources:

| Source | URL | Use |
|--------|-----|-----|
| Admissions majors | https://admissions.sa.ucsb.edu/majors | Major list, degree types |
| DUELS degree requirements | https://duels.ucsb.edu/degree-planning/degree-requirements | LASAR, college-wide rules |
| UCSB General Catalog | https://catalog.ucsb.edu/ | Official course/program codes |
| Department sites | `https://{dept}.ucsb.edu/` or `https://www.{dept}.ucsb.edu/` | Prep, emphases, advising |

## Department URL pattern

Most L&S departments use:

- `https://{dept}.ucsb.edu/` (e.g. biology.ucsb.edu)
- `https://www.{dept}.ucsb.edu/` (e.g. www.chem.ucsb.edu, www.philosophy.ucsb.edu)

Each major entry sets `department_url` (home or undergrad page) and `curriculum_url` (major sheet, catalog program, or undergrad requirements).

## Featured majors (verified URLs)

| Major | `department_url` | Notes |
|-------|------------------|-------|
| Chemistry (BS) | https://www.chem.ucsb.edu/ | ACS track; heavy CHEM sequence |
| Biology (BS) | https://www.biology.ucsb.edu/ | EEMB / MCDB tracks |
| Philosophy (BA) | https://www.philosophy.ucsb.edu/ | Core or Ethics & Public Policy emphasis |

## Routes

- `/schools/ucsb` — college picker (Engineering + L&S)
- `/schools/ucsb/letters-science` — L&S hub
- `/schools/ucsb/letters-science/[major]` — major requirements
- Legacy `/schools/ucsb/{major}` redirects to engineering or L&S path

## LASAR vs GEAR

- **CoE** uses GEAR (`data/ucsb/coe-catalog.json`).
- **L&S** uses LASAR + GE Areas A–G and special subjects (WRT, EUR, NWC, QNT, ETH). Framework text lives in `requirements_framework` on the catalog JSON.

## Agents

When extending L&S data:

1. Add or update entries in `ls-catalog.json` (snake_case).
2. Use real `department_url` from the department site—not guessed paths.
3. Summarize prep and upper-division from catalog + department pages; link `curriculum_url` for details.
4. Set `roadmap_available: true` only when a seed exists under `data/seeds/`.
