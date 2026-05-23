# UCSB College of Engineering — Senior Capstones

Reference for iGauchoBack roadmap seeds. Verify with department advisers before academic planning.

## Summary

| Major | Capstone sequence | Required? | Typical quarters |
|-------|-------------------|-----------|------------------|
| Electrical Engineering | ECE 188A → 188B → 188C | **Yes** | Fall / Winter / Spring |
| Computer Engineering | ECE 189A → 189B → 189C (or CMPSC 189A-B alt.) | **Yes** | 3 quarters |
| Mechanical Engineering | ME 189A → 189B → 189C | **Yes** | 3 quarters |
| Chemical Engineering | CH E 184A → 184B | **Yes** | 2 quarters |
| Computer Science | CMPSC 189A → 189B | **No** (major-field elective) | Fall / Winter optional |

**Computer Science is the exception:** GEAR lists CMPSC 189A-B among major field electives (56 units to choose from), not in upper-division required courses. Many CS students complete the BS in **9 quarters (3 years)** without taking capstone.

## Electrical Engineering — ECE 188A/B/C

- **Source:** [ECE Senior Capstone Projects](https://www.ece.ucsb.edu/undergrad/curriculum/senior-projects)
- **Prerequisites:** ECE 153A or ECE 153B (153A may be taken concurrently with 188A per GEAR)
- **Units:** 188A (5), 188B (4), 188C (4)
- **Format:** Teams design and build hardware/software systems sponsored by faculty research groups or industry. Spring quarter culminates at the [COE Engineering Design Expo (EDX)](https://capstone.engineering.ucsb.edu).
- **188A (Fall):** Project selection, design specifications, budget, initial prototype
- **188B (Winter):** Mid-project design review, PCB design, second prototype
- **188C (Spring):** Final integration, demo, EDX presentation

## Computer Engineering — ECE 189A/B/C

- **Source:** [ECE Senior Projects](https://www.ece.ucsb.edu/undergrad/curriculum/senior-projects) + [GEAR CmpE grid](https://engineering.ucsb.edu/sites/default/files/docs/25-26_GEAR.pdf)
- **Prerequisites:** ECE 153B for ECE 189 track; CMPSC 156 for CMPSC 189 alternative
- **Alternative:** CMPSC 189A-B satisfies part of the capstone requirement per GEAR alternatives

## Mechanical Engineering — ME 189A/B/C

- **Source:** [ME Capstone Projects](https://me.ucsb.edu/undergraduate/academics/capstone-projects)
- **Prerequisites:** ME 156A (companion design courses)
- **Format:** Team engineering design under faculty advisor; hands-on build; EDX showcase

## Chemical Engineering — CH E 184A/B

- **Source:** GEAR 2025-2026 + [COE EDX](https://capstone.engineering.ucsb.edu)
- **Format:** Two-quarter senior process design capstone following CH E 180A lab sequence

## Computer Science — CMPSC 189A/B (optional)

- **Source:** [UCSB CS Capstone](https://capstone.cs.ucsb.edu/)
- **Listed as:** Major field elective only (not upper-div required)
- **Format:** 2-quarter Fall/Winter industry-sponsored software project; public presentation in March
- **Graduation:** Not required; core path is CMPSC 130A-B + ENGR 101 + electives

## Roadmap graph conventions

Capstone course nodes in `data/seeds/ucsb-*.json` use:

```json
"metadata": { "role": "capstone", "sequence": 1, "optional": false }
```

Set `"optional": true` only for CS CMPSC 189 nodes. The graph UI shows a **Capstone** badge on these nodes and an **Optional elective** badge when applicable.

## Related docs

- [UCSB-COE-RESEARCH.md](./UCSB-COE-RESEARCH.md) — department URLs and EE prerequisite chain
- [GEAR-25-26.md](./GEAR-25-26.md) — catalog year reference
