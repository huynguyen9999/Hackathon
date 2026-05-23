# AcadMap — Site layout & information architecture

Defined layout for the UCSB College of Engineering expansion and all future schools.

## Page hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  GLOBAL: Navbar (Home | Explore | Contribute) + Footer      │
└─────────────────────────────────────────────────────────────┘

/  LANDING
   ├─ Hero: tagline + primary CTA → Explore
   ├─ Featured colleges → /schools/ucsb/engineering, /schools/ucsb/letters-science
   └─ Value props (3 columns)

/explore  CATALOG
   ├─ Search (school / major)
   └─ Roadmap cards → /roadmap/[school]/[major]

/schools/[school]  UCSB OVERVIEW
   └─ College cards → Engineering | Letters & Science

/schools/[school]/engineering  COE HUB
   ├─ CollegeBanner (GEAR) + SchoolHero
   ├─ MajorCatalogGrid (5 BS majors)
   └─ SourceList

/schools/[school]/letters-science  L&S HUB
   ├─ CollegeBanner (DUELS/LASAR) + LsFrameworkCard
   ├─ MajorCatalogGrid (catalog majors)
   └─ SourceList

/schools/[school]/[college]/[major]  MAJOR REQUIREMENTS
   └─ MajorRequirements + department links

/schools/[school]/[major]  LEGACY REDIRECT
   └─ → /engineering/{major} or /letters-science/{major}

/roadmap/[school]/[major]  GRAPH VIEWER
   ├─ Breadcrumb: Explore → School → Major
   ├─ Header: degree type, node/edge counts, status
   ├─ Main: React Flow canvas (70%)
   └─ Sidebar: node detail panel (30%)

/contribute  SUBMIT
   └─ Auth + seed JSON instructions
```

## Layout grid (all pages)

| Token | Value |
|-------|--------|
| Max width | `max-w-6xl` (catalog), `max-w-[1600px]` (graph) |
| Horizontal padding | `px-4 sm:px-6` |
| Section spacing | `py-10 sm:py-14` |
| Card radius | `rounded-2xl` |
| Primary accent | indigo → violet gradient |

## Component map

| Component | Used on |
|-----------|---------|
| `Navbar` | All pages |
| `PageHeader` | School hub, Explore, Contribute |
| `SchoolHero` | `/schools/ucsb/engineering` |
| `CollegeBanner` | Engineering + L&S hubs |
| `LsFrameworkCard` | `/schools/ucsb/letters-science` |
| `MajorCatalogGrid` | College hubs |
| `MajorRequirements` | College major detail pages |
| `ExploreCatalog` | `/explore` |
| `RoadmapView` | Roadmap page |
| `SourceList` | School hub footer |
| `SearchBar` | Explore |

## UCSB data model

| College | Catalog | Official source |
|---------|---------|-----------------|
| Engineering | `data/ucsb/coe-catalog.json` | GEAR PDF |
| Letters & Science | `data/ucsb/ls-catalog.json` | LASAR / DUELS + department sites |

- **Interactive roadmaps:** `data/seeds/*.json` (React Flow seeds)
- **Rule:** Catalog = reference; seeds = graph source of truth

## Agent delegation (UCSB data)

| Agent | Task | Output |
|-------|------|--------|
| **CoE research** | GEAR + department grids | `coe-catalog.json`, `docs/GEAR-25-26.md` |
| **L&S research** | Admissions, DUELS, dept URLs | `ls-catalog.json`, `docs/UCSB-LS-RESEARCH.md` |
| **Data** | Convert catalog → seed JSON | `data/seeds/ucsb-{major}.json` |
| **Product** | College hubs + major pages | `app/schools/[school]/**` |
| **Graph** | Position nodes by year/quarter | `lib/layout/dagre.ts` optional |

## Visual zones (roadmap page)

```
┌──────────────────────────────────────────────────┬─────────────┐
│                                                  │   SIDEBAR   │
│              REACT FLOW CANVAS                   │   Detail    │
│         (courses left → careers right)           │   panel     │
│                                                  │             │
└──────────────────────────────────────────────────┴─────────────┘
     Legend: ── prerequisite   ╌╌ recommended   ── leads_to
```

## Responsive behavior

- **Desktop:** graph + sidebar side-by-side
- **Mobile:** graph full width; sidebar below (280px min height)
- **Explore / School hub:** 1 → 2 → 3 column card grids
