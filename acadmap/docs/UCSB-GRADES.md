# UCSB Grade Distributions & GE Data

Historical UCSB grade distributions and General Education (GE) applicability, sourced from [Daily Nexus open data](https://github.com/dailynexusdata/grades-data) (CPRA / Office of the Registrar).

## Data provenance

| Asset | Source | Use |
|-------|--------|-----|
| `courseGrades.csv` | [dailynexusdata/grades-data](https://github.com/dailynexusdata/grades-data) | Per-offering grade counts, avg GPA, instructor, quarter |
| `ges.csv` | Same repo | GE / special-subject applicability (Area B–G, Writing, World Cult, etc.) |
| Live UI reference | [dailynexus.com/interactives/grades](https://dailynexus.com/interactives/grades/) | UX parity + attribution |

**Attribution required:** Daily Nexus / Office of the Registrar via CPRA. Link to the [Nexus interactive](https://dailynexus.com/interactives/grades/) and contact `data@dailynexus.com` for data questions.

## Snapshot layout

Processed snapshots live under `data/ucsb/grades/` (committed, deploy-safe):

```
data/ucsb/grades/
  meta.json                 # attribution, asOf, quarter range
  search-index.json         # all courses: courseId, dept, avgGpa, offeringCount
  leaderboards.json         # top/bottom GPA, most offerings
  by-dept/{DEPT}.json       # CourseGradeAggregate[] per department
  ges/
    areas.json              # area labels + descriptions
    by-course.json          # courseId → areas[]
    by-area/{area}.json     # courseId[] per GE area
```

Raw CSVs are downloaded to `data/ucsb/grades/raw/` (gitignored).

## Refresh workflow

```bash
npm run fetch:ucsb-grades    # download latest CSVs from GitHub
npm run build:ucsb-grades    # parse → JSON snapshots
npm run validate:ucsb-grades # schema + spot-check known courses
```

Commit updated snapshots under `data/ucsb/grades/` after a successful build.

## App integration

| Surface | Path / module |
|---------|----------------|
| Grades hub | `/schools/ucsb/grades` |
| API | `GET /api/ucsb/grades`, `GET /api/ucsb/ges` |
| Server lib | `lib/ucsb-grades.ts`, `lib/ucsb-ges.ts` |
| Client URLs | `lib/ucsb-grades-urls.ts` (no `fs`) |
| Roadmap sidebar | `GradeDistributionSidebarSection` → `/api/ucsb/grades?course=` |
| Course catalog | `GradeDistributionCatalogSection` in `CourseDetailPanel` |

Snapshots are read at request time on the server only. The app never proxies live Daily Nexus CSVs per request.

## GE column mapping

GE areas match `ges.csv` columns:

- **Area B** — Foreign Language
- **Area C** — Science, Mathematics, Technology
- **Area D** — Social Sciences
- **Area E** — Culture and Thought
- **Area F** — Arts
- **Area G** — Literature
- **Writing**, **Ethnicity**, **World Cult**, **Euro Trad**, **Quant Relationships**, **AHI**

See `lib/ucsb-ges-types.ts` for the canonical `GeAreaId` enum.

## Normalization

- Course key: uppercase `"ECE 130A"` (matches roadmap `label` and catalog `courseId`)
- Dept shard: `dept` column from CSV (e.g. `"CH E"` for Chemical Engineering)
- Rollup GPA: enrollment-weighted average of `avgGPA` across offerings
- Grade chart: sum of letter-grade buckets across all offerings

## Limitations

- Courses with **fewer than five enrolled students** are excluded from source data
- Grade counts are **before P/NP and S/U conversions** where applicable (per Nexus README)
- Optional grading and incomplete grades may affect averages
- Data is UCSB-only; no UCLA or other campuses
- Grades complement community course reviews; they do not replace them

## Related docs

- [UCSB Curriculum Catalog](./UCSB-CURRICULUM.md) — course search and catalog snapshots
- [UCSB Integration Boundary](./UCSB-INTEGRATION-BOUNDARY.md) — what is in-repo vs external
