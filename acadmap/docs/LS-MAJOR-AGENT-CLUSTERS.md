# L&S major detail — parallel agent clusters

Use **four concurrent Cursor agents** (or subagents) to upgrade majors from `quality_tier: "catalog"` to `quality_tier: "sheet"` by parsing department major sheets and plans of study.

## Current coverage

| Tier | Count | Source |
|------|-------|--------|
| **Sheet** (hand QA) | 6 | Wave 1: PSTAT×3, Econ×2, Math |
| **Catalog** (auto) | 52 | `npm run generate:details` from `ls-catalog.json` |
| **Roadmap** | 2+ | `data/seeds/ucsb-{slug}.json` when present |

Run after any batch work:

```bash
cd acadmap
npm run validate:details
npm run sync:details
npm run build
```

## Agent cluster assignments

Split the **52 catalog-tier** majors across four agents. Each agent owns **one cluster** and must not edit files outside its slug list without coordination.

### Agent A — Physical & life sciences (14)

`biochemistry`, `biological-sciences`, `biopsychology`, `aquatic-biology`, `ecology-and-evolution`, `molecular-and-cellular-biology`, `physiology`, `zoology`, `chemistry`, `physics`, `earth-science`, `hydrologic-sciences-and-policy`, `applied-mathematics`, `environmental-studies`

**Sources:** biology.ucsb.edu, chem.ucsb.edu, physics.ucsb.edu, catalog.ucsb.edu/programs/*

### Agent B — Social sciences & policy (14)

`anthropology`, `communication`, `economics` *(upgrade if needed)*, `environmental-studies`, `feminist-studies`, `film-and-media-studies`, `global-studies`, `history-of-policy-law-and-governance`, `political-science`, `psychological-and-brain-sciences`, `sociology`, `asian-american-studies`, `black-studies`, `chicano-and-chicano-studies`

**Sources:** dept sites + admissions selective-majors page

### Agent C — Humanities (12)

`english`, `history`, `philosophy`, `classics`, `religious-studies`, `comparative-literature`, `history-of-art-and-architecture`, `medieval-studies`, `linguistics`, `language-culture-and-society`, `history-of-policy-law-and-governance`, `comparative-literature`

### Agent D — Languages & arts (12)

`art`, `dance`, `theater`, `music-performance-music-studies`, `french`, `spanish`, `chinese`, `japanese`, `german`, `portuguese`, `italian-studies`, `latin-american-and-iberian-studies`, `russian-and-east-european-studies`, `asian-studies`, `middle-east-studies`

## Per-major agent prompt (copy-paste)

```
You are upgrading UCSB L&S major {SLUG} to sheet fidelity.

1. Find official major sheet PDF + plan of study on department site (or catalog.ucsb.edu/programs/{CODE}).
2. Add URLs to data/ucsb/major-sheet-sources.json if missing.
3. Rewrite data/ucsb/ls-majors/{SLUG}.json following lib/ucsb-major-detail-types.ts.
   - Use financial-mathematics-and-statistics.json or actuarial-science.json as reference.
   - Split pre-major / preparation / upper-division correctly.
   - Include freshman + transfer recommended_plans from plan PDF.
   - Set quality_tier: "sheet".
4. Run npm run validate:details && npm run sync:details.
5. Do NOT edit the plan file in .cursor/plans/.
```

## Actuarial Science reference (gold standard #2)

- **Major sheet:** https://www.pstat.ucsb.edu/media/161
- **BS plan:** https://www.pstat.ucsb.edu/media/69
- **BS/MS plan:** [2025-26 BS/MS PDF](https://www.pstat.ucsb.edu/sites/default/files/2025-10/Recommended%20Plan%20of%20Study%20Template%20%2825-26%20FINAL%29%20-%20Actuarial%20Science%20BS_MS%20Program.pdf)
- **Combined program:** https://www.pstat.ucsb.edu/undergraduate/majors-minors/actuarial-science-major/combined-bs-ms-program
- **Detail file:** `data/ucsb/ls-majors/actuarial-science.json` — includes `program_variants`, `bs_ms` / `bs_ms_transfer` tracks, year 5 MS courses
- **Roadmap:** `data/seeds/ucsb-actuarial-science.json`

## Wave priority (after Wave 1)

| Wave | Departments | Target |
|------|-------------|--------|
| 2 | Bio/EEMB/MCDB, Chem, Physics | 12 majors → sheet |
| 3 | Psych, Poli Sci, Soc, Anthro, Comm, Global, Env S | 12 majors |
| 4 | English, History, Phil, Classics, RS | 10 majors |
| 5 | Languages & arts | 18 majors |

## QA checklist

1. Pre-major vs prep vs UD split matches PDF section headers.
2. No upper-division courses listed in prep (common error: PSTAT 120A in prep).
3. Unit totals and elective pools (`choose_units`, `choose_n`) match sheet.
4. Regulations: GPA, P/NP, excluded courses, transfer rules.
5. `recommended_plans` match plan-of-study PDF (freshman + transfer minimum).
6. `quality_tier: "sheet"` only after human QA pass.
