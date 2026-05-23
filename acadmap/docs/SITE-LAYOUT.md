# AcadMap — Site layout & information architecture

Defined layout for the UCSB College of Engineering expansion and all future schools.

## Page hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  GLOBAL: Navbar (Home | Explore | Contribute) + Footer      │
└─────────────────────────────────────────────────────────────┘

/  LANDING
   ├─ Hero: tagline + primary CTA → Explore
   ├─ Featured school strip → /schools/ucsb
   └─ Value props (3 columns)

/explore  CATALOG
   ├─ Search (school / major)
   └─ Roadmap cards → /roadmap/[school]/[major]

/schools/[school]  SCHOOL HUB  ← NEW (UCSB CoE)
   ├─ School hero (name, college, official link)
   ├─ Stats row (majors count, roadmap status)
   ├─ Major grid (5 CoE majors)
   │    ├─ Available → open roadmap
   │    └─ Coming soon → official curriculum link
   ├─ Data sources (attribution)
   └─ Agent note: how to contribute JSON seeds

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
| `SchoolHero` | `/schools/ucsb` |
| `MajorCatalogGrid` | School hub |
| `ExploreCatalog` | `/explore` |
| `RoadmapView` | Roadmap page |
| `SourceList` | School hub footer |
| `SearchBar` | Explore |

## UCSB CoE data model

- **Catalog file:** `data/ucsb/coe-catalog.json` (research snapshot, not live scrape)
- **Interactive roadmaps:** `data/seeds/*.json` (React Flow seeds)
- **Rule:** Catalog = reference; seeds = graph source of truth

## Agent delegation (UCSB data)

| Agent | Task | Output |
|-------|------|--------|
| **Research** | Fetch official curriculum pages | Update `coe-catalog.json` + `docs/UCSB-COE-RESEARCH.md` |
| **Data** | Convert catalog → seed JSON | `data/seeds/ucsb-{major}.json` |
| **Product** | School hub + layout components | `app/schools/[school]/page.tsx` |
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
