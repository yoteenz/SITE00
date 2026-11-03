/**
 * P0.SITE00.STUDIOWORLD.MEDIA-PROJECT-OWNERSHIP-AND-EXCHANGE-INDEPENDENCE.V1 — deliverable generator.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SPRINT = 'P0.SITE00.STUDIOWORLD.MEDIA-PROJECT-OWNERSHIP-AND-EXCHANGE-INDEPENDENCE.V1';
const OUT = 'docs/site00/studioworld/media-project-ownership-v1';

const files: Record<string, string> = {
  '01_PROJECT_OWNERSHIP_FORENSIC_AUDIT.md': `# 01 — Project ownership forensic audit

**Sprint:** ${SPRINT}

## Root cause (verified)

THE EXCHANGE was **not** owned by Studio World in \`FOUNDER_PROJECTS\` or canon trees. The founder-visible error was **registry and discovery fragmentation**:

| Layer | THE EXCHANGE before repair |
| --- | --- |
| \`api/_lib/site00Projects/projectRegistry.ts\` | Present (\`SERIALIZED_FICTION\`) |
| \`managedProjectRegistry.ts\` | **Missing** → not in Production switcher |
| \`projectIndexOrder.ts\` | **Missing** → no portfolio numbering |
| \`orgRegistry.ts\` | **Missing org UUID** → \`resolveSite00ProjectIndexEntry\` returned **null** |
| \`evolveService\` ORG_CLASS | **Missing** → misclassified as generic managed brand |
| Production Hub project list | Fell back to design-enabled set only → **invisible** next to NDXBOOK |

Studio World naming in package paths (\`site00-studio-world-production\`) is **workspace machinery**, not creative parentage. No code path set \`parentProjectId: studio-world\` on THE EXCHANGE.

## Error class

- **Presentation / discovery gap** (primary)
- **Index / org registry gap** (blocking founder Projects index)
- **Not** duplicate managed-project row
- **Not** destructive data migration required
`,

  '02_NDXBOOK_PROJECT_REFERENCE_ANALYSIS.md': `# 02 — NDXBOOK reference analysis

NDXBOOK models **independent founder media work** via:

- Founder index slug \`ndxbook\` with org UUID in \`orgRegistry\`
- \`PROJECT_INDEX_CANONICAL_ORDER\` placement (peer to infrastructure, not child)
- \`managedProjectRegistry\` row (\`MANAGED_BRAND\`, \`designEnabled: true\`)
- Production workspace routes \`/production/ndxbook/*\`
- Project detail surfaces under \`/projects/ndxbook\`

THE EXCHANGE reuses **project-level semantics** (own slug, org id, index row, production switcher, scoped URLs) but **not** NDXBOOK story, Expression Entry 002, or design-first website reconstruction (\`designEnabled: false\`, \`productionSpine: true\`).
`,

  '03_EXCHANGE_CURRENT_CLASSIFICATION.md': `# 03 — THE EXCHANGE current classification

| Field | Value |
| --- | --- |
| Managed key | \`the-exchange\` (preserved) |
| Founder classification | \`SERIALIZED_FICTION\` |
| Managed \`projectType\` | \`SERIALIZED_FICTION\` |
| \`productionSpine\` | \`true\` |
| \`designEnabled\` | \`false\` |
| Cast authority | Project-local (\`THE_EXCHANGE/\`, fiction API) — **not** global Actor Catalogue |
| Studio World role | Shared production workspace only |
`,

  '04_MEDIA_PROJECT_REGISTRY_RECONCILIATION.md': `# 04 — Media project registry reconciliation

Canonical independent media keys: \`shared/site00-media-projects/independentMediaProjects.ts\`

Reconciliation applied on **existing** \`the-exchange\` key:

1. \`managedProjectRegistry.ts\` — spine project row
2. \`orgRegistry.ts\` + \`evolveService.ts\` — index-visible org context
3. \`projectIndexOrder.ts\` — founder portfolio order
4. \`projectResolver.ts\` — surfaces + phase + activity
5. \`listProductionManagedProjects()\` — Production switcher + Hub fallback
6. \`isMarketingClientOrg\` — excludes \`SERIALIZED_FICTION\` from EVOLVE marketing client surfaces

No second THE EXCHANGE project created.
`,

  '05_PROJECT_TREE_BEFORE_AND_AFTER.md': `# 05 — Project tree before and after

## Before (founder mental model vs UI)

\`\`\`
STUDIO WORLD (visible infrastructure)
  └── (Exchange work only reachable via fiction API / branch PRs — not Projects index)
\`\`\`

## After (intended model)

\`\`\`
SITE 00 / STUDIO OS
  MEDIA REGISTRY
    NDXBOOK
    THE EXCHANGE
  STUDIO WORLD (infrastructure workspace)
    shared tools → project query param / path slug
\`\`\`
`,

  '06_PROJECT_SELECTOR_AND_ROUTING_CHANGES.md': `# 06 — Project selector and routing

- **Projects index:** THE EXCHANGE appears when org UUID resolves (founder portfolio).
- **Production header switcher:** \`listHostProductionProjects()\` uses \`listProductionManagedProjects()\`.
- **Hub project list:** spine-only projects merged when absent from API index.
- **Primary production entry:** \`/production?project=the-exchange\` and tab routes \`/production/the-exchange/{expression|experience|…}\`.
- **Design selector:** THE EXCHANGE intentionally **excluded** (\`designEnabled: false\`).
`,

  '07_STUDIO_WORLD_CONTEXT_SWITCHING_REPORT.md': `# 07 — Studio World context switching

\`shared/site00-production-graph/projectScope.ts\` unchanged: project slug in path or \`?project=\` determines active records.

Switch tests:

- \`/production/the-exchange/expression\` ↔ \`/production/ndxbook/expression\` preserves tab, drops child state.

No cross-project cast import; global Actor Catalogue unchanged.
`,

  '08_DIRECTOR_COMPOSER_PROJECT_INTEGRATION.md': `# 08 — Director Composer integration

Director Composer remains a **shared** Studio World tool. Project association is via:

- Active production URL project slug (\`the-exchange\`)
- Fiction production modules on open PR branches (\`shared/site00-fiction-production/\`, PR #1692+)
- \`productionSpine: true\` on managed record (compatible with PR #1697 spine)

This sprint does **not** relocate Composer implementation into \`THE_EXCHANGE/\`.
`,

  '09_CHARACTER_STUDIOS_PROJECT_AUTHORITY.md': `# 09 — Character Studios authority

THE EXCHANGE cast stays **project-local**. No Sloane/Gideon/Kai import into global \`acting-catalogue\`.

Character Studios may **operate on** Exchange characters when \`project=the-exchange\` is active; ownership metadata remains on fiction canon + \`THE_EXCHANGE/\` assets.
`,

  '10_ASSET_AND_TAKE_OWNERSHIP_VALIDATION.md': `# 10 — Asset and take ownership

- No physical canon relocation performed.
- Hub cover slot \`project.the-exchange.cover\` registered (empty until founder-approved cover).
- Production record JSON on spine branches remains keyed by \`the-exchange\`; this sprint did not mutate \`THE_EXCHANGE/SEASON_1\` files on \`main\`.

**Production DB mutations:** 0
`,

  '11_SECURITY_AND_BUDGET_ISOLATION.md': `# 11 — Security and budget isolation

- Project switching does **not** enable provider dispatch.
- Founder decision **D-I** (ungated provider paths) remains **OUTSTANDING** — see \`docs/production/provider-gateway/\`.
- \`SERIALIZED_FICTION\` excluded from EVOLVE marketing client command surfaces to avoid accidental campaign tooling on fiction IP.

No new billable routes introduced in this repair.
`,

  '12_RESPONSIVE_PROJECT_DISCOVERY_REPORT.md': `# 12 — Responsive project discovery

Project index and Production switcher components are shared across viewports (390 / 834 / 1440 / 2560). THE EXCHANGE is a **top-level** switcher row, not nested under Studio World.

Manual viewport pass: deferred to founder tunnel review; routing logic is viewport-agnostic.
`,

  '13_PR_DEPENDENCY_AND_MIGRATION_SAFETY.md': `# 13 — PR dependency and migration safety

Related open PRs (#1690–#1699) **not merged** by this sprint.

| PR | Relationship |
| --- | --- |
| #1697 production spine | Overlaps managed registry + switcher — **compatible**; this branch ports minimal spine flags without spine JSON bulk |
| #1692 directorial engine | Fiction tooling; independent |
| #1693 living-world audit | Read-only audit data |

Baseline: \`origin/main\`. No automatic merges. No Supabase org migration executed (production UUID documented in \`orgRegistry.ts\`).
`,

  '14_IMPLEMENTATION_DIFF.md': `# 14 — Implementation diff

See git diff on branch \`cursor/studioworld-media-project-exchange-independence-8aec\`.

Core files:

- \`managedProjectRegistry.ts\`, \`types.ts\`, \`client.ts\`
- \`orgRegistry.ts\`, \`evolveService.ts\`, \`seedFixtures.ts\`
- \`projectIndexOrder.ts\`, \`projectIndexVisual.ts\`
- \`projectResolver.ts\`
- \`projectHostProfile.ts\`, \`useProductionHubData.ts\`
- \`shared/site00-media-projects/independentMediaProjects.ts\`
- \`tests/mediaProjectExchangeIndependence.test.ts\`
`,

  '15_TEST_AND_BUILD_REPORT.md': `# 15 — Test and build report

## Targeted tests (pass)

- \`tests/mediaProjectExchangeIndependence.test.ts\`
- \`api/_lib/site00Projects/site00Projects.test.ts\` (counts updated for 5 founder projects)
- \`api/_lib/site00Evolve/evolve.test.ts\`
- \`tests/jurnlF01ProjectIngestion.test.ts\`

Run: \`npm test -- --run tests/mediaProjectExchangeIndependence.test.ts\`

## Build

Run: \`npm run build\` (see CI / local log in PR).

## Media

- Generations: 0
- Credits: 0
`,

  '16_COMPLETION_REPORT.md': `# 16 — Completion report

See PR description for live SHA and PR number after push.

\`\`\`
SPRINT ID: ${SPRINT}
STATUS: READY FOR FOUNDER REVIEW
REPOSITORY: yoteenz/SITE00
ROOT CAUSE: Registry/discovery gap — missing managed row, org UUID, and index order; not Studio World DB parentage
PROJECT KEY: the-exchange preserved
MEDIA GENERATIONS: 0
CREDITS SPENT: 0
PRODUCTION DB MUTATIONS: 0
DEPLOY: NONE
AUTO-MERGE: NONE
D-I SECURITY: OUTSTANDING
\`\`\`
`,
};

const dir = path.join(process.cwd(), OUT);
mkdirSync(dir, { recursive: true });
for (const [name, body] of Object.entries(files)) {
  writeFileSync(path.join(dir, name), body, 'utf8');
}
console.log(`Wrote ${Object.keys(files).length} deliverables to ${OUT}/`);
