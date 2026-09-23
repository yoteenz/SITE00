/**
 * P0.VR.CGPT-PAGE-ARCHITECTURE-HANDOFF1 — surgical page-specific CGPT → GPT2 contract.
 */

import type {
  PageConceptCgptCreativeBrief,
  PageCreativeContext,
  PageCreativeInjection,
  PageFunctionContract,
  ProjectCreativeContext,
} from './types.js';
import { translateFunctionContractToCreativeRequirements } from './pageConceptCgptCreativeSynthesis.js';
import { PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION } from './pageConceptGpt2MobilePageAuthority.js';

export const PAGE_ARCHITECTURE_BRIEF_VERSION = 'page-architecture-brief-v1-handoff';

export type PageArchitectureRegion = {
  regionId: string;
  title: string;
  obligations: readonly string[];
};

export type PageArchitectureHostShellMap = {
  hostOwns: readonly string[];
  projectOwns: readonly string[];
};

export type PageArchitectureNavigationContract = {
  topPageEntryNavigation: readonly string[];
  inPageNavigation: readonly string[];
  bottomNavigationContinuity: readonly string[];
};

export type PageArchitectureBottomContinuityContract = {
  contractId: string;
  sourceCaptureRole: string;
  regionRole: string;
  mustPersistVisual: readonly string[];
  mustPersistFunctional: readonly string[];
  mayAdapt: readonly string[];
  mustNotChange: readonly string[];
  scrollRelationship: string;
  projectNavigationRelationship: string;
  hostShellRelationship: string;
};

export type PageArchitectureAboveFoldContract = {
  firstViewportPurpose: string;
  firstViewportContent: string;
  firstViewportHierarchy: string;
  firstViewportNavigation: string;
  firstViewportInteraction: string;
  firstViewportForbidden: string;
};

export type PageArchitectureScrollNarrative = {
  open: string;
  earlyScroll: string;
  midPage: string;
  latePage: string;
  bottom: string;
};

export type PageArchitectureStructuralAnchors = {
  top: string;
  middle: string;
  bottom: string;
  nav: string;
  content: string;
  shell: string;
  project: string;
};

export type PageConceptPageArchitectureBrief = {
  briefId: string;
  version: string;
  contentHash: string;
  cgptCreativeBriefId: string;
  projectId: string;
  pageId: string;
  pageIdentity: {
    project: string;
    siteContext: string;
    moduleContext: string;
    page: string;
    pageRole: string;
    route: string;
    parentContext: string;
    childContext: string;
  };
  hostShellMap: PageArchitectureHostShellMap;
  mobileRegionMap: readonly PageArchitectureRegion[];
  navigationContract: PageArchitectureNavigationContract;
  bottomContinuityContract: PageArchitectureBottomContinuityContract;
  fixedRegions: readonly string[];
  creativeRegions: readonly string[];
  translatedPagePurpose: readonly string[];
  aboveFoldContract: PageArchitectureAboveFoldContract;
  mobileScrollNarrative: PageArchitectureScrollNarrative;
  structuralAnchors: PageArchitectureStructuralAnchors;
  regionMapVersion: string;
  navigationContractId: string;
  bottomContinuityContractId: string;
  scrollNarrativeId: string;
  createdAt: string;
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

function translateRawRequirementToPageDesign(raw: string): string {
  const t = raw.trim();
  const lower = t.toLowerCase();
  if (lower.includes('navigation') || lower.includes(' nav')) {
    return 'The page must include a persistent, visually legible project-navigation mechanism that clearly allows movement between this overview and deeper project content areas.';
  }
  if (lower.includes('primary-content') || lower.includes('primary content')) {
    return 'The first viewport must establish project identity and expose a clear path into active content entries without requiring the user to infer where content begins.';
  }
  if (lower.includes('hero')) {
    return 'The opening viewport must function as page entry (identity + orientation), not a decorative hero poster disconnected from navigation.';
  }
  if (lower.includes('footer')) {
    return 'The lower page must transition toward approved SITE 00 shell continuity — not a floating graphic ending.';
  }
  if (lower.includes('gallery') || lower.includes('entry')) {
    return 'Index/gallery entries must read as tappable navigation/content access points with real hierarchy — not decorative typography labels.';
  }
  if (lower.includes('authority-promote') || lower.includes('promote')) {
    return 'Authority/promotion affordances must appear as actionable page controls within the product frame — not campaign CTA styling.';
  }
  if (lower.includes('viewport-toggle')) {
    return 'Viewport controls remain host-owned shell affordances and must stay recognizable within the DESIGN workspace frame.';
  }
  return `Translate into page architecture: ${t.replace(/^founder\/user must access /i, 'The layout must make accessible ')}`;
}

function buildMobileRegionMap(input: {
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  brief: PageConceptCgptCreativeBrief | null;
  injection: PageCreativeInjection;
}): PageArchitectureRegion[] {
  const pageLabel = input.pageContext.pageName.toUpperCase();
  const entries = input.pageContext.requiredContent.filter(Boolean).slice(0, 6);
  const entryLines =
    entries.length > 0 ?
      entries.map((e, i) => `Entry/access ${String(i + 1).padStart(3, '0')}: ${e} — interactive navigation/content access, not decorative type only.`)
    : ['Structured index/access region — interactive rows or cards leading into project content.'];

  return [
    {
      regionId: 'REGION_01',
      title: 'PAGE ENTRY / PROJECT IDENTITY',
      obligations: [
        `${pageLabel} title and concise project descriptor visible above the fold.`,
        'Current context / project signal — no generic hero image poster.',
        input.brief?.creativePremise ?? input.injection.creativeThesis,
      ],
    },
    {
      regionId: 'REGION_02',
      title: 'PROJECT STATUS / OVERVIEW SIGNAL',
      obligations: [
        'Explain what the project is and what is active in human-readable terms.',
        'Concise structured overview — not a dashboard telemetry wall.',
        input.brief?.pagePurpose ?? input.injection.pagePurposeInterpretation,
      ],
    },
    {
      regionId: 'REGION_03',
      title: 'ENTRY / INDEX ACCESS',
      obligations: entryLines,
    },
    {
      regionId: 'REGION_04',
      title: 'EVIDENCE / CULTURAL SIGNAL',
      obligations: [
        'Archival/evidence plates support the page story — they do not consume the entire page.',
        input.injection.assetStrategy,
        input.brief?.imageryStrategy ?? input.injection.imageryStrategy ?? 'Evidence supports narrative.',
      ],
    },
    {
      regionId: 'REGION_05',
      title: 'CURRENT WORK / ACTIVE STATE',
      obligations: [
        'Human-readable creative/production activity for this page.',
        'Not raw system telemetry or debug labels.',
      ],
    },
    {
      regionId: 'REGION_06',
      title: 'PAGE ACTION / DEEPER ACCESS',
      obligations: [
        'Clear project-specific path into workflow/content.',
        'Not generic marketing CTA styling detached from navigation.',
      ],
    },
    {
      regionId: 'REGION_07',
      title: 'BOTTOM CONTINUITY SHELL',
      obligations: [
        'Preserve approved SITE 00 bottom shell continuity — visibly reconnects project page to parent DESIGN environment.',
        `Continuity strip reference: lower ${Math.round(PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION * 100)}% of capture when image attached.`,
      ],
    },
  ];
}

export function compilePageConceptPageArchitectureBrief(input: {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  injection: PageCreativeInjection;
  cgptCreativeBrief: PageConceptCgptCreativeBrief;
  captureSetId?: string | null;
}): PageConceptPageArchitectureBrief {
  const projectLabel = input.projectContext.projectId.toUpperCase();
  const pageLabel = input.pageContext.pageName.toUpperCase();
  const route = input.functionContract.route || input.pageContext.route;
  const childContext =
    input.pageContext.childPageIds.length > 0 ?
      input.pageContext.childPageIds.join(' · ')
    : `${projectLabel} entries / internal content areas`;

  const rawReqs = translateFunctionContractToCreativeRequirements({
    functionContract: input.functionContract,
    pageContext: input.pageContext,
  });
  const translatedPagePurpose = rawReqs.map(translateRawRequirementToPageDesign);

  const mobileRegionMap = buildMobileRegionMap({
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    brief: input.cgptCreativeBrief,
    injection: input.injection,
  });

  const navigationContractId = `nav-${input.functionContract.contractId}`;
  const bottomContinuityContractId = `bcc-${input.captureSetId ?? input.cgptCreativeBrief.briefId}`;
  const scrollNarrativeId = `scroll-${input.cgptCreativeBrief.briefId}`;
  const regionMapVersion = `${PAGE_ARCHITECTURE_BRIEF_VERSION}:${mobileRegionMap.length}`;

  const bottomContinuityContract: PageArchitectureBottomContinuityContract = {
    contractId: bottomContinuityContractId,
    sourceCaptureRole: 'MOBILE_FUNCTIONAL_CAPTURE_BOTTOM_STRIP',
    regionRole: 'SITE_00_HOST_SHELL_CONTINUITY_ANCHOR',
    mustPersistVisual: [
      'Lower shell chrome rhythm recognizable as SITE 00 DESIGN workspace parent.',
      'Bottom navigation/continuity strip alignment when reference image provided.',
    ],
    mustPersistFunctional: [
      'Return path to PROJECTS > DESIGN context must remain inferable from shell continuity.',
      'Do not remove host navigation affordances implied by continuity region.',
    ],
    mayAdapt: [
      'Subordinate tint/material within NDXBOOK skin inside content frame above continuity.',
      'Density of project content above the continuity strip.',
    ],
    mustNotChange: [
      'Route hierarchy and page role as overview/entry.',
      'Host-vs-project boundary at shell handoff.',
      'Continuity strip must not be replaced by decorative footer art.',
    ],
    scrollRelationship: 'Final scroll region must visually hand off into approved bottom continuity — not end on a poster plate.',
    projectNavigationRelationship: 'Continuity strip reconnects NDXBOOK page to parent DESIGN navigation mental model.',
    hostShellRelationship: 'SITE 00 owns shell continuity; NDXBOOK owns in-page composition above it.',
  };

  const payloadCore = {
    projectId: input.projectContext.projectId,
    pageId: input.pageContext.pageId,
    route,
    regionCount: mobileRegionMap.length,
    cgptBriefId: input.cgptCreativeBrief.briefId,
  };
  const briefId = `pab-${hashPayload(payloadCore)}`;

  const brief: PageConceptPageArchitectureBrief = {
    briefId,
    version: PAGE_ARCHITECTURE_BRIEF_VERSION,
    contentHash: hashPayload({ ...payloadCore, mobileRegionMap, navigationContractId }),
    cgptCreativeBriefId: input.cgptCreativeBrief.briefId,
    projectId: input.projectContext.projectId,
    pageId: input.pageContext.pageId,
    pageIdentity: {
      project: projectLabel,
      siteContext: 'SITE 00',
      moduleContext: 'PROJECTS > DESIGN',
      page: pageLabel,
      pageRole: input.pageContext.pageRole || `${pageLabel} / PROJECT OVERVIEW / ENTRY POINT`,
      route,
      parentContext: 'PROJECTS',
      childContext,
    },
    hostShellMap: {
      hostOwns: [
        'Global breadcrumb / project context',
        'Project-level navigation chrome',
        'Viewport controls (MOBILE / TABLET / DESKTOP) where shown',
        'Persistent shell controls and account/system affordances',
        'DESIGN workspace relationship to parent SITE 00 shell',
        'Approved bottom continuity / shell transition region',
      ],
      projectOwns: [
        `${projectLabel} page atmosphere and typography inside the page frame`,
        'Archival/evidence presentation and content composition',
        'Page-specific calls to action and internal navigation expression',
        'Project-owned index/entry presentation',
      ],
    },
    mobileRegionMap,
    navigationContract: {
      topPageEntryNavigation: [
        'Host: project context + DESIGN workspace tabs remain structurally present or implied at page top.',
        'Project: page title and overview identity owned by project page frame.',
        'Persistent: route context must read as real app navigation — not poster masthead only.',
      ],
      inPageNavigation: [
        ...input.functionContract.interactions.map(
          (i) => `Interaction "${i}": must render as usable tap target / control — not label-only decoration.`,
        ),
        'Entry/index rows must communicate destination — not static editorial type.',
      ],
      bottomNavigationContinuity: [
        'Approved bottom shell continuity strip (visual + functional).',
        'Must remain recognizable; cannot be redesigned into abstract footer graphic.',
        bottomContinuityContract.hostShellRelationship,
      ],
    },
    bottomContinuityContract,
    fixedRegions: [
      'Host shell elements and DESIGN workspace relationship',
      'Required navigation and route hierarchy',
      'Approved bottom continuity anchor',
      'Page-function obligations from contract',
      ...input.functionContract.immutableBehaviors.map((b) => `Immutable: ${b}`),
    ],
    creativeRegions: [
      'Page content composition and evidence placement',
      'Hierarchy inside content regions',
      'Typography relationships and density',
      'Image treatment and interaction presentation',
      'Project-specific visual rhythm (within architecture)',
      input.injection.creativeLatitude,
    ],
    translatedPagePurpose,
    aboveFoldContract: {
      firstViewportPurpose: `Establish ${projectLabel} ${pageLabel} inside SITE 00 > PROJECTS > DESIGN — not a brand poster.`,
      firstViewportContent: `Show project identity, overview signal, and where content/entries begin. ${input.cgptCreativeBrief.pagePurpose}`,
      firstViewportHierarchy: input.cgptCreativeBrief.hierarchyStrategy || input.injection.hierarchyDirection,
      firstViewportNavigation: 'Legible path to entries/deeper content without scrolling guesswork.',
      firstViewportInteraction: 'At least one obvious interactive/access pattern (entries, nav, or promote) — not decorative only.',
      firstViewportForbidden: 'Full-viewport decorative masthead, campaign graphic, or book-cover composition with no page structure.',
    },
    mobileScrollNarrative: {
      open: 'Orient: which project, which page, which module (SITE 00 DESIGN).',
      earlyScroll: 'Explain what this project/page is for using structured overview — not mood essay.',
      midPage: 'Expose entries, evidence, and current activity as page regions.',
      latePage: 'Deepen access toward workflow/content — still a page, not a poster tail.',
      bottom: 'Return/connect to SITE 00 shell continuity — approved bottom anchor.',
    },
    structuralAnchors: {
      top: 'Host context + page entry identity + overview signal.',
      middle: 'Entries, evidence, active state — scrollable page body.',
      bottom: 'Continuity shell + handoff to parent DESIGN environment.',
      nav: 'Persistent navigation mechanisms (host + project) remain legible.',
      content: 'Required modules/content from contract appear as interactable page elements.',
      shell: 'SITE 00 host shell and DESIGN workspace framing.',
      project: `${projectLabel} atmosphere, typography, and content inside the page frame.`,
    },
    regionMapVersion,
    navigationContractId,
    bottomContinuityContractId,
    scrollNarrativeId,
    createdAt: new Date().toISOString(),
  };

  return brief;
}

export type PageArchitectureBriefValidation = {
  ok: boolean;
  errorCode: 'PAGE_ARCHITECTURE_INCOMPLETE' | null;
  missingSections: string[];
};

export function validatePageArchitectureBrief(
  brief: PageConceptPageArchitectureBrief | null | undefined,
): PageArchitectureBriefValidation {
  const missingSections: string[] = [];
  if (!brief) {
    return { ok: false, errorCode: 'PAGE_ARCHITECTURE_INCOMPLETE', missingSections: ['brief'] };
  }
  if (!brief.pageIdentity.route.trim()) missingSections.push('pageIdentity.route');
  if (!brief.pageIdentity.siteContext.trim()) missingSections.push('pageIdentity.siteContext');
  if (brief.hostShellMap.hostOwns.length < 2 || brief.hostShellMap.projectOwns.length < 2) {
    missingSections.push('hostShellMap');
  }
  if (brief.mobileRegionMap.length < 5) missingSections.push('mobileRegionMap');
  if (brief.navigationContract.inPageNavigation.length < 1) missingSections.push('navigationContract');
  if (!brief.bottomContinuityContract.contractId) missingSections.push('bottomContinuityContract');
  if (!brief.aboveFoldContract.firstViewportPurpose.trim()) missingSections.push('aboveFoldContract');
  if (!brief.mobileScrollNarrative.open.trim()) missingSections.push('mobileScrollNarrative');
  if (brief.translatedPagePurpose.length < 1) missingSections.push('translatedPagePurpose');
  return {
    ok: missingSections.length === 0,
    errorCode: missingSections.length ? 'PAGE_ARCHITECTURE_INCOMPLETE' : null,
    missingSections,
  };
}

export function formatPageArchitectureBriefForGpt2Prompt(brief: PageConceptPageArchitectureBrief): string {
  const id = brief.pageIdentity;
  const regions = brief.mobileRegionMap
    .map((r) => `${r.regionId} — ${r.title}\n${r.obligations.map((o) => `  • ${o}`).join('\n')}`)
    .join('\n\n');

  return [
    '=== PAGE ARCHITECTURE BRIEF (BINDING — SAME FOR ALL A/B/C CONCEPTS) ===',
    '',
    'YOU ARE DESIGNING A REAL MOBILE WEBSITE/APPLICATION PAGE.',
    'YOU ARE NOT DESIGNING A BRAND POSTER, CAMPAIGN GRAPHIC, BOOK COVER, OR EDITORIAL ARTBOARD.',
    '',
    `PAGE: ${id.project} / ${id.page}`,
    `CONTEXT: ${id.siteContext} > ${id.moduleContext} > ${id.project} > ${id.page}`,
    `ROUTE: ${id.route}`,
    `PAGE ROLE: ${id.pageRole}`,
    '',
    'HOST OWNS (DO NOT COLLAPSE INTO ONE GRAPHIC):',
    ...brief.hostShellMap.hostOwns.map((h) => `- ${h}`),
    '',
    'PROJECT OWNS:',
    ...brief.hostShellMap.projectOwns.map((p) => `- ${p}`),
    '',
    'MOBILE VERTICAL REGION MAP:',
    regions,
    '',
    'NAVIGATION CONTRACT:',
    'TOP / PAGE ENTRY:',
    ...brief.navigationContract.topPageEntryNavigation.map((l) => `- ${l}`),
    'IN-PAGE:',
    ...brief.navigationContract.inPageNavigation.map((l) => `- ${l}`),
    'BOTTOM / CONTINUITY:',
    ...brief.navigationContract.bottomNavigationContinuity.map((l) => `- ${l}`),
    '',
    'BOTTOM CONTINUITY CONTRACT:',
    JSON.stringify(brief.bottomContinuityContract, null, 0),
    '',
    'FIXED — DO NOT REINTERPRET:',
    ...brief.fixedRegions.map((f) => `- ${f}`),
    '',
    'CREATIVE — GPT2 MAY INTERPRET WITHIN ARCHITECTURE:',
    ...brief.creativeRegions.map((c) => `- ${c}`),
    '',
    'TRANSLATED PAGE PURPOSE (DESIGN LANGUAGE):',
    ...brief.translatedPagePurpose.map((t) => `- ${t}`),
    '',
    'ABOVE-THE-FOLD CONTRACT:',
    JSON.stringify(brief.aboveFoldContract, null, 0),
    '',
    'MOBILE SCROLL NARRATIVE:',
    JSON.stringify(brief.mobileScrollNarrative, null, 0),
    '',
    'STRUCTURAL ANCHORS (TOP / MIDDLE / BOTTOM / NAV / CONTENT / SHELL / PROJECT):',
    JSON.stringify(brief.structuralAnchors, null, 0),
    '',
    `PAGE ARCHITECTURE BRIEF ID: ${brief.briefId}`,
    `REGION MAP VERSION: ${brief.regionMapVersion}`,
    `NAVIGATION CONTRACT ID: ${brief.navigationContractId}`,
    `BOTTOM CONTINUITY CONTRACT ID: ${brief.bottomContinuityContractId}`,
    `SCROLL NARRATIVE ID: ${brief.scrollNarrativeId}`,
    '',
    'CONCEPT TERRITORY (A/B/C) MAY VARY COMPOSITION/DENSITY/RHYTHM ONLY — NOT PAGE ARCHITECTURE.',
  ].join('\n');
}

export type PageArchitecturePostValidation = {
  ok: boolean;
  errorCode: 'PAGE_ARCHITECTURE_VALIDATION_FAILED' | null;
  failedChecks: string[];
};

/** Heuristic post-generation gate — contract + anti-poster rules (no vision model). */
export function evaluateGpt2MobilePageArchitectureValidity(input: {
  architectureBrief: PageConceptPageArchitectureBrief | null | undefined;
  promptIncludedArchitecture: boolean;
  posterDriftHeuristic?: boolean;
}): PageArchitecturePostValidation {
  const failedChecks: string[] = [];
  const archVal = validatePageArchitectureBrief(input.architectureBrief);
  if (!archVal.ok) failedChecks.push('architecture_brief_incomplete');
  if (!input.promptIncludedArchitecture) failedChecks.push('prompt_missing_architecture');
  if (input.posterDriftHeuristic === true) failedChecks.push('poster_like_output_heuristic');
  return {
    ok: failedChecks.length === 0,
    errorCode: failedChecks.length ? 'PAGE_ARCHITECTURE_VALIDATION_FAILED' : null,
    failedChecks,
  };
}

export function buildPageArchitectureFounderDebugLines(
  brief: PageConceptPageArchitectureBrief | null | undefined,
  validation: PageArchitecturePostValidation,
): string[] {
  if (!brief) {
    return ['PAGE ARCHITECTURE: MISSING', 'HOST SHELL CONTRACT: MISSING'];
  }
  const id = brief.pageIdentity;
  return [
    `PAGE: ${id.project} / ${id.page}`,
    `SITE CONTEXT: ${id.moduleContext.replace(' > ', ' / ')}`,
    'PAGE ARCHITECTURE: COMPLETE',
    'HOST SHELL CONTRACT: PRESENT',
    'NAVIGATION CONTRACT: PRESENT',
    'BOTTOM CONTINUITY: PRESENT',
    'ABOVE-FOLD CONTRACT: PRESENT',
    'SCROLL STORY: PRESENT',
    `PAGE ARCHITECTURE BRIEF ID: ${brief.briefId}`,
    `REGION MAP VERSION: ${brief.regionMapVersion}`,
    `PAGE VALIDITY EVALUATOR: ${validation.ok ? 'PASS' : validation.errorCode ?? 'FAIL'}`,
  ];
}
