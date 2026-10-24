import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, table } from './md.js';

const P = X.EXCHANGE_PATHS;
const list = (v: unknown) => (Array.isArray(v) ? v.join('; ') : v === null || v === undefined ? '' : String(v));

export function assetDoc(a: X.AssetRegistry, findings: X.RegistryFinding[]): string {
  const blockers = findings.filter((f) => f.severity === 'BLOCKER');
  const hard = findings.filter((f) => f.severity === 'HARD_CONFLICT');
  const planned = (a.libraryPlanned ?? {}) as Record<string, unknown>;
  return [
    '# 07 — Character, set, wardrobe and prop registry',
    '',
    generatedNote([P.assets, P.visualRegistry]),
    '',
    `**Registry:** \`${a.registryId}\` · **Classification:** \`${a.classification}\` · **Authority:** ${list((a as unknown as Record<string, unknown>).authority)}`,
    '',
    '## Rules',
    '',
    bullets(a.rules),
    '',
    `Validation: ${hard.length} hard conflicts, ${blockers.length} blockers. A blocker is an asset that does not exist or is not approved yet. It stops generation; it is never filled with a placeholder.`,
    '',
    '## Characters',
    '',
    'Facial identity is linked from `CHARACTER_VISUAL_REGISTRY_V1.json` and never overwritten here.',
    '',
    table(
      ['Cue', 'Character', 'Face reference', 'Appearance', 'Grooming', 'Voice'],
      a.characters.map((c) => [c.cue, c.characterId, c.visualRegistryRef ?? 'none (blocker)', list(c.appearance), list(c.grooming), `${c.voice.provider}: ${c.voice.voiceAssetId ?? 'none'} (${c.voice.status})`]),
    ),
    '',
    '## Sets',
    '',
    table(
      ['Set', 'Name', 'Zones', 'Releases', 'Establishing refs', 'Classification'],
      a.sets.map((s) => [s.setId, s.name, s.zones.join(', '), s.releases?.join(', ') ?? (s.releaseCount ? `${s.releaseCount} releases` : ''), s.establishingAngles.length || 'none (blocker)', s.classification]),
    ),
    '',
    '## Wardrobe',
    '',
    table(
      ['Wardrobe', 'Owner', 'Description', 'Releases', 'Continuity', 'Accessories', 'Status'],
      a.wardrobe.map((w) => [w.wardrobeId, w.owner, w.description, w.releases.join(', '), w.continuity, w.accessories.join(', '), `${w.status}${w.dependency ? ` (${w.dependency})` : ''}`]),
    ),
    '',
    '## Props',
    '',
    table(
      ['Prop', 'Name', 'Owner', 'Importance', 'Releases', 'Hand-off chain', 'Status'],
      a.props.map((p) => [p.propId, p.name, p.owner ?? '', p.narrativeImportance, p.releases.join(', '), (p.handoffChain ?? []).join(' → '), p.status]),
    ),
    '',
    '## Audio and video',
    '',
    table(['Bucket', 'Entries'], Object.entries(a.audio).map(([k, v]) => [k, v.length ? v.map((i) => `${i.ref} (${i.classification ?? 'unclassified'})`).join('; ') : 'none'])),
    '',
    `Canonical video: ${a.video.canonical.length ? a.video.canonical.map((v) => v.path).join(', ') : 'none'}. Production test record: \`${a.video.productionTestRecord}\` (\`PRODUCTION_TEST_ONLY\`).`,
    '',
    '## Reusable library planned under NR-11 (not yet designed)',
    '',
    ...Object.entries(planned).map(([k, v]) => `- **${k}:** ${list(v)}`),
    '',
    '## Blockers',
    '',
    table(['Subject', 'Detail'], blockers.map((b) => [b.subject, b.detail])),
  ].join('\n');
}
