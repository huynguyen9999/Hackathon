# UCSB College of Letters & Science — research notes

AcadMap catalogs **58 L&S majors** in `data/ucsb/ls-catalog.json`. Sources:

| Source | URL | Use |
|--------|-----|-----|
| Admissions majors | https://admissions.sa.ucsb.edu/majors | Canonical major list (58 L&S) |
| Admissions master JSON | `data/ucsb/admissions-ls-majors.json` | Slugs, degree types |
| DUELS degree requirements | https://duels.ucsb.edu/degree-planning/degree-requirements | LASAR, college-wide rules |
| UCSB General Catalog | https://catalog.ucsb.edu/ | Official program codes (`BSECON`, etc.) |
| Selective majors | https://admissions.sa.ucsb.edu/selective-majors | Transfer GPA / prep notes |
| Department sites | `https://{dept}.ucsb.edu/` or `https://www.{dept}.ucsb.edu/` | Prep, emphases, advising |

## Data pipeline

1. **Master list** — `data/ucsb/admissions-ls-majors.json` (58 majors from admissions).
2. **Department map** — `lib/ucsb-dept-urls.ts` (slug → department URL, catalog code, requirements).
3. **Merge script** — `npm run fetch:ls` runs `scripts/fetch-ls-requirements.ts` to merge into `ls-catalog.json`.
4. **Validate** — `npm run validate:ls` asserts 58 majors, unique slugs, non-empty prep + upper-div.

Optional catalog HTML fetch: `npm run fetch:ls -- --fetch-catalog`

### Major sheet detail pipeline (Wave 1+)

Department **major sheets** and **plans of study** are richer than catalog summaries. Sheet-fidelity data lives in per-major JSON under `data/ucsb/ls-majors/{slug}.json` (type: `LsMajorDetail` in `lib/ucsb-major-detail-types.ts`).

| Step | Command / file | Purpose |
|------|----------------|---------|
| Source registry | `data/ucsb/major-sheet-sources.json` | Slug → dept page, major sheet PDF, plan of study PDF |
| Scaffold fetch | `npm run fetch:sheets` | `scripts/fetch-major-sheets.ts` — preserves hand-authored files |
| Author / QA detail | `data/ucsb/ls-majors/*.json` | Pre-major, prep, UD core, regulations, quarter plans |
| Sync catalog flags | `npm run sync:details` | Sets `detail_available`, `requirements_level`, sheet URLs, career outcomes |
| Validate detail schema | `npm run validate:details` | Asserts every `ls-majors/*.json` file |
| Roadmap seed (Phase 2) | `data/seeds/ucsb-{slug}.json` | Interactive React Flow graph when complete |

**Wave 1 majors with sheet detail (2025–26):**

| Major | Slug | Major sheet | Plan of study |
|-------|------|-------------|---------------|
| Financial Mathematics & Statistics | financial-mathematics-and-statistics | [PSTAT media/160](https://www.pstat.ucsb.edu/media/160) | [media/68](https://www.pstat.ucsb.edu/media/68) |
| Actuarial Science | actuarial-science | PSTAT dept | PSTAT dept |
| Statistics and Data Science | statistics-and-data-science | PSTAT dept | PSTAT dept |
| Economics | economics | Econ dept | Econ dept |
| Economics and Accounting | economics-and-accounting | Econ dept | Econ dept |
| Mathematics | mathematics | Math dept | Math dept |

URLs for Wave 1 are centralized in `major-sheet-sources.json`.

### FMS reference example

Use `data/ucsb/ls-majors/financial-mathematics-and-statistics.json` as the gold-standard template when authoring new detail files.

**Pre-major (40–41 units):** ECON 1–2; MATH 2A/3A–6B + MATH/PSTAT 8; 2.5 GPA; no P/NP.

**Preparation (13–14 units):** One of CMPSC 8/9/16 or ENGR 3; ECON 10A; PSTAT 10.

**Upper-division (52 units):** MATH 104A-B-C, 117; PSTAT 120A-B, 126, 160A-B, 170; 12-unit elective pool.

**UI:** `/schools/ucsb/letters-science/financial-mathematics-and-statistics` renders `MajorSheetRequirements`, `MajorRegulationsCard`, and `QuarterTimeline` (GE/LASAR slots via `lib/lasar-planning.ts`).

**Roadmap:** `data/seeds/ucsb-financial-mathematics-and-statistics.json` — `roadmap_available: true`, link from major page.

### Major sheet QA checklist

When parsing or hand-authoring `ls-majors/{slug}.json`:

1. Split **pre-major** vs **preparation** vs **upper-division** blocks correctly (do not put UD courses in prep).
2. Course codes match the PDF exactly (e.g. PSTAT 120A is upper-division, not pre-major).
3. Unit totals and `choose_n` / `choose_units` elective pools match the sheet.
4. Regulations: GPA thresholds, letter-grade-only, P/NP, excluded courses, transfer tiers.
5. `recommended_plans`: freshman and transfer tracks with quarter/year labels from the plan-of-study PDF.
6. Run `npm run validate:details` and `npm run sync:details` before merging.

## Slug aliases (legacy redirects)

| Old slug | Canonical slug |
|----------|------------------|
| `psychology` | `psychological-and-brain-sciences` |
| `biology` | `biological-sciences` |

Legacy `/schools/ucsb/{major}` redirects resolve aliases via `resolveLsSlug()`.

## Department URL pattern

Most L&S departments use:

- `https://{dept}.ucsb.edu/` (e.g. biology.ucsb.edu)
- `https://www.{dept}.ucsb.edu/` (e.g. www.chem.ucsb.edu, www.philosophy.ucsb.edu)

Each major entry sets `department_url`, `curriculum_url`, `catalog_program_code`, and `admissions_url`.

## All 58 L&S majors (A–Z)

| Major | Slug | Degree |
|-------|------|--------|
| Actuarial Science | actuarial-science | BS |
| Anthropology | anthropology | BA |
| Applied Mathematics | applied-mathematics | BS |
| Aquatic Biology | aquatic-biology | BS |
| Art | art | BA |
| Asian American Studies | asian-american-studies | BA |
| Asian Studies | asian-studies | BA |
| Biochemistry | biochemistry | BS |
| Biological Sciences | biological-sciences | BA/BS |
| Biopsychology | biopsychology | BS |
| Black Studies | black-studies | BA |
| Chemistry | chemistry | BS |
| Chicano and Chicana Studies | chicano-and-chicano-studies | BA |
| Chinese | chinese | BA |
| Classics | classics | BA |
| Communication | communication | BA |
| Comparative Literature | comparative-literature | BA |
| Dance | dance | BA/BFA |
| Earth Science | earth-science | BA/BS |
| Ecology and Evolution | ecology-and-evolution | BS |
| Economics | economics | BA |
| Economics and Accounting | economics-and-accounting | BA |
| English | english | BA |
| Environmental Studies | environmental-studies | BA/BS |
| Feminist Studies | feminist-studies | BA |
| Film and Media Studies | film-and-media-studies | BA |
| Financial Mathematics and Statistics | financial-mathematics-and-statistics | BS |
| French | french | BA |
| Geography | geography | BA/BS |
| German | german | BA |
| Global Studies | global-studies | BA |
| History | history | BA |
| History of Art and Architecture | history-of-art-and-architecture | BA |
| History of Policy, Law, and Governance | history-of-policy-law-and-governance | BA |
| Hydrologic Sciences and Policy | hydrologic-sciences-and-policy | BS |
| Italian Studies | italian-studies | BA |
| Japanese | japanese | BA |
| Language, Culture, and Society | language-culture-and-society | BA |
| Latin American and Iberian Studies | latin-american-and-iberian-studies | BA |
| Linguistics | linguistics | BA |
| Mathematics | mathematics | BA/BS |
| Medieval Studies | medieval-studies | BA |
| Middle East Studies | middle-east-studies | BA |
| Molecular and Cellular Biology | molecular-and-cellular-biology | BS |
| Music Performance / Music Studies | music-performance-music-studies | BM/BA |
| Philosophy | philosophy | BA |
| Physics | physics | BA/BS |
| Physiology | physiology | BS |
| Political Science | political-science | BA |
| Portuguese | portuguese | BA |
| Psychological and Brain Sciences | psychological-and-brain-sciences | BA |
| Religious Studies | religious-studies | BA |
| Russian and East European Studies | russian-and-east-european-studies | BA |
| Sociology | sociology | BA |
| Spanish | spanish | BA |
| Statistics and Data Science | statistics-and-data-science | BA/BS |
| Theater | theater | BA/BFA |
| Zoology | zoology | BS |

## Routes

- `/schools/ucsb` — college picker (Engineering + L&S)
- `/schools/ucsb/letters-science` — L&S hub (search + A–Z, 58 majors)
- `/schools/ucsb/letters-science/[major]` — major requirements (sheet detail when `detail_available`, else summary)
- `/roadmap/ucsb/financial-mathematics-and-statistics` — FMS interactive roadmap (Phase 2 pilot)
- Legacy `/schools/ucsb/{major}` redirects to engineering or L&S path

## LASAR vs GEAR

- **CoE** uses GEAR (`data/ucsb/coe-catalog.json`).
- **L&S** uses LASAR + GE Areas A–G and special subjects (WRT, EUR, NWC, QNT, ETH). Framework text lives in `requirements_framework` on the catalog JSON.

## Cluster agent prompts (QA pass)

When extending or verifying requirements, split work by cluster:

| Cluster | Majors | Primary sources |
|---------|--------|-----------------|
| **Sciences** | Bio family, Chem, Physics, Math, Stats, Earth, Ecology, etc. | biology.ucsb.edu, chem.ucsb.edu, catalog |
| **Social sciences** | Econ, Poli Sci, Soc, Anthro, Global, Environmental, etc. | dept sites + selective-majors |
| **Humanities** | English, History, Philosophy, Classics, Religious, etc. | dept sites + catalog |
| **Languages & arts** | French, Spanish, Chinese, Art, Dance, Theater, Music, etc. | dept sites + catalog |

After agent edits, run `npm run fetch:ls` and `npm run validate:ls`.

## Agents

When extending L&S data:

1. Update `lib/ucsb-dept-urls.ts` for new/changed majors.
2. Run `npm run fetch:ls` to regenerate `ls-catalog.json`.
3. Run `npm run validate:ls` and `npm run build`.
4. Set `roadmap_available: true` only when a seed exists under `data/seeds/`.

When adding **major sheet detail**:

1. Add PDF URLs to `data/ucsb/major-sheet-sources.json`.
2. Author `data/ucsb/ls-majors/{slug}.json` (use FMS as reference — see Major sheet detail pipeline above).
3. Run `npm run validate:details` → `npm run sync:details` → `npm run build`.
4. Optional Phase 2: create `data/seeds/ucsb-{slug}.json` and re-run `sync:details` for `roadmap_available`.
