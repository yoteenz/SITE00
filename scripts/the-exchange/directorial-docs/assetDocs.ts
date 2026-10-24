import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, table } from './md.js';

type Ref = X.CastAssetRef;
type CastWithFindings = X.CastRegistry & { findings: X.CastFinding[] };

const isRef = (v: unknown): v is Ref => !!v && typeof v === 'object' && 'status' in v && 'label' in v;
const refsOf = (c: X.CastRegistry['characters'][number]) =>
  Object.entries(c.fields).flatMap(([field, f]) => (Array.isArray(f.value) ? f.value.filter(isRef).map((r) => ({ field, ...r })) : []));
const short = (h: string | null) => (h ? `${h.slice(0, 12)}…` : null);

export function assetReconciliationDoc(cast: CastWithFindings, assets: X.AssetRegistry, plan: X.Directorial.ProductionPlan): string {
  const blockers = X.Directorial.effectiveBlockers(plan);
  const summary = cast.characters.map((c) => {
    const refs = refsOf(c);
    const n = (s: X.AssetStatus) => refs.filter((r) => r.status === s).length;
    const approval = c.fields.approvalStatus?.value as Record<string, string> | undefined;
    return [c.characterId, ...X.ASSET_STATUSES.map(n), approval?.CHARACTER_VISUAL_IDENTITY ?? 'NOT_RECORDED', c.voice?.status ?? 'NONE'];
  });
  const perCharacter = cast.characters
    .map((c) => ({ c, refs: refsOf(c) }))
    .map(({ c, refs }) =>
      refs.length
        ? `### ${c.characterId}\n\n${table(['Field', 'Asset', 'Status', 'Repository file', 'SHA-256', 'Source'], refs.map((r) => [r.field, r.label, r.status, r.repoPath, short(r.sha256), r.source]))}`
        : `### ${c.characterId}\n\nNo visual reference is recorded. Nothing is assumed: the character gets references when a release that needs them enters active production.`,
    );
  return [
    '# 03 — Visual asset reconciliation',
    '',
    generatedNote([X.CAST_REGISTRY_PATH, X.EXCHANGE_PATHS.assets, X.scenePath('S1-01', X.SCENE_FILES.keyframes)]),
    '',
    '**Status vocabulary (sprint V2 §04).** Every visual reference carries exactly one of `APPROVED`, `PROVISIONAL`, `UNIMPORTED`, `MISSING`, `REJECTED` or `ARCHIVED`.',
    'An `UNIMPORTED` or `MISSING` asset cannot carry a path, hash or provider id (the validator rejects it). An `APPROVED` or `PROVISIONAL` asset must point at a repository file whose SHA-256 matches. No URL, hash or generation id in this document was typed by hand.',
    '',
    '## Summary by character',
    '',
    table(['Character', ...X.ASSET_STATUSES, 'Visual identity approval', 'Voice'], summary),
    '',
    `Reusable approved assets (the only ones a keyframe may name as \`REUSE_APPROVED\`): ${[...X.approvedAssetIds(cast)].sort().map((a) => `\`${a}\``).join(', ')}.`,
    '',
    '## References per character',
    '',
    perCharacter.join('\n\n'),
    '',
    '## Sets, wardrobe and props',
    '',
    'Sets are registered as story locations. None yet has an approved establishing image, reverse angle or lighting reference, so every environment shown on screen must be seeded and approved when its first release enters production.',
    '',
    table(['Set', 'Classification', 'Releases', 'Approved establishing refs', 'Approved lighting refs'], assets.sets.map((s) => [`${s.setId} (${s.name})`, s.classification, s.releases?.length ?? s.releaseCount ?? null, s.establishingAngles.length, s.lightingRefs.length])),
    '',
    table(['Wardrobe', 'Owner', 'Status', 'Approved reference files'], assets.wardrobe.map((w) => [w.wardrobeId, w.owner, w.status, w.approvedReferenceFiles.length])),
    '',
    table(['Prop', 'Owner', 'Status', 'Releases'], assets.props.map((p) => [`${p.propId} (${p.name})`, p.owner, p.status, p.releases.join(' ')])),
    '',
    '## What the active scene needs (S1-01 Dusk)',
    '',
    'S1-01 has no principal on screen, so it reuses no character asset. Its five inhabitants are scene-scoped: their faces are fixed by each vignette\'s first approved start frame and no permanent package is built.',
    '',
    table(
      ['Keyframe', 'Kind', 'Source', 'Derives from', 'Blocked by (own and inherited)'],
      plan.keyframes.filter((k) => k.kind !== 'START_FRAME').map((k) => [k.keyframeId, k.kind, k.source, k.derivesFrom.join(' ') || k.noReferenceJustification, (blockers.get(k.keyframeId) ?? []).join(' ')]),
    ),
    '',
    '## Open findings',
    '',
    bullets(cast.findings.map((f) => `${f.severity} · ${f.subject}: ${f.detail}`)),
  ].join('\n');
}

type FutureDeps = {
  rule: string;
  jit: { activeReleaseId: string; needed: Array<{ personId: string; name: string; tier: string; existing: string; gaps: string[] }>; deferred: Array<{ personId: string; name: string; tier: string; trigger: string; releases: number }>; deferredSceneScoped: number };
  census: Array<{ tier: string }>;
  byRelease: Array<{ releaseId: string; trigger: string; founderAttention: string; needs: string[] }>;
};

export function futureDependenciesDoc(f: FutureDeps): string {
  const tiers = f.census.reduce<Record<string, number>>((a, p) => ({ ...a, [p.tier]: (a[p.tier] ?? 0) + 1 }), {});
  return [
    '# 25 — Season 1 future production dependencies',
    '',
    generatedNote([`${X.EXCHANGE_PATHS.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`, `${X.EXCHANGE_PATHS.season}/SEASON1_SCENE_DEPENDENCY_GRAPH_V1.json`]),
    '',
    `**Rule.** ${f.rule} Nothing in this document is a request for founder attention.`,
    '',
    `## Active release: ${f.jit.activeReleaseId}`,
    '',
    table(['Person', 'Tier', 'Existing', 'Gaps'], f.jit.needed.map((p) => [p.name, p.tier, p.existing, p.gaps.join('; ')])),
    '',
    '## Cast census (whole season)',
    '',
    table(['Tier', 'People'], Object.entries(tiers).sort().map(([t, n]) => [t, n])),
    '',
    `Scene-scoped people deferred to their own release: ${f.jit.deferredSceneScoped}. A scene-scoped person never gets a permanent package; asking for one returns \`SCENE_SCOPED_NO_PERMANENT_PACKAGE\` and spends nothing.`,
    '',
    '## Registered and recurring people, deferred until first needed',
    '',
    table(['Person', 'Tier', 'Trigger', 'Releases'], f.jit.deferred.map((p) => [p.name, p.tier, p.trigger, p.releases])),
    '',
    '## Asset needs by release (tracked silently)',
    '',
    table(['Release', 'Trigger', 'Founder attention', 'Needs'], f.byRelease.map((r) => [r.releaseId, r.trigger, r.founderAttention, r.needs.join('; ')])),
  ].join('\n');
}
