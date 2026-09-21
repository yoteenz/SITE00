/**
 * Project-native visual identity packages for page-concept GPT2 / NBP grounding.
 */

import type { PageCreativeContext, ProjectCreativeContext } from './types.js';
import { compileProjectCreativeContext } from './contextCompilers.js';

export type PageConceptVisualIdentitySection = {
  id: string;
  title: string;
  body: string;
  priority: number;
};

export type PageConceptProjectVisualIdentity = {
  projectId: string;
  projectType: string;
  coreVisualCharacter: readonly string[];
  palette: readonly string[];
  typography: readonly string[];
  materialImageLanguage: readonly string[];
  mandatoryBrandSignals: readonly string[];
  forbiddenDrift: readonly string[];
  sections: PageConceptVisualIdentitySection[];
};

const NDXBOOK_IDENTITY: PageConceptProjectVisualIdentity = {
  projectId: 'ndxbook',
  projectType: 'CULTURAL / CREATIVE INTELLIGENCE · ARCHIVAL / INVESTIGATIVE / EDITORIAL',
  coreVisualCharacter: [
    'Black / white editorial contrast with NDX lime accent authority',
    'Technical/editorial visual language · archival evidence · cultural observation',
    'Contemporary intelligence system · high contrast · strong typography',
    'Image-led storytelling · controlled asymmetry · deliberate grid disruption where appropriate',
    'Founder-owned cultural index / intelligence system — not a generic dashboard',
  ],
  palette: [
    'Near-black #050505',
    'Off-white / paper #F4F4F4',
    'NDX lime approximately #D8FF3E',
    'Project-specific supporting neutrals only — never warm beige dominance',
  ],
  typography: [
    'Technical / editorial pairing',
    'Condensed or display authority where established in NDXBOOK',
    'Mono / system language for host/meta layers',
    'Not generic SaaS typography',
  ],
  materialImageLanguage: [
    'Archival plate · paper grain · photographic evidence',
    'Ink / silhouette · cultural artifacts · investigative editorial imagery',
  ],
  mandatoryBrandSignals: [
    'NDXBOOK lime accent used with intent (not decorative noise)',
    'High-contrast editorial black/white field',
    'Cultural intelligence / index grammar',
    'Evidence-forward hierarchy',
  ],
  forbiddenDrift: [
    'Warm beige corporate dashboard',
    'Generic SaaS product page',
    'Lifestyle productivity app',
    'Ordinary admin card-grid interface',
    'Bookstore / reading tracker clichés',
    'Generic founder overview dashboard',
    'Copying stale implementation screenshot palette when it conflicts with NDX identity',
  ],
  sections: [],
};

function withSections(identity: PageConceptProjectVisualIdentity): PageConceptProjectVisualIdentity {
  const sections: PageConceptVisualIdentitySection[] = [
    { id: 'project-type', title: 'PROJECT TYPE', body: identity.projectType, priority: 1 },
    {
      id: 'core-character',
      title: 'CORE VISUAL CHARACTER',
      body: identity.coreVisualCharacter.join('\n'),
      priority: 1,
    },
    { id: 'palette', title: 'PALETTE', body: identity.palette.join('\n'), priority: 1 },
    {
      id: 'typography',
      title: 'TYPOGRAPHIC CHARACTER',
      body: identity.typography.join('\n'),
      priority: 2,
    },
    {
      id: 'materials',
      title: 'MATERIAL / IMAGE LANGUAGE',
      body: identity.materialImageLanguage.join('\n'),
      priority: 2,
    },
    {
      id: 'mandatory',
      title: 'MANDATORY BRAND SIGNALS',
      body: identity.mandatoryBrandSignals.join('\n'),
      priority: 1,
    },
    {
      id: 'forbidden',
      title: 'FORBIDDEN VISUAL DRIFT',
      body: identity.forbiddenDrift.join('\n'),
      priority: 1,
    },
  ];
  return { ...identity, sections };
}

export function resolvePageConceptProjectVisualIdentity(
  projectId: string,
): PageConceptProjectVisualIdentity | null {
  if (projectId === 'ndxbook') return withSections(NDXBOOK_IDENTITY);
  const ctx = compileProjectCreativeContext(projectId);
  if (!ctx) return null;
  return withSections({
    projectId,
    projectType: ctx.audience,
    coreVisualCharacter: [ctx.designLanguage, ctx.brandTruth, ctx.currentVisualSystem],
    palette: [ctx.palette],
    typography: [ctx.typography],
    materialImageLanguage: [ctx.materials, ctx.imagery],
    mandatoryBrandSignals: [ctx.brandTruth, ctx.brandPersonality],
    forbiddenDrift: [ctx.forbiddenPatterns],
    sections: [],
  });
}

export function projectIdentityFromContext(
  projectContext: ProjectCreativeContext,
  visualIdentity: PageConceptProjectVisualIdentity | null,
): Record<string, string> {
  return {
    projectId: projectContext.projectId,
    brandTruth: projectContext.brandTruth,
    brandPersonality: projectContext.brandPersonality,
    designLanguage: projectContext.designLanguage,
    creativeAppetite: projectContext.creativeAppetite,
    palette: projectContext.palette,
    typography: projectContext.typography,
    materials: projectContext.materials,
    imagery: projectContext.imagery,
    forbiddenPatterns: projectContext.forbiddenPatterns,
    visualIdentityProfile: visualIdentity ?
      JSON.stringify({
        projectType: visualIdentity.projectType,
        mandatoryBrandSignals: visualIdentity.mandatoryBrandSignals,
        forbiddenDrift: visualIdentity.forbiddenDrift,
      })
    : '',
  };
}

export function pageContextForGpt2Package(pageContext: PageCreativeContext): Record<string, string> {
  return {
    pageId: pageContext.pageId,
    pageName: pageContext.pageName,
    pageRole: pageContext.pageRole,
    route: pageContext.route,
    purpose: pageContext.purpose,
    requiredContent: pageContext.requiredContent.join(' · '),
    functionalRequirements: pageContext.functionalRequirements.join(' · '),
    creativeLatitude: pageContext.creativeLatitude,
    currentCaptureSummary:
      'FUNCTIONAL / STRUCTURAL CONTEXT ONLY — not aesthetic authority. Do not copy screenshot palette.',
    captureNote: pageContext.currentCaptureSummary,
  };
}
