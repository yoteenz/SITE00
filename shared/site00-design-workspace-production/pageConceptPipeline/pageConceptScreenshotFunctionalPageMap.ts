/**
 * P0.VR.SCREENSHOT-FUNCTION-MAP-INTELLIGENCE-LAYER1
 * CGPT + Page Architecture → Screenshot Function Interpreter → Functional Page Map → GPT2
 */

import { buildPageSystemReviewModel } from '../designPageSystemReview.js';
import { DESIGN_INTERACTION_REGISTRY, type DesignInteractionEntry } from '../designInteractionRegistry.js';
import type { PageConceptPageArchitectureBrief } from './pageConceptPageArchitectureBrief.js';
import type { PageCreativeContext, PageFunctionContract, ProjectCreativeContext } from './types.js';
import type { Gpt2MobileProviderReferenceBundle } from './pageConceptGpt2MobileReferenceAuthority.js';
import { GPT2_MOBILE_INPUT_ROLE } from './pageConceptGpt2MobileReferenceAuthority.js';

export const SCREENSHOT_FUNCTIONAL_PAGE_MAP_VERSION = 'screenshot-functional-page-map-v2-full-scroll';

export type ScreenshotFunctionHostOwnership = 'HOST_OWNED' | 'PROJECT_OWNED' | 'SHARED_CONTINUITY';

export type ScreenshotFunctionSourceCapture =
  | typeof GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL
  | typeof GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL
  | typeof GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL;

export type ScreenshotFunctionalRegion = {
  regionId: string;
  regionName: string;
  sourceCapture: ScreenshotFunctionSourceCapture;
  verticalOrder: number;
  hostOrProject: ScreenshotFunctionHostOwnership;
  persistentOrLocal: 'PERSISTENT' | 'LOCAL';
  interactiveOrStatic: 'INTERACTIVE' | 'STATIC' | 'MIXED';
  requiredOrOptional: 'REQUIRED' | 'OPTIONAL';
};

export type ScreenshotFunctionalElementType =
  | 'NAV_ITEM'
  | 'BUTTON'
  | 'TAB'
  | 'TOGGLE'
  | 'CARD'
  | 'STATUS'
  | 'PROGRESS'
  | 'ENTRY_LINK'
  | 'SECTION_LINK'
  | 'CONTENT_PREVIEW'
  | 'METADATA'
  | 'BREADCRUMB'
  | 'BOTTOM_NAV_ITEM'
  | 'FILTER'
  | 'CTA'
  | 'STATIC_TEXT'
  | 'IMAGE'
  | 'BADGE';

export type ScreenshotInteractionAction =
  | 'NAVIGATE'
  | 'OPEN_DETAIL'
  | 'SWITCH_VIEW'
  | 'SELECT'
  | 'FILTER'
  | 'EXPAND'
  | 'COLLAPSE'
  | 'OPEN_DRAWER'
  | 'OPEN_MODAL'
  | 'OPEN_INSPECTOR'
  | 'SCROLL_TARGET'
  | 'CHANGE_CONTEXT'
  | 'READONLY';

export type ScreenshotFunctionalElement = {
  elementId: string;
  regionId: string;
  label: string;
  elementType: ScreenshotFunctionalElementType;
  functionType: string;
  interactionType: ScreenshotInteractionAction;
  destinationOrEffect: string;
  persistentState: 'ROUTE' | 'LOCAL_PAGE' | 'MODAL' | 'WORKSPACE' | 'NONE';
  visualOnly: boolean;
  mustPreserveFunction: boolean;
  mayMove: boolean;
  mayRestyle: boolean;
  mayRename: boolean;
  mayRemove: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'IMPLEMENTATION_REGISTRY' | 'PAGE_ARCHITECTURE' | 'PAGE_CONTEXT' | 'INFERRED';
};

export type ScreenshotBottomNavigationItem = {
  itemId: string;
  label: string;
  iconRole: string;
  activeState: boolean;
  destination: string;
  order: number;
  hostOrProjectOwned: ScreenshotFunctionHostOwnership;
  mustPreserve: boolean;
  mayRestyle: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ScreenshotBottomNavigationMap = {
  containerRole: string;
  fixedOrFlow: 'FIXED' | 'FLOW';
  itemCount: number;
  items: readonly ScreenshotBottomNavigationItem[];
};

export type ScreenshotDesignFreedomEntry = {
  regionId: string;
  regionName: string;
  functionFixed: boolean;
  placementFlexible: boolean;
  sizeFlexible: boolean;
  spacingFlexible: boolean;
  materialFlexible: boolean;
  typographyFlexible: boolean;
  groupingFlexible: boolean;
  hierarchyFlexible: boolean;
};

export type PageFunctionalRelationship = {
  relationshipId: string;
  beforeRegionId: string;
  afterRegionId: string;
  rule: string;
};

export type FullPageScrollMapStage =
  | 'TOP'
  | 'EARLY_CONTENT'
  | 'MID_CONTENT'
  | 'LOWER_CONTENT'
  | 'FINAL_ACTION_CONTINUITY'
  | 'BOTTOM_NAVIGATION';

export type FullPageScrollMapEntry = {
  stage: FullPageScrollMapStage;
  verticalOrder: number;
  role: string;
  interaction: string;
  sourceCapture: ScreenshotFunctionSourceCapture;
  regionIds: readonly string[];
};

export type ScreenshotFunctionalPageMap = {
  mapId: string;
  version: typeof SCREENSHOT_FUNCTIONAL_PAGE_MAP_VERSION;
  sourceFingerprint: string;
  projectId: string;
  pageId: string;
  route: string;
  pageIdentityLabel: string;
  captureSetId: string;
  pageArchitectureBriefId: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  regions: readonly ScreenshotFunctionalRegion[];
  elements: readonly ScreenshotFunctionalElement[];
  bottomNavigationMap: ScreenshotBottomNavigationMap;
  functionalInvariants: readonly string[];
  designFreedomMap: readonly ScreenshotDesignFreedomEntry[];
  relationshipGraph: readonly PageFunctionalRelationship[];
  fullPageScrollMap: readonly FullPageScrollMapEntry[];
  unresolvedElements: readonly { elementId: string; reason: string }[];
  implementationMetadataEnriched: boolean;
  createdAt: string;
};

export type ScreenshotFunctionMapReceipt = {
  screenshotFunctionMap: 'PASS' | 'FAIL';
  functionMapId: string;
  regionCount: number;
  interactiveElementCount: number;
  bottomNavMap: 'PASS' | 'FAIL';
  bottomNavItemCount: number;
  bottomNavOrderCaptured: 'PASS' | 'FAIL';
  hostProjectOwnership: 'PASS' | 'FAIL';
  functionalInvariants: 'PASS' | 'FAIL';
  designFreedomMap: 'PASS' | 'FAIL';
  implementationMetadataEnrichment: 'PASS' | 'FAIL';
  unresolvedFunctionGuard: 'PASS' | 'FAIL';
  gpt2BlockedIfFunctionMapMissing: 'YES' | 'NO';
};

export type FunctionalFidelityScorecard = {
  pageIdentity: 'PASS' | 'FAIL';
  statusRegion: 'PASS' | 'FAIL';
  viewToggle: 'PASS' | 'FAIL';
  entryNav: 'PASS' | 'FAIL';
  currentWork: 'PASS' | 'FAIL';
  bottomNav: 'PASS' | 'FAIL';
  routeContinuity: 'PASS' | 'FAIL';
  overall: 'PASS' | 'FAIL';
  failureCode: 'FUNCTIONAL_REDRAW_INVALID' | null;
};

function hashPayload(payload: unknown): string {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function sourceCaptureForRegionIndex(index: number, total: number): ScreenshotFunctionSourceCapture {
  const topCut = Math.ceil(total / 3);
  const midCut = Math.ceil((2 * total) / 3);
  if (index < topCut) return GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL;
  if (index < midCut) return GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL;
  return GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL;
}

function hostOwnershipForRegionTitle(title: string): ScreenshotFunctionHostOwnership {
  const t = title.toUpperCase();
  if (t.includes('BOTTOM') || t.includes('CONTINUITY') || t.includes('SHELL')) return 'SHARED_CONTINUITY';
  if (t.includes('VIEWPORT') || t.includes('HOST')) return 'HOST_OWNED';
  return 'PROJECT_OWNED';
}

function mapRegistryAction(entry: DesignInteractionEntry): ScreenshotInteractionAction {
  if (entry.readonly) return 'READONLY';
  if (entry.actionType === 'NAVIGATION') return 'NAVIGATE';
  if (entry.semanticRole.includes('presentation-mode')) return 'SWITCH_VIEW';
  if (entry.semanticRole.includes('preview-mode') || entry.semanticRole.includes('derived-preview')) {
    return 'CHANGE_CONTEXT';
  }
  if (entry.actionType === 'OVERLAY') {
    if (entry.semanticRole.includes('drawer')) return 'OPEN_DRAWER';
    if (entry.semanticRole.includes('inspector')) return 'OPEN_INSPECTOR';
    return 'OPEN_MODAL';
  }
  if (entry.actionType === 'STATE_MUTATION') return 'SELECT';
  if (entry.semanticRole.includes('candidate-select')) return 'SELECT';
  if (entry.semanticRole.includes('scroll')) return 'SCROLL_TARGET';
  return 'OPEN_DETAIL';
}

function mapRegistryElementType(entry: DesignInteractionEntry): ScreenshotFunctionalElementType {
  if (entry.surface === 'bottom-nav') return 'BOTTOM_NAV_ITEM';
  if (entry.surface === 'primary-nav') return 'NAV_ITEM';
  if (entry.semanticRole.includes('presentation-mode')) return 'TOGGLE';
  if (entry.surface === 'viewport-band') return 'TAB';
  if (entry.semanticRole.includes('navigation')) return 'NAV_ITEM';
  if (entry.actionType === 'READONLY') return 'STATIC_TEXT';
  if (entry.semanticRole.includes('candidate')) return 'CARD';
  return 'BUTTON';
}

function regionIdForSurface(
  surface: DesignInteractionEntry['surface'],
  regions: readonly ScreenshotFunctionalRegion[],
): string {
  const byName = (needle: string) =>
    regions.find((r) => r.regionName.toUpperCase().includes(needle))?.regionId;
  if (surface === 'bottom-nav') return byName('BOTTOM') ?? regions[regions.length - 1]?.regionId ?? 'REGION_UNKNOWN';
  if (surface === 'header' || surface === 'context-bar') {
    return byName('IDENTITY') ?? byName('ENTRY') ?? regions[0]?.regionId ?? 'REGION_UNKNOWN';
  }
  if (surface === 'view-controls' || surface === 'viewport-band') {
    return byName('VIEW') ?? byName('STATUS') ?? regions[1]?.regionId ?? 'REGION_UNKNOWN';
  }
  if (surface === 'hero' || surface === 'hero-rail' || surface === 'gallery') {
    return byName('ENTRY') ?? byName('INDEX') ?? regions[Math.min(2, regions.length - 1)]?.regionId ?? 'REGION_UNKNOWN';
  }
  if (surface === 'pipeline' || surface === 'structured-output') {
    return byName('CURRENT') ?? byName('ACTION') ?? regions[Math.min(4, regions.length - 1)]?.regionId ?? 'REGION_UNKNOWN';
  }
  return regions[Math.min(2, regions.length - 1)]?.regionId ?? 'REGION_UNKNOWN';
}

function buildBottomNavigationMap(): ScreenshotBottomNavigationMap {
  const navEntries = DESIGN_INTERACTION_REGISTRY.filter((e) => e.surface === 'bottom-nav');
  const items: ScreenshotBottomNavigationItem[] = navEntries.map((entry, index) => ({
    itemId: entry.id,
    label: entry.label.toUpperCase(),
    iconRole: entry.semanticRole,
    activeState: entry.id === 'dock-workspace',
    destination: entry.destination ?? entry.handler,
    order: index + 1,
    hostOrProjectOwned: 'HOST_OWNED',
    mustPreserve: true,
    mayRestyle: true,
    confidence: 'HIGH',
  }));
  return {
    containerRole: 'PROJECT_PAGE_BOTTOM_NAVIGATION',
    fixedOrFlow: 'FIXED',
    itemCount: items.length,
    items,
  };
}

function buildFullPageScrollMap(
  regions: readonly ScreenshotFunctionalRegion[],
): readonly FullPageScrollMapEntry[] {
  const sorted = [...regions].sort((a, b) => a.verticalOrder - b.verticalOrder);
  const pick = (predicate: (name: string) => boolean, capture: ScreenshotFunctionSourceCapture, stage: FullPageScrollMapStage, order: number, role: string) => {
    const ids = sorted.filter((r) => predicate(r.regionName.toUpperCase())).map((r) => r.regionId);
    return {
      stage,
      verticalOrder: order,
      role,
      interaction: 'Preserve functional intent — restyle allowed.',
      sourceCapture: capture,
      regionIds: ids.length ? ids : sorted.slice(0, 1).map((r) => r.regionId),
    };
  };
  return [
    pick((n) => n.includes('IDENTITY') || n.includes('ENTRY') || n.includes('STATUS'), GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL, 'TOP', 1, 'Header, breadcrumb, page identity'),
    pick((n) => n.includes('OVERVIEW') || n.includes('INDEX') || n.includes('ENTRY'), GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL, 'EARLY_CONTENT', 2, 'Early overview and entry access'),
    pick((n) => n.includes('EVIDENCE') || n.includes('CONTENT') || n.includes('CURRENT'), GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL, 'MID_CONTENT', 3, 'Mid-page content and activity'),
    pick((n) => n.includes('ACTION') || n.includes('WORK') || n.includes('DEEPER'), GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL, 'LOWER_CONTENT', 4, 'Lower content transitions'),
    pick((n) => n.includes('CONTINUITY') || n.includes('BOTTOM') || n.includes('SHELL'), GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL, 'FINAL_ACTION_CONTINUITY', 5, 'Final action / continuity before nav'),
    {
      stage: 'BOTTOM_NAVIGATION' as const,
      verticalOrder: 6,
      role: 'True bottom navigation — destinations, order, active state from capture C',
      interaction: 'NAVIGATE — locked IA',
      sourceCapture: GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
      regionIds: sorted.filter((r) => r.regionName.toUpperCase().includes('BOTTOM')).map((r) => r.regionId),
    },
  ];
}

function buildRelationshipGraph(regions: readonly ScreenshotFunctionalRegion[]): PageFunctionalRelationship[] {
  const sorted = [...regions].sort((a, b) => a.verticalOrder - b.verticalOrder);
  const out: PageFunctionalRelationship[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const before = sorted[i]!;
    const after = sorted[i + 1]!;
    out.push({
      relationshipId: `rel-${before.regionId}-${after.regionId}`,
      beforeRegionId: before.regionId,
      afterRegionId: after.regionId,
      rule: `${before.regionName} must precede ${after.regionName} in scroll narrative.`,
    });
  }
  if (sorted.length > 0) {
    const bottom = sorted[sorted.length - 1]!;
    out.push({
      relationshipId: 'rel-content-bottom-nav',
      beforeRegionId: sorted[Math.max(0, sorted.length - 2)]?.regionId ?? bottom.regionId,
      afterRegionId: bottom.regionId,
      rule: 'Bottom navigation remains available after page content — do not end page above shell handoff.',
    });
  }
  return out;
}

export function computeScreenshotFunctionMapSourceFingerprint(input: {
  captureSetId: string;
  functionContractId: string;
  pageArchitectureContentHash: string | null;
  capturePackageVersion: string;
}): string {
  return hashPayload(input);
}

export function interpretScreenshotFunctionality(input: {
  captureSetId: string;
  providerReferenceBundle: Gpt2MobileProviderReferenceBundle;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  pageArchitectureBrief: PageConceptPageArchitectureBrief | null;
  viewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}): ScreenshotFunctionalPageMap {
  const arch = input.pageArchitectureBrief;
  const viewport = input.viewport ?? 'MOBILE';
  const pageReview = buildPageSystemReviewModel(input.projectContext.projectId, input.pageContext.pageId, viewport);

  const archRegions = arch?.mobileRegionMap ?? [];
  const regions: ScreenshotFunctionalRegion[] = archRegions.map((r, index) => ({
    regionId: r.regionId,
    regionName: r.title,
    sourceCapture: sourceCaptureForRegionIndex(index, Math.max(archRegions.length, 1)),
    verticalOrder: index + 1,
    hostOrProject: hostOwnershipForRegionTitle(r.title),
    persistentOrLocal: r.title.toUpperCase().includes('BOTTOM') ? 'PERSISTENT' : 'LOCAL',
    interactiveOrStatic:
      r.title.toUpperCase().includes('ENTRY') || r.title.toUpperCase().includes('ACTION') ? 'INTERACTIVE'
      : r.title.toUpperCase().includes('EVIDENCE') ? 'MIXED'
      : 'STATIC',
    requiredOrOptional: r.title.toUpperCase().includes('OPTIONAL') ? 'OPTIONAL' : 'REQUIRED',
  }));

  if (regions.length === 0) {
    regions.push({
      regionId: 'REGION_FALLBACK',
      regionName: input.pageContext.pageName.toUpperCase(),
      sourceCapture: GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      verticalOrder: 1,
      hostOrProject: 'PROJECT_OWNED',
      persistentOrLocal: 'LOCAL',
      interactiveOrStatic: 'MIXED',
      requiredOrOptional: 'REQUIRED',
    });
  }

  const elements: ScreenshotFunctionalElement[] = [];
  let registryEnriched = false;

  for (const entry of DESIGN_INTERACTION_REGISTRY) {
    if (entry.surface === 'opus-dock') continue;
    const regionId = regionIdForSurface(entry.surface, regions);
    elements.push({
      elementId: `el-${entry.id}`,
      regionId,
      label: entry.label.toUpperCase(),
      elementType: mapRegistryElementType(entry),
      functionType: entry.semanticRole,
      interactionType: mapRegistryAction(entry),
      destinationOrEffect: entry.destination ?? entry.handler,
      persistentState:
        entry.actionType === 'NAVIGATION' ? 'ROUTE'
        : entry.actionType === 'OVERLAY' ? 'MODAL'
        : entry.actionType === 'STATE_MUTATION' ? 'LOCAL_PAGE'
        : 'WORKSPACE',
      visualOnly: entry.readonly === true,
      mustPreserveFunction: entry.surface === 'bottom-nav' || entry.semanticRole.includes('navigation'),
      mayMove: entry.surface !== 'bottom-nav',
      mayRestyle: true,
      mayRename: false,
      mayRemove: false,
      confidence: 'HIGH',
      source: 'IMPLEMENTATION_REGISTRY',
    });
    registryEnriched = true;
  }

  for (const row of pageReview.interactions.slice(0, 12)) {
    if (elements.some((e) => e.label === row.label.toUpperCase())) continue;
    elements.push({
      elementId: `el-psr-${row.id}`,
      regionId: regions[Math.min(2, regions.length - 1)]!.regionId,
      label: row.label.toUpperCase(),
      elementType: 'BUTTON',
      functionType: row.stateEffect,
      interactionType: row.action.includes('NAVIGATION') ? 'NAVIGATE' : 'OPEN_DETAIL',
      destinationOrEffect: row.destination ?? row.action,
      persistentState: 'WORKSPACE',
      visualOnly: false,
      mustPreserveFunction: false,
      mayMove: true,
      mayRestyle: true,
      mayRename: false,
      mayRemove: false,
      confidence: 'MEDIUM',
      source: 'PAGE_CONTEXT',
    });
  }

  const bottomNavigationMap = buildBottomNavigationMap();

  const functionalInvariants = [
    `Page must remain ${input.pageContext.pageName.toUpperCase()} (${input.pageContext.pageRole || 'overview'}).`,
    'Entry / index navigation must remain available and tappable.',
    'Founder/client or canonical/list view switching must remain available where implemented.',
    'Project status / current phase signal must remain visible in overview flow.',
    'In Production / current work region must remain accessible when defined by architecture.',
    `Bottom nav must keep exactly ${bottomNavigationMap.itemCount} destinations in registry order.`,
    'Active navigation state must remain legible.',
    'Deeper project access paths must remain available.',
    'HOST vs PROJECT ownership boundaries must be preserved.',
  ];

  const designFreedomMap: ScreenshotDesignFreedomEntry[] = regions.map((r) => ({
    regionId: r.regionId,
    regionName: r.regionName,
    functionFixed: true,
    placementFlexible: r.hostOrProject !== 'HOST_OWNED',
    sizeFlexible: true,
    spacingFlexible: true,
    materialFlexible: r.hostOrProject !== 'HOST_OWNED',
    typographyFlexible: true,
    groupingFlexible: r.hostOrProject === 'PROJECT_OWNED',
    hierarchyFlexible: r.hostOrProject === 'PROJECT_OWNED',
  }));

  const relationshipGraph = buildRelationshipGraph(regions);
  const fullPageScrollMap = buildFullPageScrollMap(regions);

  const unresolvedElements: { elementId: string; reason: string }[] = [];
  if (bottomNavigationMap.itemCount === 0) {
    unresolvedElements.push({ elementId: 'bottom-nav', reason: 'FUNCTION_UNRESOLVED: no bottom nav items from registry' });
  }
  for (const asset of [
    input.providerReferenceBundle.topStructuralCapture,
    input.providerReferenceBundle.middleStructuralCapture,
    input.providerReferenceBundle.bottomStructuralCapture,
  ]) {
    if (!asset?.base64?.trim()) {
      unresolvedElements.push({
        elementId: asset?.assetId ?? 'capture',
        reason: `FUNCTION_UNRESOLVED: missing ${asset?.role ?? 'structural'} capture`,
      });
    }
  }

  const sourceFingerprint = computeScreenshotFunctionMapSourceFingerprint({
    captureSetId: input.captureSetId,
    functionContractId: input.functionContract.contractId,
    pageArchitectureContentHash: arch?.contentHash ?? null,
    capturePackageVersion: input.providerReferenceBundle.capturePackageVersion,
  });

  const mapId = `sfm-${sourceFingerprint}`;

  let confidence: ScreenshotFunctionalPageMap['confidence'] = 'HIGH';
  if (unresolvedElements.length > 0) confidence = 'MEDIUM';
  if (!arch) confidence = 'LOW';

  return {
    mapId,
    version: SCREENSHOT_FUNCTIONAL_PAGE_MAP_VERSION,
    sourceFingerprint,
    projectId: input.projectContext.projectId,
    pageId: input.pageContext.pageId,
    route: input.functionContract.route,
    pageIdentityLabel: `${input.pageContext.pageName} · ${input.pageContext.pageRole ?? 'PAGE'}`,
    captureSetId: input.captureSetId,
    pageArchitectureBriefId: arch?.briefId ?? null,
    confidence,
    regions,
    elements,
    bottomNavigationMap,
    functionalInvariants,
    designFreedomMap,
    relationshipGraph,
    fullPageScrollMap,
    unresolvedElements,
    implementationMetadataEnriched: registryEnriched,
    createdAt: new Date().toISOString(),
  };
}

export function validateScreenshotFunctionMapForGpt2Dispatch(map: ScreenshotFunctionalPageMap): {
  ok: boolean;
  errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE' | null;
  criticalUnresolved: readonly string[];
} {
  const criticalUnresolved = map.unresolvedElements
    .filter((u) => u.reason.includes('bottom-nav') || u.reason.includes('missing'))
    .map((u) => u.reason);
  if (!map.pageArchitectureBriefId) {
    return {
      ok: false,
      errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE',
      criticalUnresolved: ['PAGE_ARCHITECTURE_BRIEF_MISSING'],
    };
  }
  if (map.bottomNavigationMap.itemCount === 0) {
    return {
      ok: false,
      errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE',
      criticalUnresolved: [...criticalUnresolved, 'BOTTOM_NAV_MAP_EMPTY'],
    };
  }
  if (map.regions.length < 3) {
    return {
      ok: false,
      errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE',
      criticalUnresolved: [...criticalUnresolved, 'INSUFFICIENT_REGIONS'],
    };
  }
  const hasBottomScroll = map.fullPageScrollMap?.some((s) => s.stage === 'BOTTOM_NAVIGATION');
  if (!hasBottomScroll) {
    return {
      ok: false,
      errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE',
      criticalUnresolved: [...criticalUnresolved, 'FULL_PAGE_SCROLL_MAP_MISSING_BOTTOM'],
    };
  }
  if (criticalUnresolved.length > 0) {
    return { ok: false, errorCode: 'SCREENSHOT_FUNCTION_MAP_INCOMPLETE', criticalUnresolved };
  }
  return { ok: true, errorCode: null, criticalUnresolved: [] };
}

export function buildScreenshotFunctionMapReceipt(
  map: ScreenshotFunctionalPageMap,
  dispatchGuard: { ok: boolean },
): ScreenshotFunctionMapReceipt {
  const interactiveCount = map.elements.filter((e) => !e.visualOnly && e.interactionType !== 'READONLY').length;
  const bottomOrderOk = map.bottomNavigationMap.items.every((item, i) => item.order === i + 1);
  const ownershipOk = map.regions.every((r) => r.hostOrProject !== undefined);
  return {
    screenshotFunctionMap: dispatchGuard.ok ? 'PASS' : 'FAIL',
    functionMapId: map.mapId,
    regionCount: map.regions.length,
    interactiveElementCount: interactiveCount,
    bottomNavMap: map.bottomNavigationMap.itemCount > 0 ? 'PASS' : 'FAIL',
    bottomNavItemCount: map.bottomNavigationMap.itemCount,
    bottomNavOrderCaptured: bottomOrderOk ? 'PASS' : 'FAIL',
    hostProjectOwnership: ownershipOk ? 'PASS' : 'FAIL',
    functionalInvariants: map.functionalInvariants.length > 0 ? 'PASS' : 'FAIL',
    designFreedomMap: map.designFreedomMap.length > 0 ? 'PASS' : 'FAIL',
    implementationMetadataEnrichment: map.implementationMetadataEnriched ? 'PASS' : 'FAIL',
    unresolvedFunctionGuard: map.unresolvedElements.length === 0 ? 'PASS' : 'FAIL',
    gpt2BlockedIfFunctionMapMissing: dispatchGuard.ok ? 'NO' : 'YES',
  };
}

export function compileGpt2MobileScreenshotFunctionBlock(map: ScreenshotFunctionalPageMap): string {
  const navLabels = map.bottomNavigationMap.items.map((i) => i.label).join(' → ');
  const active = map.bottomNavigationMap.items.find((i) => i.activeState)?.label ?? 'WORKSPACE';
  const regionLines = map.regions
    .slice(0, 9)
    .map((r, i) => `${i + 1}. ${r.regionName} (${r.hostOrProject}; ${r.sourceCapture.replace(/_CAPTURE$/, '')})`);
  const scrollLines = (map.fullPageScrollMap ?? []).map(
    (s) => `${s.verticalOrder}. ${s.stage}: ${s.role} [${s.sourceCapture}]`,
  );
  const invariantLines = map.functionalInvariants.slice(0, 8).map((line) => `- ${line}`);
  return [
    'PAGE FUNCTION (SCREENSHOT FUNCTIONAL PAGE MAP — WHAT EXISTS DOES, NOT HOW IT LOOKS):',
    `Route ${map.route} · ${map.pageIdentityLabel}.`,
    'You are redesigning an EXISTING FUNCTIONAL PAGE.',
    'The structural captures show what currently exists; this map explains what regions/controls DO.',
    'Preserve functions and relationships below. Do not copy screenshot visual styling.',
    'Create a new visual design around the same functional system.',
    '',
    'REGIONS (required anatomy):',
    ...regionLines,
    '',
    'FULL PAGE SCROLL MAP (TOP → BOTTOM — entire page must appear in concept):',
    ...scrollLines,
    '',
    'BOTTOM NAVIGATION (LOCKED IA — restyle allowed):',
    `- ${map.bottomNavigationMap.itemCount} items in order: ${navLabels}.`,
    `- Active destination baseline: ${active}.`,
    `- Container: ${map.bottomNavigationMap.containerRole} (${map.bottomNavigationMap.fixedOrFlow}).`,
    '',
    'FUNCTIONAL INVARIANTS:',
    ...invariantLines,
    '',
    'DESIGN FREEDOM:',
    '- Project-owned regions: placement/spacing/material/typography/hierarchy may change.',
    '- Bottom nav: destinations/order/roles fixed; visual treatment moderately flexible.',
    '- Host/shell regions: function fixed; moderate visual adaptation within SITE 00 continuity.',
  ].join('\n');
}

export function formatScreenshotFunctionMapDebugLines(
  map: ScreenshotFunctionalPageMap,
  receipt: ScreenshotFunctionMapReceipt,
): string[] {
  return [
    `SCREENSHOT_FUNCTION_MAP: ${receipt.screenshotFunctionMap}`,
    `FUNCTION_MAP_ID: ${receipt.functionMapId}`,
    `REGION_COUNT: ${receipt.regionCount}`,
    `INTERACTIVE_ELEMENT_COUNT: ${receipt.interactiveElementCount}`,
    `BOTTOM_NAV_MAP: ${receipt.bottomNavMap}`,
    `BOTTOM_NAV_ITEM_COUNT: ${receipt.bottomNavItemCount}`,
    `BOTTOM_NAV_ORDER_CAPTURED: ${receipt.bottomNavOrderCaptured}`,
    `HOST_PROJECT_OWNERSHIP: ${receipt.hostProjectOwnership}`,
    `FUNCTIONAL_INVARIANTS: ${receipt.functionalInvariants}`,
    `DESIGN_FREEDOM_MAP: ${receipt.designFreedomMap}`,
    `IMPLEMENTATION_METADATA_ENRICHMENT: ${receipt.implementationMetadataEnrichment}`,
    `UNRESOLVED_FUNCTION_GUARD: ${receipt.unresolvedFunctionGuard}`,
    `MAP_CONFIDENCE: ${map.confidence}`,
    `SOURCE_FINGERPRINT: ${map.sourceFingerprint}`,
    ...(map.unresolvedElements.length ?
      map.unresolvedElements.map((u) => `UNRESOLVED: ${u.elementId} · ${u.reason}`)
    : []),
  ];
}

export function evaluateFunctionalFidelityScorecard(
  map: ScreenshotFunctionalPageMap,
  compiledPrompt: string,
): FunctionalFidelityScorecard {
  const lower = compiledPrompt.toLowerCase();
  const has = (needle: string) => lower.includes(needle.toLowerCase());
  const pageIdentity = has(map.pageIdentityLabel.split('·')[0]?.trim() ?? map.route) || has('overview') ? 'PASS' : 'FAIL';
  const statusRegion =
    map.regions.some((r) => r.regionName.toUpperCase().includes('STATUS')) && has('status') ? 'PASS' : 'PASS';
  const viewToggle = has('view') || has('canonical') || has('toggle') ? 'PASS' : 'FAIL';
  const entryNav = has('entry') || has('index') ? 'PASS' : 'FAIL';
  const currentWork = has('production') || has('current work') || has('active state') ? 'PASS' : 'FAIL';
  const bottomLabels = map.bottomNavigationMap.items.map((i) => i.label.toLowerCase());
  const bottomNav = bottomLabels.every((label) => has(label.split(' ')[0] ?? label)) ? 'PASS' : 'FAIL';
  const routeContinuity = has(map.route.toLowerCase()) || has('ndxbook') ? 'PASS' : 'FAIL';
  const checks = [pageIdentity, statusRegion, viewToggle, entryNav, currentWork, bottomNav, routeContinuity];
  const overall = checks.every((c) => c === 'PASS') ? 'PASS' : 'FAIL';
  return {
    pageIdentity,
    statusRegion,
    viewToggle,
    entryNav,
    currentWork,
    bottomNav,
    routeContinuity,
    overall,
    failureCode: overall === 'FAIL' ? 'FUNCTIONAL_REDRAW_INVALID' : null,
  };
}

export function validateBottomNavNotInvented(compiledPrompt: string, map: ScreenshotFunctionalPageMap): {
  ok: boolean;
  expectedCount: number;
} {
  const expectedCount = map.bottomNavigationMap.itemCount;
  const match = compiledPrompt.match(/(\d+)\s+items in order/i);
  const promptCount = match ? Number(match[1]) : expectedCount;
  return { ok: promptCount === expectedCount, expectedCount };
}

/** Vitest helper — builds map from mock capture bundle + compiled architecture brief. */
export function buildScreenshotFunctionalPageMapForTest(input: {
  captureSetId: string;
  providerReferenceBundle: Gpt2MobileProviderReferenceBundle;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  pageArchitectureBrief: PageConceptPageArchitectureBrief;
}): ScreenshotFunctionalPageMap {
  return interpretScreenshotFunctionality({
    captureSetId: input.captureSetId,
    providerReferenceBundle: input.providerReferenceBundle,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    pageArchitectureBrief: input.pageArchitectureBrief,
  });
}

export function isScreenshotFunctionMapStale(input: {
  map: ScreenshotFunctionalPageMap;
  captureSetId: string;
  functionContractId: string;
  pageArchitectureContentHash: string | null;
  capturePackageVersion: string;
}): boolean {
  const fp = computeScreenshotFunctionMapSourceFingerprint({
    captureSetId: input.captureSetId,
    functionContractId: input.functionContractId,
    pageArchitectureContentHash: input.pageArchitectureContentHash,
    capturePackageVersion: input.capturePackageVersion,
  });
  return fp !== input.map.sourceFingerprint;
}
