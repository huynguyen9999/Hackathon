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
- `/schools/ucsb/letters-science/[major]` — major requirements
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
