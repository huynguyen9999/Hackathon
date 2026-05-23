# iGauchoBack — Site layout & information architecture

Defined layout for the UCSB College of Engineering expansion and all future schools.

## Page hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  GLOBAL: Navbar (Home | Schools | Explore | Contribute) + Footer      │
└─────────────────────────────────────────────────────────────┘

/  LANDING
   ├─ Hero: tagline + primary CTA → Explore
   ├─ School picker cards → /schools/ucsb, /schools/ucla
   └─ Value props (3 columns)

/schools  SCHOOL DIRECTORY
   └─ Cards for each registered school → /schools/[school]

/explore  DISCOVERY HUB (multi-school majors)
   ├─ Goal lanes: switching majors | undecided | selective programs
   ├─ Search + filter sidebar (school, college, experience, interest, degree, department)
   ├─ View modes: grid | by college | by department
   ├─ URL shareable filters (?school=ucla&college=engineering&graph=1)
   ├─ ExploreMajorCard → graph (if live) or major guide or official source
   ├─ Compare modal (2 majors: shared prep + careers)
   └─ Empty / no-graph states → major guide + /contribute

/schools/[school]  SCHOOL COMMUNITY HUB
   ├─ Pinned announcements (maintainers)
   ├─ Ask the community Q&A + contributor spotlight
   ├─ Recently updated roadmaps + course review leaderboard
   ├─ Alumni outcomes feed
   └─ College cards → Engineering | (UCSB: L&S, CCS)

/schools/[school]  (legacy note: was UCSB-only overview)

/schools/[school]/engineering  COE HUB
   ├─ CollegeBanner (GEAR) + SchoolHero
   ├─ MajorCatalogGrid (5 BS majors)
   └─ SourceList

/schools/[school]/letters-science  L&S HUB
   ├─ CollegeBanner (DUELS/LASAR) + LsFrameworkCard
   ├─ MajorCatalogGrid (catalog majors)
   └─ SourceList

/schools/[school]/creative-studies  CCS HUB
   ├─ CollegeBanner (CCS Handbook) + CcsFrameworkCard
   ├─ MajorCatalogGrid (9 majors)
   └─ SourceList

/schools/[school]/[college]/[major]  MAJOR REQUIREMENTS
   └─ MajorSheetRequirements + CcsAdmissionCard + CcsQuarterTimeline (CCS)

/schools/[school]/[major]  LEGACY REDIRECT
   └─ → /engineering/{major} or /letters-science/{major} or /creative-studies/{major}

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
| Primary accent | Gaucho blue `#003660` + gold `#FEBC11` |

## Component map

| Component | Used on |
|-----------|---------|
| `Navbar` | All pages |
| `PageHeader` | School hub, Explore, Contribute |
| `SchoolHero` | `/schools/ucsb/engineering` |
| `CollegeBanner` | Engineering + L&S + CCS hubs |
| `LsFrameworkCard` | `/schools/ucsb/letters-science` |
| `CcsFrameworkCard` | `/schools/ucsb/creative-studies` |
| `CcsAdmissionCard` | CCS major detail pages |
| `CcsQuarterTimeline` | CCS major detail pages |
| `MajorCatalogGrid` | College hubs |
| `MajorRequirements` | College major detail pages |
| `ExploreCatalog` | `/explore` |
| `ExploreFilters` | `/explore` |
| `ExploreMajorCard` | `/explore` |
| `ExploreGoalLanes` | `/explore` |
| `ExploreCompareModal` | `/explore` |
| `RoadmapView` | Roadmap page |
| `SourceList` | School hub footer |
| `SearchBar` | Explore |

## UCSB data model

| College | Catalog | Official source |
|---------|---------|-----------------|
| Engineering | `data/ucsb/coe-catalog.json` | GEAR PDF |
| Letters & Science | `data/ucsb/ls-catalog.json` | LASAR / DUELS + department sites |
| Creative Studies | `data/ucsb/ccs-catalog.json` | CCS major sheets + Student Handbook |

- **Interactive roadmaps:** `data/seeds/*.json` (React Flow seeds)
- **Explore index:** `lib/ucsb-explore-index.ts` merges all three catalogs + seed graph flags
- **Interest tags:** `data/ucsb/major-tags.json` (STEM, social-sciences, arts-humanities, pre-professional)
- **Rule:** Catalog = reference; seeds = graph source of truth

### Explore filter query params

| Param | Values | Meaning |
|-------|--------|---------|
| `q` | string | Text search |
| `college` | `engineering,letters-science,creative-studies` | College filter (comma-separated) |
| `experience` | `graph,guide,catalog` | Content depth |
| `degree` | `BA,BS,...` | Degree type |
| `selective` | `all` \| `open` \| `selective` | Admission selectivity |
| `dept` | department names | Multi department |
| `tags` | `stem,social-sciences,...` | Interest clusters |
| `graph` | `1` | Has live interactive graph |
| `undecided` | `1` | Undecided-friendly majors |
| `view` | `grid` \| `college` \| `department` | Layout mode |

Major identity uses `{college}:{slug}` (e.g. `creative-studies:art` vs `letters-science:art`).

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


## Personalization Layer (Roadmap Page)

Roadmap pages now include a planner workspace behind `ENABLE_PLANNER_COLLAB`:

- 4-year / 8-quarter drag-and-drop planner grid
- AP / transfer credit injector
- Degree-audit overlay with bucket percentages and units remaining
- Collaborative save APIs (`/api/plans*`) and advisor comments/share tokens

Until official UCSB connector rollout, planner outputs are advisory and not a replacement for official degree audit systems.
