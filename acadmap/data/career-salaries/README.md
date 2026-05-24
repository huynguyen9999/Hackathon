# Career salary catalog

Curated US entry-level compensation estimates for roadmap career outcome nodes. Data is researched from [Glassdoor Salaries](https://www.glassdoor.com/Salaries/index.htm) and stored as static JSON — not scraped at runtime.

## Files

| File | Purpose |
|------|---------|
| `index.json` | Canonical `CareerSalaryProfile` objects keyed by slug (~70–90 roles) |
| `aliases.json` | Maps exact seed career titles → slug keys in `index.json` |

Regenerate both files from `acadmap/`:

```bash
node ./node_modules/tsx/dist/cli.mjs scripts/generate-career-salary-catalog.ts
```

## Quarterly refresh checklist

Run this process every **~3 months** (Jan, Apr, Jul, Oct) to keep estimates current.

### 1. Prepare

- [ ] Note today's date; target `as_of` field format is `YYYY-MM` (e.g. `2025-07`).
- [ ] Open [Glassdoor Salaries](https://www.glassdoor.com/Salaries/index.htm) in a browser (no API; manual research only).
- [ ] Pull the current list of career titles from seeds: scan `data/seeds/*.json` for `node_type: "career"` titles and labels.

### 2. Research each canonical slug

For each slug in `index.json`:

- [ ] Search Glassdoor for **"Entry level {role}"** (US national).
- [ ] Record **median** and **25th–75th percentile** (or stated range) from Glassdoor **Total Pay** estimates.
- [ ] Update `median`, `range_low`, `range_high` in `scripts/generate-career-salary-catalog.ts` (`PROFILES` object).
- [ ] Paste the exact Glassdoor page URL into `source_url`.
- [ ] Set `glassdoor_search_title` to the query that returned the best match.

### 3. California callouts

- [ ] For tech, engineering, biotech, and other CA-heavy roles, filter Glassdoor by **California** or open the CA sub-page.
- [ ] If CA median is **≥ ~12% above US**, set `california_median` and a short `california_note`.
- [ ] If CA is not materially higher, remove `california_median` / `california_note`.

### 4. Graduate / non-W-2 outcomes

- [ ] Roles mapped to `graduate-program` stay `salary_type: "stipend_or_na"` — do **not** assign a false full-time salary.
- [ ] Update the stipend note if national grad stipend ranges shift materially.

### 5. Aliases

- [ ] After seed changes, update `CAREER_TITLES` and `ALIASES` in the generator script so every career title resolves.
- [ ] Group similar titles to the same slug (e.g. "ML Engineer" and "Machine learning" → `ml-engineer`).

### 6. Regenerate & verify

- [ ] Run the generator (command above).
- [ ] Confirm `aliases.json` entry count matches the seed title list.
- [ ] Run `npm run validate:career-salaries` (when available) — must pass with 0 missing titles.
- [ ] Run `npm run build`.
- [ ] Spot-check 2–3 roadmaps: career hex badges show salary; sidebar shows US range, CA note (if any), and Glassdoor source link.

### 7. Legal / product

- [ ] Display is **attribution + outbound link only** — do not cache Glassdoor HTML or impersonate their API.
- [ ] UI disclaimer remains: *"Estimates from Glassdoor; not a job offer. Verify on linked source."*

## Type reference

See `CareerSalaryProfile` in `lib/types.ts`.
