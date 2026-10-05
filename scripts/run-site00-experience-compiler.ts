/**
 * P0.STUDIOOS.EXPERIENCE-COMPILER.MAP1 — emit docs from deterministic compiler.
 *   npx tsx scripts/run-site00-experience-compiler.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { runExperienceCompiler } from '../src/studioos/experience-compiler/compilerEngine';

const ROOT = path.resolve(import.meta.dirname ?? '.', '..');
const OUT = path.join(ROOT, 'docs/studioos/experience-compiler');
const BATCH_OUT = path.join(OUT, 'sonnet-batches');

fs.mkdirSync(BATCH_OUT, { recursive: true });

const result = runExperienceCompiler();

const pageGraph = {
  generated_at: result.report.generated_at,
  nodes: result.nodes,
};

fs.writeFileSync(path.join(OUT, 'SITE00_PUBLIC_PAGE_GRAPH.json'), JSON.stringify(pageGraph, null, 2));
fs.writeFileSync(
  path.join(OUT, 'SITE00_PAGE_ARCHETYPE_TAXONOMY.json'),
  JSON.stringify({ archetypes: result.taxonomy }, null, 2),
);
fs.writeFileSync(
  path.join(OUT, 'SITE00_AUTHORITY_REGISTRY.json'),
  JSON.stringify({ authorities: result.authorities.filter((a) => !a.superseded), superseded: result.authorities.filter((a) => a.superseded) }, null, 2),
);
fs.writeFileSync(
  path.join(OUT, 'SITE00_AUTHORITY_INHERITANCE_GRAPH.json'),
  JSON.stringify({ entries: result.inheritance }, null, 2),
);
fs.writeFileSync(
  path.join(OUT, 'SITE00_REPRESENTATIVE_SCREEN_MAP.json'),
  JSON.stringify({ representatives: result.representative }, null, 2),
);
fs.writeFileSync(path.join(OUT, 'SITE00_PRODUCTION_BATCHES.json'), JSON.stringify({ batches: result.batches }, null, 2));

const gatesMd = `# SITE 00 Founder Creative Gates

Generated: ${result.report.generated_at}

Only screens/archetypes that require **new** creative authority (compiler does not invent design).

${result.gates
  .map(
    (g) => `## ${g.gate_id}

- **Family:** ${g.family}
- **Archetype:** ${g.archetype}
- **Routes covered (sample):** ${g.routes_covered.map((r) => `\`${r}\``).join(', ')}
- **Downstream screens unlocked:** ${g.downstream_screens_unlocked}
- **Why existing authorities are insufficient:** ${g.why_insufficient}
- **Founder must decide:** ${g.must_decide}
`,
  )
  .join('\n')}`;

fs.writeFileSync(path.join(OUT, 'SITE00_FOUNDER_CREATIVE_GATES.md'), gatesMd);

const leverageMd = `# SITE 00 Authority Leverage Map

**Authority leverage ratio:** ${result.report.total_meaningful_screens} screens ÷ ${result.authorities.filter((a) => a.approved && !a.superseded).length} active authorities = **${result.report.authority_leverage_ratio.toFixed(2)}**

## Founder gate leverage (downstream screens ÷ 1 new authority)

${result.gates
  .map((g) => `- **${g.gate_id}** — unlocks **${g.downstream_screens_unlocked}** screens (${g.downstream_screens_unlocked}:1)`)
  .join('\n')}
`;

fs.writeFileSync(path.join(OUT, 'SITE00_AUTHORITY_LEVERAGE_MAP.md'), leverageMd);

const reportMd = `# SITE 00 Experience Compiler Report

Generated: ${result.report.generated_at}

| Metric | Value |
|--------|------:|
| Total unique routes (normalized) | ${result.report.total_routes} |
| Total meaningful screens/states | ${result.report.total_meaningful_screens} |
| Unique page archetypes | ${result.report.total_unique_archetypes} |
| DIRECTLY_COVERED | ${result.report.directly_covered} |
| DERIVABLE | ${result.report.derivable} |
| COMPOSITE_DERIVABLE | ${result.report.composite_derivable} |
| CREATIVE_AUTHORITY_REQUIRED | ${result.report.creative_authority_required} |
| Founder creative gates | ${result.report.total_founder_gates} |
| Production batches | ${result.report.total_production_batches} |
| Sonnet-ready batches | ${result.report.sonnet_ready_batches} |
| Blocked batches | ${result.report.blocked_batches} |
| Authority leverage ratio | ${result.report.authority_leverage_ratio.toFixed(2)} |

## Archetype distribution

${[...new Set(result.nodes.map((n) => n.primary_archetype))]
  .sort()
  .map((a) => {
    const count = result.nodes.filter((n) => n.primary_archetype === a).length;
    return `- **${a}:** ${count} screens`;
  })
  .join('\n')}

## Product family firewall

IDNTY \`ready-for-evolution\` routes remain **IDNTY** (not public EVOLVE). Build Ready verification routes remain **IDNTY** (not BLDR intake). EVOLVE authority records do not reference IDNTY evolution slugs.

## Checkout

All checkout nodes classified **CREATIVE_AUTHORITY_REQUIRED** until payment/transaction authority exists — compiler does not invent checkout UI.
`;

fs.writeFileSync(path.join(OUT, 'SITE00_EXPERIENCE_COMPILER_REPORT.md'), reportMd);

const pipelineMd = `# Model production pipeline (Experience Compiler)

| Role | Responsibility | Must not |
|------|----------------|----------|
| **Founder** | Approve new creative authority only at founder gates | Batch-implement one-off page designs without authority |
| **Sonnet** | Structure + implementation from batch manifests | Invent visual or interaction grammar |
| **Opus** | Pixel convergence vs approved authorities | Redefine product strategy or routes |
| **Grok** | Assets / icons / environment plates per slots | Redesign page layout |
| **Composer** | Backend integration, production readiness | Reinterpret approved visuals |

Flow: **Compiler map → Founder gates → Sonnet batches → Opus → Grok assets → Composer wiring**
`;

fs.writeFileSync(path.join(OUT, 'MODEL_PRODUCTION_PIPELINE.md'), pipelineMd);

for (const m of result.sonnetManifests) {
  const base = m.batch_id;
  fs.writeFileSync(path.join(BATCH_OUT, `${base}.json`), JSON.stringify(m, null, 2));
  fs.writeFileSync(
    path.join(BATCH_OUT, `${base}.md`),
    `# Sonnet batch: ${base}

\`\`\`json
${JSON.stringify(m, null, 2)}
\`\`\`
`,
  );
}

console.log('Experience compiler artifacts written to', OUT);
console.log('Sonnet manifests:', result.sonnetManifests.length);
