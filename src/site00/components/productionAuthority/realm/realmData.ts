/**
 * EXPERIENCE + LIBRARY read model. Every record is built from a canonical repo source and says which one:
 *  - Production asset registry + route asset manifests (PR #1310)   → authorities, assets, plates, lineage (variantOf)
 *  - Studio World residents + mounted portraits                      → residents (never roles / actors / characters)
 *  - Entry 002 narrative plan + production cast (useExpressionData)  → journeys, formats, packages, characters, bibles
 *  - Studio World acting catalogue                                   → external talent
 *  - live Production hub data (graph, gate, scenes, attention)       → live state, triggers, conditional access
 *  - Design pack (swatches, devices, stages, plates, icons)          → materials, components, plates, icons
 *  - Experience pipeline + workspace registry                        → architecture layers, destinations
 * Nothing is authored for the UI. A collection with no canonical source stays empty and says why (`EMPTY`).
 */
import { useMemo } from 'react';
import { subWorkspacesFor } from '../../../../../shared/site00-production-workspace/registry.js';
import { EXPERIENCE_PIPELINE_STAGE_DEFS } from '../../../../../shared/site00-experience-workspace/pipelineModel.js';
import { PRODUCTION_ASSETS, PRODUCTION_ROUTE_ASSET_MANIFESTS, STUDIO_WORLD_RESIDENTS, type ProductionAssetRecord } from '../../../productionAssets';
import { productionNavGlyphSrc } from '../../productionHub/productionNavIcon';
import { DESIGN_DEVICES, DESIGN_ICON_IDS, DESIGN_PLATES, DESIGN_STAGES, DESIGN_SWATCHES, designIcon, designIconLabel } from '../designPackAssets';
import { useExpressionData, words, type ExpressionData } from '../expression/expressionData';
import { IA_ICON_NAMES } from '../iaKit';
import type { Lifecycle } from './realmRoutes';

export type Tone = 'green' | 'amber' | 'red' | 'gray' | 'blue';
export type RealmRecord = {
  id: string;
  title: string;
  /** Record type (e.g. WORLD PLATE · RESIDENT · BEAT). */
  kicker: string;
  sub: string;
  img: string | null;
  /** Inline line icon (functional icons) instead of an image. */
  glyph?: string;
  lifecycle: Lifecycle;
  status: string;
  tone: Tone;
  facts: readonly (readonly [string, string])[];
  tags: readonly string[];
  /** Provenance — where this record comes from in the repo. */
  source: string;
  version: string | null;
  usedBy: readonly string[];
  /** Lineage: ids this record derives from / that derive from it (same collection namespace). */
  from: readonly string[];
  to: readonly string[];
  /** Working surface the record lives in. */
  open: string | null;
  metric: string | null;
};

export type Collection = { records: readonly RealmRecord[]; empty: string };

const rec = (r: Partial<RealmRecord> & Pick<RealmRecord, 'id' | 'title' | 'kicker'>): RealmRecord => ({
  sub: '',
  img: null,
  lifecycle: 'CANONICAL',
  status: 'CANONICAL',
  tone: 'green',
  facts: [],
  tags: [],
  source: 'REPO',
  version: null,
  usedBy: [],
  from: [],
  to: [],
  open: null,
  metric: null,
  ...r,
});

/* ── registry → lifecycle ── */
const LIFE: Record<ProductionAssetRecord['authorityStatus'], [Lifecycle, string, Tone]> = {
  CANONICAL: ['CANONICAL', 'CANONICAL', 'green'],
  USED_BY_AUTHORITY: ['CANONICAL', 'USED BY AUTHORITY', 'green'],
  IDENTITY_CONFIRMED: ['CANONICAL', 'IDENTITY CONFIRMED', 'green'],
  FABRICATION_IN_REVIEW: ['IN REVIEW', 'FABRICATION IN REVIEW', 'amber'],
  CANDIDATE: ['IN REVIEW', 'CANDIDATE', 'amber'],
  UNAPPROVED: ['IN REVIEW', 'UNAPPROVED', 'amber'],
  UNKNOWN_APPROVAL: ['IN REVIEW', 'UNKNOWN APPROVAL', 'amber'],
  SOURCE_MATCH_UNCERTAIN: ['IN REVIEW', 'SOURCE UNCERTAIN', 'amber'],
  MISSING_SOURCE: ['IN REVIEW', 'MISSING SOURCE', 'red'],
  SUPERSEDED: ['SUPERSEDED', 'SUPERSEDED', 'gray'],
};
const historyId = (notes: string) => notes.match(/history ([A-Za-z0-9]{12,})/)?.[1] ?? null;
const kind = (role: string) => words(role);

function assetRecord(a: ProductionAssetRecord, all: readonly ProductionAssetRecord[]): RealmRecord {
  const [lifecycle, status, tone] = LIFE[a.authorityStatus];
  const src = a.publicPath ?? (a.assetRole === 'NAVIGATION_ICON' ? productionNavGlyphSrc(a.assetId.replace('nav.', '') as never) : null);
  const hid = historyId(a.notes);
  return rec({
    id: a.assetId,
    title: a.canonicalName.replace(/^production-|^studio-world-/, '').replace(/-v\d+$/, '').replace(/-/g, ' ').toUpperCase(),
    kicker: kind(a.assetRole),
    sub: a.notes.split('. ')[0] ?? '',
    img: src,
    lifecycle,
    status,
    tone,
    facts: [
      ['ASSET ID', a.assetId],
      ['ROLE', kind(a.assetRole)],
      ['SOURCE', words(a.sourceType)],
      ['TAB', a.productionTab.toUpperCase()],
      ['STATUS', status],
      ['CONFIDENCE', a.confidence.toUpperCase()],
      ['FILE', a.repoPath ?? '—'],
      ...(hid ? ([['OPENART HISTORY', hid]] as const) : []),
    ],
    tags: [a.productionTab, words(a.sourceType).toLowerCase(), a.assetRole.toLowerCase()],
    source: words(a.sourceType),
    version: a.canonicalName.match(/-v(\d+)$/)?.[1] ? `v${a.canonicalName.match(/-v(\d+)$/)![1]}` : null,
    usedBy: a.usedByRoutes,
    from: a.variantOf ? [a.variantOf] : [],
    to: all.filter((b) => b.variantOf === a.assetId).map((b) => b.assetId),
    metric: a.usedByRoutes.length ? `${a.usedByRoutes.length} ROUTE${a.usedByRoutes.length === 1 ? '' : 'S'}` : null,
  });
}

const empty = (records: readonly RealmRecord[], why: string): Collection => ({ records, empty: why });

export function buildRealm(d: ExpressionData) {
  const slug = d.slug;
  const hub = d.hub;
  const project = (hub?.project.name ?? slug).toUpperCase();
  const entry = hub?.production?.label ?? 'NO ENTRY';
  const assets = PRODUCTION_ASSETS.map((a) => assetRecord(a, PRODUCTION_ASSETS));
  const asset = (id: string) => assets.find((a) => a.id === id) ?? null;
  const setsItem = d.ok ? d.itemFor('sets') : null;
  const setsWhy = `NO SET AUTHORITY YET — ${entry} SET PACKAGE ${setsItem ? words(setsItem.status) : 'NOT STARTED'}.`;
  const expManifest = PRODUCTION_ROUTE_ASSET_MANIFESTS.find((m) => m.manifestId === 'experience.world');
  const missing = (role: string) => expManifest?.missingSlots.find((s) => s.role === role);
  const graph = d.graph;
  const nodes = graph?.nodes ?? [];

  /* ── EXPERIENCE ── */
  const plates = assets.filter((a) => /HERO_ENVIRONMENT|WORLD_PLATE/.test(PRODUCTION_ASSETS.find((x) => x.assetId === a.id)!.assetRole));
  const worldRecord = rec({
    id: 'world',
    title: `${project} WORLD`,
    kicker: 'PROJECT WORLD',
    sub: `${entry}${hub?.production?.subtitle ? ` — ${hub.production.subtitle}` : ''}`,
    img: asset('experience.worldHero')?.img ?? null,
    status: hub?.hasProduction ? 'IN PRODUCTION' : 'NO PRODUCTION',
    tone: hub?.hasProduction ? 'green' : 'gray',
    facts: [
      ['PROJECT', project],
      ['ENTRY', entry],
      ['WORLD PLATE', 'experience.worldHero'],
      ['ENVIRONMENT', setsItem?.status === 'APPROVED' ? 'ASSIGNED' : 'NOT ASSIGNED'],
      ['ZONES', '0 DEFINED'],
      ['RESIDENTS', String(STUDIO_WORLD_RESIDENTS.length)],
    ],
    source: 'PRODUCTION HUB + ASSET REGISTRY',
    open: `/production/${slug}`,
  });
  const destinations = subWorkspacesFor('EXPERIENCE').map((s) =>
    rec({ id: `dest.${s.id}`, title: s.label, kicker: 'EXPERIENCE DESTINATION', sub: s.description.toUpperCase(), source: 'WORKSPACE REGISTRY', status: 'REGISTERED', tone: 'blue', facts: [['ID', s.id], ['DESCRIPTION', s.description.toUpperCase()]] }),
  );
  const layers = EXPERIENCE_PIPELINE_STAGE_DEFS.map((s) =>
    rec({ id: `layer.${s.id}`, title: s.shortLabel, kicker: `LAYER ${String(s.order).padStart(2, '0')}`, sub: 'EXPERIENCE PIPELINE STAGE', source: 'EXPERIENCE PIPELINE MODEL', status: 'DEFINED', tone: 'gray', metric: String(s.order).padStart(2, '0') }),
  );
  const beats = d.ok ? d.plan.beats : [];
  const journey = beats.map((b) =>
    rec({
      id: b.beatId,
      title: b.label.toUpperCase(),
      kicker: `BEAT ${String(b.order).padStart(2, '0')}`,
      sub: words(b.shotFunction),
      status: b.tensionStage,
      tone: b.tensionStage === 'PEAK' ? 'red' : 'gray',
      facts: [
        ['ORDER', String(b.order).padStart(2, '0')],
        ['ROLE', words(b.beatRole)],
        ['SHOT FUNCTION', words(b.shotFunction)],
        ['TENSION', `${b.tensionBefore} → ${b.tensionAfter}`],
        ['AUDIENCE KNOWS', b.whatAudienceKnows],
        ['CHANGES', b.whatChangesInThisBeat],
        ['NEXT', b.whyNextBeatIsNecessary],
      ],
      source: 'NARRATIVE MOMENTUM PLAN',
      version: d.plan.version,
      from: beats.filter((x) => x.order === b.order - 1).map((x) => x.beatId),
      to: beats.filter((x) => x.order === b.order + 1).map((x) => x.beatId),
      metric: String(b.order).padStart(2, '0'),
      open: `/production/${slug}/expression/narrative`,
    }),
  );
  const formats = d.ok ? d.plan.formatAdaptations : [];
  const entryPaths = formats.map((f) => rec({ id: `entry.${f.format}`, title: `${f.format} OPENING`, kicker: 'ENTRY PATH', sub: f.openingStrategy, status: f.durationOrSlideCount, tone: 'blue', facts: [['FORMAT', f.format], ['OPENING', f.openingStrategy], ['BEATS USED', String(f.beatsUsed.length)]], source: 'FORMAT ADAPTATION' }));
  const exitPaths = formats.map((f) => rec({ id: `exit.${f.format}`, title: `${f.format} CLOSE`, kicker: 'EXIT PATH', sub: f.closingStrategy, status: f.durationOrSlideCount, tone: 'blue', facts: [['FORMAT', f.format], ['CLOSING', f.closingStrategy], ['OPEN LOOP', f.openLoopTreatment]], source: 'FORMAT ADAPTATION' }));

  const objectInteractions = [
    ...d.props.map((p, i) => rec({ id: `prop.${i}`, title: p.prop.toUpperCase(), kicker: 'OBJECT · CHARACTER PROP', sub: `LOOK · ${p.lookLabel}`, status: 'APPROVED LOOK', facts: [['OBJECT', p.prop.toUpperCase()], ['LOOK', p.lookLabel], ['CHARACTER', d.character(p.characterId)?.characterName ?? '—']], source: 'CAMPAIGN LOOKS' })),
    ...d.cast.authoritySheets.filter((s) => s.keyProp).map((s) => rec({ id: `key.${s.characterAuthorityId}`, title: s.keyProp!.toUpperCase(), kicker: 'OBJECT · KEY PROP', sub: s.characterName, status: 'AUTHORITY SHEET', facts: [['OBJECT', s.keyProp!.toUpperCase()], ['CHARACTER', s.characterName]], source: 'CHARACTER AUTHORITY SHEET' })),
  ];
  const spatial = d.shotCast.map((s, i) =>
    rec({ id: `shot.${s.shotId}.${i}`, title: (s.action || 'PLACED').toUpperCase(), kicker: `SHOT ${s.shotId.toUpperCase()}`, sub: `${d.character(s.characterId)?.characterName ?? s.characterId} · ${s.position}`, status: words(s.expression), tone: 'gray', facts: [['SHOT', s.shotId], ['POSITION', s.position], ['ACTION', s.action], ['PARTNERS', s.interactionPartners.join(', ') || '—']], source: 'SHOT CAST BLOCKING' }),
  );
  const triggers = [
    ...(graph?.founderGate.open ? [rec({ id: 'gate', title: graph.founderGate.headline, kicker: 'TRIGGER · FOUNDER GATE', sub: graph.founderGate.detail, status: graph.founderGate.decidableInHub ? 'DECIDABLE' : 'IN WORKSPACE', tone: 'red', facts: [['NODE', (graph.founderGate.nodeId ?? '—').toUpperCase()], ['HEADLINE', graph.founderGate.headline]], source: 'PRODUCTION GRAPH', open: '/production/queue' })] : []),
    ...d.attention.map((a) => rec({ id: `attn.${a.id}`, title: a.title, kicker: `TRIGGER · ${words(a.kind)}`, sub: a.why, status: a.stateLabel, tone: a.priority === 'HIGH' ? 'red' : 'amber', facts: [['ACTION', a.actionLabel], ['PRIORITY', a.priority], ['WHY', a.why]], source: 'PRODUCTION ATTENTION', open: '/production/queue' })),
  ];
  const residentPortrait = (n: number) => asset(PRODUCTION_ASSETS.find((a) => a.assetId.startsWith(`resident.sw00${n}.`) && a.assetId.endsWith('.portrait') && !a.variantOf)?.assetId ?? '')?.img ?? null;
  const residents = STUDIO_WORLD_RESIDENTS.map((r, i) => {
    const pid = PRODUCTION_ASSETS.find((a) => a.assetId.startsWith(`resident.sw00${i + 1}.`) && a.assetId.endsWith('.portrait') && !a.variantOf)?.assetId ?? null;
    const variants = PRODUCTION_ASSETS.filter((a) => pid && a.variantOf === pid);
    return rec({
      id: r.id,
      title: r.name.toUpperCase(),
      kicker: `RESIDENT ${r.id}`,
      sub: r.role.toUpperCase(),
      img: residentPortrait(i + 1),
      status: pid ? (asset(pid)?.status ?? 'PORTRAIT') : 'NO PORTRAIT',
      tone: pid ? 'green' : 'gray',
      facts: [
        ['ID', r.id],
        ['ROLE', r.role.toUpperCase()],
        ['PORTRAIT', pid ?? 'NOT MOUNTED'],
        ['VARIANTS', String(variants.length)],
        ['PRESENCE', 'NOT TRACKED'],
      ],
      source: 'STUDIO WORLD RESIDENTS',
      from: pid ? [pid] : [],
      to: variants.map((v) => v.assetId),
      metric: variants.length ? `${variants.length} VARIANTS` : null,
    });
  });
  const characters = d.cast.characters.map((c) =>
    rec({
      id: c.characterId,
      title: c.characterName.toUpperCase(),
      kicker: `CHARACTER · ${words(c.screenImportance)}`,
      sub: `${words(c.narrativeRole)} · ${d.actor(c.actorId)?.stageName.toUpperCase() ?? 'NO ACTOR'}`,
      img: d.actor(c.actorId)?.headshotPreviewUrl ?? null,
      status: words(c.status),
      tone: c.status === 'LOCKED' ? 'green' : 'amber',
      lifecycle: c.status === 'LOCKED' ? 'CANONICAL' : 'IN REVIEW',
      facts: [
        ['ROLE', words(c.narrativeRole)],
        ['FUNCTION', c.storyFunction],
        ['ACTOR', d.actor(c.actorId)?.stageName.toUpperCase() ?? 'NOT CAST'],
        ['OCCUPATION', c.occupation],
        ['BEATS', String(c.appearsInBeats.length)],
        ['ENTRY', c.entryId],
      ],
      source: 'PRODUCTION CAST',
      from: c.actorId ? [c.actorId] : [],
      open: `/production/${slug}/expression/casting`,
    }),
  );
  const relationships = d.cast.characters.map((c) =>
    rec({ id: `rel.${c.characterId}`, title: `${c.characterName.toUpperCase()} ↔ ${d.actor(c.actorId)?.stageName.toUpperCase() ?? 'UNCAST'}`, kicker: 'CHARACTER ↔ ACTOR', sub: c.relationshipMap || '—', status: c.actorId ? 'CAST' : 'OPEN ROLE', tone: c.actorId ? 'green' : 'amber', facts: [['CHARACTER', c.characterName.toUpperCase()], ['ACTOR', d.actor(c.actorId)?.stageName.toUpperCase() ?? '—'], ['ROLE REQUIREMENT', d.role(c.castingRequirementId)?.narrativeRole ?? '—'], ['RELATIONSHIPS', c.relationshipMap || '—']], source: 'PRODUCTION CAST' }),
  );
  const scenes = d.scenes.map((s) =>
    rec({ id: s.sceneId, title: s.label.toUpperCase(), kicker: `SCENE ${String(s.order).padStart(2, '0')}`, sub: s.purpose, status: s.tensionStage ?? '—', tone: s.tensionStage === 'PEAK' ? 'red' : 'gray', facts: [['ORDER', String(s.order).padStart(2, '0')], ['PURPOSE', s.purpose], ['TENSION', s.tensionStage ?? '—'], ['DURATION', s.durationRange ?? '—']], source: 'PRODUCTION SCENES', metric: s.durationRange }),
  );
  const timed = scenes.filter((s) => s.metric);
  const live = nodes.map((n) =>
    rec({ id: `node.${n.id}`, title: n.label, kicker: `STAGE ${String(n.order + 1).padStart(2, '0')}`, sub: n.statusDetail, img: hub?.assetUrl(n.assetSlotId) ?? null, status: words(n.status), tone: n.status === 'COMPLETE' ? 'green' : n.status === 'BLOCKED' || n.status === 'REVIEW_REQUIRED' ? 'red' : n.status === 'ACTIVE' ? 'amber' : 'gray', facts: [['STATUS', words(n.status)], ['WHY', n.statusDetail], ['DEPENDS ON', n.dependsOn.join(', ').toUpperCase() || '—'], ['UNLOCKS', n.unlocks.join(', ').toUpperCase() || '—']], source: 'PRODUCTION GRAPH', from: n.dependsOn.map((x) => `node.${x}`), to: n.unlocks.map((x) => `node.${x}`), open: '/production' }),
  );
  const continuity = d.ok ? (d.plan.formatAdaptations.find((f) => f.format === 'REEL')?.reelDetail?.visualContinuityRequirements ?? null) : null;
  const rules = [
    rec({ id: 'rule.internal', title: 'PRODUCTION IS INTERNAL', kicker: 'ACCESS RULE', sub: 'EVERY PRODUCTION ROUTE REQUIRES INTERNAL PRODUCTION ACCESS.', status: 'ENFORCED', facts: [['SCOPE', 'ALL /production ROUTES'], ['ENFORCED BY', 'ROUTER · INTERNAL PRODUCTION ACCESS CHECK']], source: 'ROUTER' }),
    rec({ id: 'rule.gate', title: 'FOUNDER DECIDES', kicker: 'ACCESS RULE', sub: graph?.founderGate.open ? graph.founderGate.headline : 'NO FOUNDER GATE IS OPEN.', status: graph?.founderGate.open ? 'GATE OPEN' : 'NO GATE', tone: graph?.founderGate.open ? 'red' : 'gray', facts: [['DECIDES', 'FOUNDER'], ['DECIDABLE HERE', graph?.founderGate.decidableInHub ? 'YES' : 'IN WORKSPACE']], source: 'PRODUCTION GRAPH', open: '/production/queue' }),
  ];
  const roles = [
    rec({ id: 'role.founder', title: 'FOUNDER', kicker: 'ROLE', sub: 'APPROVES, REQUESTS REVISIONS, OPENS GATES.', status: 'FULL ACCESS', facts: [['APPROVE', 'YES'], ['REQUEST REVISION', 'YES']], source: 'PRODUCTION GATE' }),
    rec({ id: 'role.studio', title: 'STUDIO WORLD RESIDENTS', kicker: 'ROLE', sub: `${STUDIO_WORLD_RESIDENTS.length} RESIDENTS — STUDIO ROLES, NOT PROJECT CHARACTERS.`, status: 'NOT MODELLED', tone: 'gray', facts: [['PERMISSIONS', 'NOT MODELLED IN PRODUCTION']], source: 'STUDIO WORLD RESIDENTS' }),
  ];
  const conditional = nodes
    .filter((n) => n.dependsOn.length)
    .map((n) => rec({ id: `cond.${n.id}`, title: `${n.label} OPENS AFTER ${n.dependsOn.map((x) => graph?.byId[x]?.label ?? x.toUpperCase()).join(' + ')}`, kicker: 'CONDITION', sub: n.statusDetail, status: words(n.status), tone: n.status === 'COMPLETE' ? 'green' : 'amber', facts: [['STAGE', n.label], ['REQUIRES', n.dependsOn.join(', ').toUpperCase()]], source: 'PRODUCTION GRAPH' }));

  /* ── LIBRARY ── */
  const authorities = assets.filter((a) => PRODUCTION_ASSETS.find((x) => x.assetId === a.id)!.sourceType === 'OPENART');
  const images = assets.filter((a) => a.img);
  const used = assets.filter((a) => a.usedBy.length);
  const talent = d.actors.map((a) =>
    rec({ id: a.actorId, title: a.stageName.toUpperCase(), kicker: `TALENT ${a.catalogueNumber}`, sub: `${a.presentation} · ${a.ageRange} · ${a.build}`.toUpperCase(), img: a.headshotPreviewUrl, status: words(a.status), tone: a.status === 'ACTIVE' ? 'green' : a.status === 'ARCHIVED' ? 'gray' : 'amber', lifecycle: a.status === 'ARCHIVED' ? 'ARCHIVE' : a.status === 'ACTIVE' ? 'CANONICAL' : 'IN REVIEW', facts: [['CATALOGUE', a.catalogueNumber], ['AVAILABILITY', words(a.availabilityState)], ['CONTINUITY RISK', a.continuityRisk], ['CHARACTERS PLAYED', String(a.charactersPlayed.length)]], source: 'ACTING CATALOGUE', open: `/production/${slug}/expression/casting` }),
  );
  const packPlates = Object.entries(DESIGN_PLATES).map(([k, src]) =>
    rec({ id: `plate.${k}`, title: words(k.replace(/([A-Z])/g, '_$1')).toUpperCase(), kicker: 'DESIGN PACK PLATE', sub: k === 'mainAtrium' ? 'MAIN ATRIUM ENVIRONMENT PLATE' : 'EXACT CROP OF THE MAIN ATRIUM PLATE', img: src, facts: [['FILE', src]], source: 'DESIGN PACK', from: k === 'mainAtrium' ? [] : ['plate.mainAtrium'], to: k === 'mainAtrium' ? Object.keys(DESIGN_PLATES).filter((x) => x !== 'mainAtrium').map((x) => `plate.${x}`) : [] }),
  );
  const envPlates = [...plates, ...packPlates];
  const worlds = [worldRecord, ...(asset('experience.worldHero') ? [asset('experience.worldHero')!] : [])];
  const sets = asset('expression.stageHero') ? [asset('expression.stageHero')!] : [];
  const entryRec = hub?.production
    ? [rec({ id: `entry.${hub.production.productionId}`, title: hub.production.label, kicker: 'ENTRY', sub: hub.production.subtitle ?? '', img: d.nodeArt('storyboard') ?? d.nodeArt('narrative'), status: d.ok ? words(d.plan.founderStatus) : 'IN PRODUCTION', tone: 'amber', lifecycle: 'IN REVIEW', facts: [['PROJECT', project], ['ENTRY', hub.production.label], ['PACKAGE', `${d.ready} / ${d.total} READY`], ['NARRATIVE', d.ok ? words(d.plan.founderStatus) : '—']], source: 'PRODUCTION HUB', version: d.ok ? d.plan.version : null, open: `/production/${slug}/expression` })]
    : [];
  const formatRecs = formats.map((f) => rec({ id: `format.${f.format}`, title: f.format, kicker: 'FORMAT ADAPTATION', sub: f.durationOrSlideCount, status: 'PLANNED', tone: 'blue', lifecycle: 'IN REVIEW', facts: [['FORMAT', f.format], ['SPEC', f.durationOrSlideCount], ['BEATS USED', String(f.beatsUsed.length)], ['OPENING', f.openingStrategy], ['CLOSING', f.closingStrategy]], source: 'NARRATIVE MOMENTUM PLAN', open: `/production/${slug}/expression/format-studio` }));
  const packages = d.deliverables.map((p) => rec({ id: p.id, title: `${p.format} DELIVERABLE`, kicker: 'PACKAGE ITEM', sub: p.spec, status: p.state, tone: p.state === 'ASSEMBLED' ? 'green' : 'gray', lifecycle: 'IN REVIEW', facts: [['FORMAT', p.format], ['SPEC', p.spec], ['BEATS', String(p.beats)], ['STATE', p.state]], source: 'CONTENT PACKAGE', open: `/production/${slug}/expression/content-package` }));
  const stages = live.map((n) => ({ ...n, kicker: `EXPRESSION STAGE · ${n.kicker}` }));
  const visualRefs = assets.filter((a) => a.id.startsWith('design.board.'));
  const styleRefs = assets.filter((a) => a.id === 'design.atrium' || a.id === 'design.core');
  const sourceRefs = authorities.filter((a) => a.facts.some(([k]) => k === 'OPENART HISTORY')).map((a) => ({ ...a, id: `src.${a.id}`, kicker: 'OPENART SOURCE', title: a.facts.find(([k]) => k === 'OPENART HISTORY')![1], sub: `SOURCE OF ${a.title}`, from: [], to: [] }));
  const navIcons = assets.filter((a) => a.id.startsWith('nav.'));
  const packNav = DESIGN_ICON_IDS.filter((i) => i.startsWith('nav-')).map((i) => rec({ id: `pack.${i}`, title: designIconLabel(i), kicker: 'DESIGN PACK · NAVIGATION', img: designIcon(i), facts: [['FILE', designIcon(i)]], source: 'DESIGN PACK' }));
  const packObjects = DESIGN_ICON_IDS.filter((i) => i.startsWith('object-')).map((i) => rec({ id: `pack.${i}`, title: designIconLabel(i), kicker: 'DESIGN PACK · OBJECT', img: designIcon(i), facts: [['FILE', designIcon(i)]], source: 'DESIGN PACK' }));
  const functional = IA_ICON_NAMES.map((n) => rec({ id: `line.${n}`, title: n.toUpperCase(), kicker: 'FUNCTIONAL LINE ICON', glyph: n, facts: [['NAME', n], ['STROKE', 'CURRENTCOLOR · 1.6']], source: 'PRODUCTION LINE ICONS' }));
  const iconFamilies = [
    rec({ id: 'fam.nav', title: 'PRODUCTION NAVIGATION', kicker: 'ICON FAMILY', sub: 'FOUNDER MASTER PNGS', img: navIcons[0]?.img ?? null, metric: `${navIcons.length} ICONS`, facts: [['COUNT', String(navIcons.length)]], source: 'NAV MASTERS', to: navIcons.map((n) => n.id) }),
    rec({ id: 'fam.packnav', title: 'DESIGN PACK NAVIGATION', kicker: 'ICON FAMILY', img: packNav[0]?.img ?? null, metric: `${packNav.length} ICONS`, facts: [['COUNT', String(packNav.length)]], source: 'DESIGN PACK', to: packNav.map((n) => n.id) }),
    rec({ id: 'fam.packobj', title: 'DESIGN PACK OBJECTS', kicker: 'ICON FAMILY', img: packObjects[0]?.img ?? null, metric: `${packObjects.length} ICONS`, facts: [['COUNT', String(packObjects.length)]], source: 'DESIGN PACK', to: packObjects.map((n) => n.id) }),
    rec({ id: 'fam.line', title: 'FUNCTIONAL LINE ICONS', kicker: 'ICON FAMILY', glyph: functional[0]?.glyph, metric: `${functional.length} ICONS`, facts: [['COUNT', String(functional.length)]], source: 'PRODUCTION LINE ICONS', to: functional.map((n) => n.id) }),
  ];
  const surfaces = DESIGN_SWATCHES.map((s) => rec({ id: `swatch.${s.id}`, title: s.label, kicker: 'MATERIAL SWATCH', img: s.src, facts: [['FILE', s.src]], source: 'DESIGN PACK' }));
  const components = [
    ...Object.entries(DESIGN_DEVICES).map(([k, src]) => rec({ id: `device.${k}`, title: `${k.toUpperCase()} FRAME`, kicker: 'DEVICE COMPONENT', img: src, facts: [['FILE', src]], source: 'DESIGN PACK' })),
    ...DESIGN_STAGES.map((s) => rec({ id: `stage.${s.id}`, title: s.label, kicker: 'PIPELINE STAGE OBJECT', img: s.src, facts: [['FILE', s.src]], source: 'DESIGN PACK' })),
  ];
  const TOKENS: [string, string][] = [
    ['--pxa-red', '#E5231B'],
    ['--pxa-ink', '#121214'],
    ['--pxa-ink-2', '#3C3C42'],
    ['--pxa-mute', '#6D6D73'],
    ['--pxa-line', '#D8D8DC'],
    ['--pxa-bg', '#EEEEF0'],
    ['--pxa-green', '#1F9D55'],
    ['--pxa-amber', '#E8912D'],
  ];
  const ui = TOKENS.map(([k, v]) => rec({ id: `token.${k}`, title: k.replace('--pxa-', '').toUpperCase(), kicker: 'UI TOKEN', sub: v, glyph: `swatch:${v}`, facts: [['TOKEN', k], ['VALUE', v], ['FILE', 'site00-production-authority.css']], source: 'PRODUCTION STYLESHEET' }));
  const brief = d.ok
    ? [rec({ id: 'brief.narrative', title: d.plan.topic.toUpperCase(), kicker: 'NARRATIVE BRIEF', sub: d.plan.narrativeGoal, status: words(d.plan.founderStatus), tone: 'amber', lifecycle: d.plan.founderStatus === 'APPROVED' ? 'CANONICAL' : 'IN REVIEW', facts: [['TERRITORY', d.plan.creativeTerritoryLabel], ['GOAL', d.plan.narrativeGoal], ['AUDIENCE FROM', d.plan.audienceStartingBelief], ['AUDIENCE TO', d.plan.audienceDesiredShift], ['GRAMMAR', words(d.plan.selectedGrammarId)]], source: 'NARRATIVE MOMENTUM PLAN', version: d.plan.version, open: `/production/${slug}/expression/narrative` })]
    : [];
  const bibles = d.cast.authoritySheets.map((s) => rec({ id: `bible.${s.characterAuthorityId}`, title: `${s.characterName.toUpperCase()} AUTHORITY SHEET`, kicker: 'CHARACTER BIBLE', sub: s.narrativeFunction, status: 'AUTHORITY', facts: [['CHARACTER', s.characterName.toUpperCase()], ['ROLE', s.narrativeRole], ['PERFORMANCE', s.personalityPerformance], ['KEY PROP', s.keyProp ?? '—']], source: 'CHARACTER AUTHORITY SHEETS', open: `/production/${slug}/expression/casting` }));
  const specs = [
    ...PRODUCTION_ROUTE_ASSET_MANIFESTS.map((m) => rec({ id: `spec.${m.manifestId}`, title: `${m.manifestId.toUpperCase()} MANIFEST`, kicker: 'ROUTE ASSET SPEC', sub: m.authorityRef, status: m.missingSlots.some((s) => s.classification === 'MISSING_SOURCE_ASSET') ? 'MISSING SLOT' : 'RESOLVED', tone: m.missingSlots.some((s) => s.classification === 'MISSING_SOURCE_ASSET') ? 'amber' : 'green', facts: [['ROUTE', m.route], ['REQUIRED', m.requiredAssetIds.join(', ')], ['MISSING', m.missingSlots.map((s) => `${s.role} (${words(s.classification)})`).join(' · ') || 'NONE']], source: 'ROUTE ASSET MANIFESTS' })),
    ...formatRecs.map((f) => ({ ...f, id: `spec.${f.id}`, kicker: 'FORMAT SPEC' })),
  ];
  const notes = (hub?.activity ?? []).map((a) => rec({ id: `note.${a.id}`, title: a.title, kicker: `NOTE · ${a.category}`, sub: a.detail, status: a.actor ?? 'SYSTEM', tone: 'gray', facts: [['WHEN', a.at], ['BY', a.actor ?? '—'], ['DETAIL', a.detail]], source: 'PRODUCTION ACTIVITY', open: '/production/activity?range=all' }));

  const C: Record<string, Collection> = {
    'world.environments': empty(plates, 'NO ENVIRONMENT PLATES MOUNTED.'),
    'world.destinations': empty(destinations, 'NO EXPERIENCE DESTINATIONS REGISTERED.'),
    'world.layers': empty(layers, 'NO PIPELINE LAYERS DEFINED.'),
    'zones.all': empty([], setsWhy),
    'zones.rooms': empty([], setsWhy),
    'zones.districts': empty([], setsWhy),
    'zones.portals': empty([], `NO PORTAL SOURCE — ${missing('PORTAL') ? words(missing('PORTAL')!.classification) : 'NOT DEFINED'}.`),
    'zones.thresholds': empty([], setsWhy),
    'paths.journey': empty(journey, 'NO NARRATIVE PLAN FOR THIS PROJECT.'),
    'paths.entry': empty(entryPaths, 'NO FORMAT ADAPTATIONS.'),
    'paths.exit': empty(exitPaths, 'NO FORMAT ADAPTATIONS.'),
    'interactions.all': empty([...objectInteractions, ...spatial, ...triggers], 'NO INTERACTIONS RECORDED.'),
    'interactions.objects': empty(objectInteractions, 'NO OBJECTS ON APPROVED LOOKS YET.'),
    'interactions.spatial': empty(spatial, 'NO SHOT BLOCKING RECORDED YET.'),
    'interactions.triggers': empty(triggers, 'NOTHING IS TRIGGERING ATTENTION.'),
    'inhabitants.all': empty([...residents, ...characters], 'NO INHABITANTS.'),
    'inhabitants.residents': empty(residents, 'NO RESIDENTS.'),
    'inhabitants.characters': empty(characters, 'NO PROJECT CHARACTERS CAST YET.'),
    'inhabitants.relationships': empty(relationships, 'NO CHARACTER ↔ ACTOR LINKS YET.'),
    'states.all': empty([...scenes, ...live], 'NO STATES.'),
    'states.scenes': empty(scenes, 'NO CANONICAL SCENES.'),
    'states.lighting': empty([], `NO LIGHTING STATES AUTHORED.${continuity ? ` CONTINUITY: ${continuity}` : ''}`),
    'states.atmosphere': empty([], 'NO ATMOSPHERE STATES AUTHORED.'),
    'states.time': empty(timed, 'NO TIMED SCENES.'),
    'states.live': empty(live, 'NO PRODUCTION GRAPH.'),
    'access.all': empty([...rules, ...roles, ...conditional], 'NO ACCESS RULES.'),
    'access.rules': empty(rules, 'NO ACCESS RULES.'),
    'access.roles': empty(roles, 'NO ROLES.'),
    'access.zones': empty([], `NO ZONES TO SCOPE ACCESS TO — ${setsWhy}`),
    'access.conditional': empty(conditional, 'NO CONDITIONS.'),
    'access.privacy': empty(residents.map((r) => ({ ...r, id: `privacy.${r.id}`, status: 'NOT TRACKED', tone: 'gray' as Tone })), 'NO PRESENCE DATA.'),

    authorities: empty(authorities, 'NO AUTHORITY PLATES IN THE REGISTRY.'),
    assets: empty(assets, 'NO ASSETS REGISTERED.'),
    'assets.images': empty(images, 'NO IMAGE ASSETS.'),
    'assets.video': empty([], 'NO VIDEO ASSETS ARE REGISTERED FOR THIS PROJECT.'),
    'assets.audio': empty([], 'NO AUDIO ASSETS ARE REGISTERED FOR THIS PROJECT.'),
    'assets.spatial': empty([], 'NO 3D OR SPATIAL ASSETS ARE REGISTERED FOR THIS PROJECT.'),
    'assets.used': empty(used, 'NO ASSET IS BOUND TO A ROUTE.'),
    characters: empty([...residents, ...characters, ...talent], 'NO CHARACTERS.'),
    'characters.residents': empty(residents, 'NO RESIDENTS.'),
    'characters.project': empty(characters, 'NO PROJECT CHARACTERS YET.'),
    'characters.talent': empty(talent, 'NO TALENT IN THE CATALOGUE.'),
    environments: empty([...worlds, ...sets, ...envPlates.filter((p) => !worlds.includes(p) && !sets.includes(p))], 'NO ENVIRONMENTS.'),
    'environments.worlds': empty(worlds, 'NO WORLDS.'),
    'environments.zones': empty([], `NO ZONE PLATES — ${missing('ZONE_PLATE') ? words(missing('ZONE_PLATE')!.classification) : 'NOT DEFINED'}.`),
    'environments.sets': empty(sets, setsWhy),
    'environments.plates': empty(envPlates, 'NO PLATES.'),
    expressions: empty([...entryRec, ...formatRecs, ...packages], 'NO EXPRESSION MATERIAL.'),
    'expressions.entries': empty(entryRec, 'NO ENTRY IN PRODUCTION.'),
    'expressions.campaigns': empty([], 'NO COMPLETED CAMPAIGN PACKAGE YET — CAMPAIGN BOARD RECEIVES COMPLETED PACKAGES ONLY.'),
    'expressions.formats': empty(formatRecs, 'NO FORMAT ADAPTATIONS.'),
    'expressions.packages': empty(packages, 'NO PACKAGE DELIVERABLES.'),
    'expressions.stages': empty(stages, 'NO PRODUCTION STAGES.'),
    references: empty([...visualRefs, ...styleRefs, ...sourceRefs], 'NO REFERENCES.'),
    'references.visual': empty(visualRefs, 'NO VISUAL REFERENCES.'),
    'references.research': empty([], 'NO RESEARCH REFERENCES ARE STORED IN PRODUCTION.'),
    'references.style': empty(styleRefs, 'NO STYLE REFERENCES.'),
    'references.source': empty(sourceRefs, 'NO SOURCE HISTORY RECORDED.'),
    icons: empty([...navIcons, ...packNav, ...packObjects, ...functional], 'NO ICONS.'),
    'icons.families': empty(iconFamilies, 'NO ICON FAMILIES.'),
    'icons.navigation': empty([...navIcons, ...packNav], 'NO NAVIGATION ICONS.'),
    'icons.functional': empty([...functional, ...packObjects], 'NO FUNCTIONAL ICONS.'),
    'icons.project': empty([], 'NO PROJECT-SPECIFIC ICONS ARE REGISTERED.'),
    materials: empty([...surfaces, ...components, ...ui], 'NO MATERIALS.'),
    'materials.surfaces': empty(surfaces, 'NO SURFACES.'),
    'materials.components': empty(components, 'NO COMPONENTS.'),
    'materials.textures': empty([], 'NO TEXTURE MAPS ARE REGISTERED — MATERIAL SWATCHES LIVE UNDER SURFACES.'),
    'materials.ui': empty(ui, 'NO UI TOKENS.'),
    documents: empty([...brief, ...bibles, ...specs, ...notes], 'NO DOCUMENTS.'),
    'documents.briefs': empty(brief, 'NO BRIEF.'),
    'documents.bibles': empty(bibles, 'NO CHARACTER AUTHORITY SHEETS YET.'),
    'documents.specs': empty(specs, 'NO SPECS.'),
    'documents.reports': empty([], 'NO REPORTS ARE STORED IN PRODUCTION.'),
    'documents.notes': empty(notes, 'NO NOTES RECORDED.'),
    archive: empty([...assets, ...talent].filter((r) => r.lifecycle === 'ARCHIVE' || r.lifecycle === 'SUPERSEDED'), 'NOTHING HAS BEEN ARCHIVED.'),
    'archive.assets': empty(assets.filter((r) => r.lifecycle === 'ARCHIVE' || r.lifecycle === 'SUPERSEDED'), 'NO ARCHIVED ASSETS.'),
    'archive.authorities': empty(authorities.filter((r) => r.lifecycle === 'ARCHIVE' || r.lifecycle === 'SUPERSEDED'), 'NO ARCHIVED AUTHORITIES.'),
    'archive.characters': empty(talent.filter((r) => r.lifecycle === 'ARCHIVE'), 'NO ARCHIVED CHARACTERS.'),
    'archive.environments': empty([], 'NO ARCHIVED ENVIRONMENTS.'),
    'archive.expressions': empty([], 'NO ARCHIVED EXPRESSIONS.'),
  };

  const issues = (graph?.blockers ?? []).map((b, i) => {
    const [node, ...why] = b.split(':');
    return { id: `issue.${i}`, title: (why.join(':').trim() || b).toUpperCase(), where: node?.trim() ?? '', severity: i === 0 ? 'HIGH' : 'MED' };
  });

  return {
    slug,
    project,
    entry,
    world: worldRecord,
    worldPlate: asset('experience.worldHero')?.img ?? null,
    libraryPlate: asset('library.canon')?.img ?? null,
    collections: C,
    issues,
    layers,
    residents,
    stats: {
      residents: residents.length,
      characters: characters.length,
      beats: journey.length,
      scenes: scenes.length,
      blockers: issues.length,
      assets: assets.length,
      complete: nodes.filter((n) => n.status === 'COMPLETE').length,
      stages: nodes.length,
    },
    /** Every record across both tabs, for id lookup in lineage. */
    lookup: (id: string) => Object.values(C).flatMap((c) => c.records).find((r) => r.id === id) ?? null,
  };
}

export type Realm = ReturnType<typeof buildRealm>;

export function useRealmData(slug?: string): Realm {
  const d = useExpressionData(slug);
  return useMemo(() => buildRealm(d), [d]);
}

/** Records in a collection for a lifecycle (library) — ALL when null. */
export const byLifecycle = (c: Collection, life: Lifecycle | null) => (life ? c.records.filter((r) => r.lifecycle === life) : c.records);
