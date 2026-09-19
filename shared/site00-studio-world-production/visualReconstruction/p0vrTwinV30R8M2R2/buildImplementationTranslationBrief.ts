import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import { CRITICAL_IMPLEMENTATION_REGIONS } from '../p0vrTwinV30R8M2/constants.js';
import type { ActualVisualAnalysis, BlueprintVisualAnalysis } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import { IMPLEMENTATION_EXPRESSION_VERSION } from '../p0vrTwinV30R8M2R1/constants.js';
import { IMPLEMENTATION_TRANSLATION_BRIEF_VERSION } from './constants.js';
import type {
  ImplementationTranslationBrief,
  TranslationAuthorityEvidence,
  TranslationConflictRecord,
  TranslationSectionBlock,
} from './implementationTranslationBriefTypes.js';
import { detectTranslationConflicts } from './translationConflictHandling.js';

function evidenceForRegion(
  regionId: string,
  composition: MobileTwinCompositionState,
  actual: ActualVisualAnalysis,
  blueprint: BlueprintVisualAnalysis,
  bundle: MobileStructuredArtifactBundle,
): TranslationAuthorityEvidence {
  const regionEntry = buildActualImplementationRegionMap(composition).find((r) => r.regionId === regionId);
  const objectIds = regionEntry?.objectIds ?? [];
  const assetIds = objectIds
    .map((id) => composition.objectDefinitions.find((o) => o.objectId === id)?.assetRef)
    .filter(Boolean) as string[];
  const featureIds = objectIds
    .map((id) => composition.objectDefinitions.find((o) => o.objectId === id)?.featureId)
    .filter(Boolean) as string[];
  const actualRegionIds = actual.regions.filter((r) => r.regionId === regionId).map((r) => r.regionId);
  const blueprintRegionIds = blueprint.regions.filter((r) => r.regionId === regionId).map((r) => r.regionId);
  void bundle;
  return {
    actualRegionIds: actualRegionIds.length ? actualRegionIds : regionEntry ? [regionId] : [],
    blueprintRegionIds: blueprintRegionIds.length ? blueprintRegionIds : regionEntry ? [regionId] : [],
    structuredObjectIds: objectIds,
    assetIds,
    featureIds,
  };
}

function section(
  sectionId: TranslationSectionBlock['sectionId'],
  title: string,
  implementationGuidance: string,
  evidence: TranslationAuthorityEvidence,
): TranslationSectionBlock {
  return { sectionId, title, implementationGuidance, evidence };
}

export function buildImplementationTranslationBrief(input: {
  projectId: string;
  workspaceType: string;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  actualAuthorityId: string;
  blueprintAuthorityId: string;
  actualAnalysis: ActualVisualAnalysis;
  blueprintAnalysis: BlueprintVisualAnalysis;
}): ImplementationTranslationBrief {
  const runKey = input.pkg.packageChecksum.slice(0, 10);
  const globalEvidence = evidenceForRegion('HERO_WORKSPACE', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);

  const globalTranslation =
    'SITE 00 host shell stays restrained and technical — small caps nav, muted borders, no decorative chrome. ' +
    'NDXBOOK workspace dominates the viewport: black/off-white contrast, lime only for primary progression and selected locks. ' +
    'Composition is dense editorial (archival cultural-intelligence), not SaaS dashboard: compact hierarchy, thin 1px structural borders, ' +
    'minimal soft-card radii, tight vertical rhythm. Implement with stacked black panels, inset metadata, and sharp typographic hierarchy — ' +
    'avoid oversized mobile card stacks and generic neutral gray surfaces.';

  const hostEvidence = evidenceForRegion('HOST_HEADER', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const projectEvidence = evidenceForRegion('PROJECT_CONTEXT', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const viewportEvidence = evidenceForRegion('TARGET_VIEWPORT_STAGE', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const heroEvidence = evidenceForRegion('HERO_WORKSPACE', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const authorityEvidence = evidenceForRegion('AUTHORITY_PANEL', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const galleryEvidence = evidenceForRegion('CANDIDATE_GALLERY', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const structuredEvidence = evidenceForRegion('STRUCTURED_OUTPUT', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const readinessEvidence = evidenceForRegion('READINESS', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const conceptEvidence = evidenceForRegion('CONCEPT_DATA', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
  const bottomNavEvidence = evidenceForRegion('BOTTOM_NAV', input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);

  const decisionObjectIds = input.composition.objectDefinitions
    .filter((o) => {
      const k = resolveTemplateKeyFromObjectId(o.objectId);
      return ['refine-btn', 'regen-btn', 'inspect-btn', 'primary-next-action', 'decision-bar', 'compare-control'].includes(k);
    })
    .map((o) => o.objectId);

  const sectionTranslations: TranslationSectionBlock[] = [
    section(
      'GLOBAL_PAGE_CHARACTER',
      'GLOBAL PAGE CHARACTER',
      globalTranslation,
      globalEvidence,
    ),
    section(
      'HOST_SHELL',
      'HOST SHELL',
      'Top nav: brand left, breadcrumb trail center-left, compiler/status right — all on #0a0a0a with 1px #222 dividers. ' +
        'Nav spacing is tight (8–10px gaps); typography is small uppercase mono/sans hybrid. Host colors never bleed lime into project body. ' +
        'Host shell frames but does not compete with NDXBOOK black editorial surface below.',
      hostEvidence,
    ),
    section(
      'TARGET_VIEWPORT_STAGE',
      'TARGET VIEWPORT / STAGE',
      'Mobile/tablet/desktop master toggles and stage/auth context share one compact technical row — selected viewport gets inset lime or white edge; others neutral. Minimum tap targets without enlarging into pill buttons.',
      viewportEvidence,
    ),
    section(
      'PROJECT_CONTEXT',
      'PROJECT CONTEXT',
      'Compact strip: project label, active project identity, mobile/tablet/desktop toggles, stage/auth badges grouped as technical chips. ' +
        'Selected viewport uses inset border emphasis; unselected stays neutral #161616. Spacing transitions directly into hero without large gutter.',
      projectEvidence,
    ),
    section(
      'HERO_WORKSPACE',
      'HERO WORKSPACE',
      'Dominant black editorial surface — not a generic stacked card. Headline dominates left ~45% width with tight line breaks and heavy display weight; ' +
        'supporting copy sits beneath headline with minimal gap. Receipt/artifact image occupies center-right with editorial crop; metadata and evidence badge ' +
        'anchor near artifact without overpowering headline. Authority rail stays visually attached on the right, subordinate to headline+artifact pair. ' +
        'First glance reads: headline → artifact → authority controls.',
      heroEvidence,
    ),
    section(
      'AUTHORITY_PANEL',
      'AUTHORITY PANEL',
      'Narrow right-side control rail: selected mobile state highlighted (lime ring), desktop master neutral. Nested authority pair block with compact vertical rhythm. ' +
        'Replace control secondary; promote actions differentiated — primary progression lime fill only on true primary, not all rows. ' +
        'DO NOT flatten into equivalent full-width lime buttons.',
      authorityEvidence,
    ),
    section(
      'CANDIDATE_GALLERY',
      'CANDIDATE GALLERY',
      'Editorial contact-sheet: four visible cards, tight gaps, mixed imagery/typography thumbs, version labels. Selected card gets lime edge or inset emphasis. ' +
        'Compare affordance and action row beneath — editorial archive feel, not ecommerce grid.',
      galleryEvidence,
    ),
    section(
      'DECISION_BAR',
      'DECISION BAR',
      'Refine, regenerate, inspect, fullscreen/contextual next — neutral secondary buttons in a single row with primary progression (lime) only on the forward action. ' +
        'Spacing 6–8px; restrained borders #333.',
      {
        actualRegionIds: [],
        blueprintRegionIds: [],
        structuredObjectIds: decisionObjectIds,
        assetIds: [],
        featureIds: input.composition.objectDefinitions
          .filter((o) => decisionObjectIds.includes(o.objectId))
          .map((o) => o.featureId)
          .filter(Boolean) as string[],
      },
    ),
    section(
      'STRUCTURED_OUTPUT',
      'STRUCTURED OUTPUT',
      'Single compact band of five narrow technical cards (grounding, blueprint, overlay, assets, function) with preview imagery and short labels. ' +
        'Footer metadata reads production/evidence — DO NOT render as generic empty boxes.',
      structuredEvidence,
    ),
    section(
      'READINESS',
      'READINESS',
      'Circular readiness gauge + compact checks list + status cluster + next action grouped as one system row. Dense information, equal vertical alignment, minimal padding.',
      readinessEvidence,
    ),
    section(
      'CONCEPT_DATA_HISTORY',
      'CONCEPT DATA / HISTORY',
      'Lower metadata strip: concept data, version history, change history, master update, amendment — low visual dominance, mono-dense readout on #0f0f0f.',
      conceptEvidence,
    ),
    section(
      'BOTTOM_NAV',
      'BOTTOM NAV',
      'Five destinations with separators; icon/text stacked compact; active state subtle underline or weight — neutral host styling, no giant lime pill. Fixed footer height ~52px.',
      bottomNavEvidence,
    ),
  ];

  const typographyTranslation =
    'TYPOGRAPHY IMPLEMENTATION DIRECTIVE: Display headline and hero copy use project display weight (900) with uppercase optional on labels only. ' +
    'Host nav and compiler status use smaller technical sans (9–10px, wide tracking). Project context and metadata use mono for IDs/status. ' +
    'Hierarchy: headline > artifact caption > section labels > control labels > footer metadata. Preserve authority line breaks; do not auto-shrink headline to single line.';

  const colorMaterialTranslation =
    'COLOR + MATERIAL DIRECTIVE: Black (#0a–#11) primary project surfaces; off-white (#eaeaea–#f5f5f5) information text; lime (#c8ff00) selective emphasis only. ' +
    'Thin 1px borders (#222–#444); 2–4px radius structural; no generic neutral card system or random accent colors; no blue unless host/system contract.';

  const assetTranslation =
    'ASSET IMPLEMENTATION DIRECTIVE: Hero receipt image — center-right, cover crop, focal point upper-center, 1px #444 border. Gallery thumbs — consistent aspect, version label overlay bottom-left. ' +
    'Structured output preview tiles — small raster previews inside cards, not placeholders. Manifest IDs define identity; brief defines framing and prominence.';

  const controlTranslation =
    'CONTROL IMPLEMENTATION DIRECTIVE: PRIMARY = lime fill dark text; SECONDARY = #161616 fill #333 border; SELECTED = lime ring inset; NEUTRAL = transparent #2a2a2a border; ' +
    'LOCKED = dashed #666; SYSTEM = host #050505. Width follows blueprint — authority rail controls stay narrow stacked, not full-width lime bars.';

  const interactionTranslation =
    'INTERACTION STATE DIRECTIVE: Selected locks/views use SELECTED treatment; hover slightly lifts border contrast; pressed inset shadow; disabled muted opacity 0.5; locked dashed; ' +
    'active nav weight+1; review-ready states use status color without new accents. Function/state contracts are semantic truth.';

  const responsiveTranslation =
    'MOBILE RESPONSIVE DIRECTIVE: Keep hero headline+artifact side-by-side until width <360px; authority rail may narrow but stays adjacent to hero. Gallery stays horizontal scroll strip of four. ' +
    'Do not stack everything — only concept/history may wrap to two columns on very small widths. Bottom nav always fixed.';

  const doNotDo =
    'DO NOT DO: Do not redesign. Do not generalize into dashboard cards. Do not flatten authority hierarchy. Do not make all buttons lime. ' +
    'Do not stack everything unless required. Do not use authority screenshots at runtime. Do not invent assets or placeholders. ' +
    'Do not use semantic debug labels. Do not widen spacing beyond authority intent. Do not replace editorial density with airy SaaS spacing. ' +
    'Do not alter feature hierarchy. Do not reinterpret NDXBOOK as a generic app.';

  const translationConflicts: TranslationConflictRecord[] = detectTranslationConflicts({
    composition: input.composition,
    actualAnalysis: input.actualAnalysis,
    blueprintAnalysis: input.blueprintAnalysis,
    sectionTranslations,
  });

  const unresolvedTranslationItems = translationConflicts
    .filter((c) => c.resolution === 'UNRESOLVED')
    .map((c) => `${c.kind}:${c.sectionId}`);

  const authorityEvidenceAggregate: TranslationAuthorityEvidence = {
    actualRegionIds: [...new Set(sectionTranslations.flatMap((s) => s.evidence.actualRegionIds))],
    blueprintRegionIds: [...new Set(sectionTranslations.flatMap((s) => s.evidence.blueprintRegionIds))],
    structuredObjectIds: [...new Set(sectionTranslations.flatMap((s) => s.evidence.structuredObjectIds))],
    assetIds: [...new Set(sectionTranslations.flatMap((s) => s.evidence.assetIds))],
    featureIds: [...new Set(sectionTranslations.flatMap((s) => s.evidence.featureIds))],
  };

  for (const regionId of CRITICAL_IMPLEMENTATION_REGIONS) {
    if (!authorityEvidenceAggregate.actualRegionIds.includes(regionId)) {
      const ev = evidenceForRegion(regionId, input.composition, input.actualAnalysis, input.blueprintAnalysis, input.bundle);
      authorityEvidenceAggregate.actualRegionIds.push(...ev.actualRegionIds);
      authorityEvidenceAggregate.structuredObjectIds.push(...ev.structuredObjectIds);
    }
  }

  const partial: Omit<ImplementationTranslationBrief, 'hash' | 'status'> = {
    id: `itb-${input.pkg.id}-${runKey}`,
    projectId: input.projectId,
    workspaceType: input.workspaceType,
    viewport: 'MOBILE',
    packageId: input.pkg.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    actualAuthorityId: input.actualAuthorityId,
    blueprintAuthorityId: input.blueprintAuthorityId,
    actualVisualAnalysisId: input.actualAnalysis.id,
    blueprintVisualAnalysisId: input.blueprintAnalysis.id,
    expressionVersion: IMPLEMENTATION_EXPRESSION_VERSION,
    briefVersion: IMPLEMENTATION_TRANSLATION_BRIEF_VERSION,
    globalTranslation,
    sectionTranslations,
    typographyTranslation,
    colorMaterialTranslation,
    assetTranslation,
    controlTranslation,
    interactionTranslation,
    responsiveTranslation,
    doNotDo,
    unresolvedTranslationItems,
    authorityEvidence: authorityEvidenceAggregate,
    translationConflicts,
  };

  const hash = fnv1aHex(JSON.stringify(partial));
  const status =
    unresolvedTranslationItems.length > 2 ? ('BLOCKED' as const)
    : unresolvedTranslationItems.length ? ('REVIEW_REQUIRED' as const)
    : ('READY' as const);

  return { ...partial, hash, status };
}
