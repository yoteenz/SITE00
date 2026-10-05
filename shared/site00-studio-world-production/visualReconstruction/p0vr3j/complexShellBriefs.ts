/**
 * P0.VR.3J — Complex composer draft shell review briefs.
 */

import { getActiveMissingPageCompletionPlan } from '../p0vr3h/repoScopedPlan.js';
import type { ComplexShellReviewBrief, ComposerDraftReadinessStatus } from './types.js';

const COMPLEX_BRIEFS: Record<string, Omit<ComplexShellReviewBrief, 'pageId' | 'route' | 'status'>> = {
  blueprints: {
    purpose: 'Creative hub for blueprint exploration and founder-directed layout zones.',
    entryExit: 'Entry from information nav (blocked in production); exit to guide or home.',
    knownWorkflow: 'Browse blueprint categories → inspect detail → return to hub.',
    familyCandidates: ['INFORMATION', 'CREATIVE_HUB'],
    requiredContentZones: ['hero', 'category grid', 'detail panel', 'CTA rail'],
    requiredStates: ['empty', 'populated', 'loading', 'error'],
    dependencies: ['Site00ExperiencePage shell', 'information family typography'],
    unknownCreativeDecisions: ['Final visual hierarchy', 'Blueprint card art direction', 'Motion grammar'],
    missingReferenceNeeds: ['Founder blueprint reference board', 'P0.VR.2 target compare set'],
    composerCreated: ['Route shell', 'Placeholder grid', 'Section headings'],
    placeholders: ['Blueprint cards', 'Hero imagery', 'Final copy blocks'],
    inherited: ['Site00ExperiencePage', 'Information family spacing tokens'],
    requiresFounderDirection: ['Visual direction', 'Content zones', 'Interaction model'],
  },
  'brand-page': {
    purpose: 'Brand identity and expression surface — creative direction required before release.',
    entryExit: 'Entry from brand nav (blocked); exit to home or account.',
    knownWorkflow: 'Review brand pillars → expression samples → export/contact CTA.',
    familyCandidates: ['IDENTITY', 'BRAND_EXPRESSION'],
    requiredContentZones: ['identity lockup', 'tone samples', 'color/type system', 'application gallery'],
    requiredStates: ['draft', 'review', 'approved-lock'],
    dependencies: ['Brand canon docs', 'Identity asset slots (P0.VR.2A)'],
    unknownCreativeDecisions: ['Final brand narrative', 'Gallery curation', 'Lockup treatment'],
    missingReferenceNeeds: ['Founder brand reference pack', 'Canonical NDX visual identity gate'],
    composerCreated: ['Shell layout', 'Placeholder zones', 'Section scaffold'],
    placeholders: ['Lockup assets', 'Gallery items', 'Final brand copy'],
    inherited: ['Site00ExperiencePage', 'Identity route family'],
    requiresFounderDirection: ['All visual/content decisions'],
  },
  'account-profile': {
    purpose: 'Account management — functional review required before release.',
    entryExit: 'Entry post-auth (blocked in production nav); exit to sign-in or home.',
    knownWorkflow: 'View profile → edit fields → security → sign out.',
    familyCandidates: ['ACCOUNT', 'AUTH'],
    requiredContentZones: ['profile summary', 'credentials', 'preferences', 'security'],
    requiredStates: ['signed-out-guard', 'loaded', 'editing', 'error', 'success'],
    dependencies: ['Supabase auth session', 'Account API bindings', 'Draft route guard'],
    unknownCreativeDecisions: ['Secondary account actions layout'],
    missingReferenceNeeds: ['Account UX reference (functional first)'],
    composerCreated: ['Account shell', 'Placeholder panels', 'Nav stubs'],
    placeholders: ['Live profile data binding', 'Security settings', 'Preference controls'],
    inherited: ['Auth experience patterns', 'Account route family'],
    requiresFounderDirection: ['Functional scope confirmation', 'Security requirements sign-off'],
  },
};

function resolveComplexStatus(pageId: string): ComposerDraftReadinessStatus {
  if (pageId === 'blueprints' || pageId === 'brand-page') return 'NEEDS_CREATIVE_DIRECTION';
  if (pageId === 'account-profile') return 'NEEDS_FUNCTIONAL_REVIEW';

  const plan = getActiveMissingPageCompletionPlan();
  const entry = plan.entries.find((e) => e.screenId.replace(/^missing-/, '') === pageId);
  if (entry?.functionalReviewRequired) return 'NEEDS_FUNCTIONAL_REVIEW';
  if (entry?.creativeDirectionRequired) return 'NEEDS_CREATIVE_DIRECTION';
  return 'IMPLEMENTED_DRAFT';
}

export function buildComplexShellReviewBriefs(): ComplexShellReviewBrief[] {
  const plan = getActiveMissingPageCompletionPlan();
  return plan.entries
    .filter(
      (e) =>
        e.projectId === 'SITE00' &&
        e.implementationStatus === 'IMPLEMENTED_DRAFT' &&
        (e.completionMode === 'CREATIVE_COMPLEX' ||
          e.completionMode === 'FUNCTIONAL_COMPLEX' ||
          e.completionMode === 'STRUCTURAL_COMPLEX'),
    )
    .map((entry) => {
      const pageId = entry.screenId.replace(/^missing-/, '');
      const template = COMPLEX_BRIEFS[pageId] ?? {
        purpose: entry.displayName,
        entryExit: 'TBD',
        knownWorkflow: 'TBD',
        familyCandidates: [entry.family],
        requiredContentZones: [],
        requiredStates: [],
        dependencies: [],
        unknownCreativeDecisions: ['Founder direction required'],
        missingReferenceNeeds: [],
        composerCreated: ['Shell only'],
        placeholders: ['All content zones'],
        inherited: ['Experience page shell'],
        requiresFounderDirection: ['Creative and functional scope'],
      };

      return {
        pageId,
        route: entry.route,
        status: resolveComplexStatus(pageId),
        ...template,
      };
    });
}

export function getComplexShellBrief(pageId: string): ComplexShellReviewBrief | null {
  return buildComplexShellReviewBriefs().find((b) => b.pageId === pageId) ?? null;
}
