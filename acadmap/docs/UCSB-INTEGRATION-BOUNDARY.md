# UCSB Integration Boundary

## Why this boundary exists

Current production needs planner, credit injection, and audit overlays now, while live UCSB official-system access may arrive later.

The integration boundary isolates provider-specific code behind one connector interface.

Curriculum search (undergrad + graduate courses) is documented in [UCSB-CURRICULUM.md](./UCSB-CURRICULUM.md) and implemented in `lib/ucsb-curriculum.ts`.

Grade distributions and GE data (Daily Nexus snapshots) are documented in [UCSB-GRADES.md](./UCSB-GRADES.md) and implemented in `lib/ucsb-grades.ts` / `lib/ucsb-ges.ts`.

## Connector interface

Defined in `lib/integrations/ucsb/connector.ts`:

- `getDegreeAuditRules(schoolShortName, majorSlug)`
- `getCreditRules()`

## Providers

- `snapshotProvider` (active by default)
  - reads curated catalog/rules JSON
  - supports planner and audit functionality immediately
- `officialProvider` (placeholder)
  - intentionally throws until official API credentials and contracts are approved

## Data sync pipeline

`scripts/sync-ucsb-rules.ts` validates local rules datasets:

- `data/ucsb/rules/ap-credit-rules.json`
- `data/ucsb/rules/transfer-credit-rules.json`

Use this script in CI or scheduled jobs before publishing rule updates.

## Migration path to live UCSB systems

1. Implement official provider client + auth
2. Keep connector return shape unchanged
3. Flip `USE_OFFICIAL_UCSB_CONNECTOR=true` for internal users
4. Validate parity against snapshot outputs
5. Gradually roll out campus-wide
