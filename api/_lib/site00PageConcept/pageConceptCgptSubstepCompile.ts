/**
 * P0.VR.PAGE-CONCEPT-CGPT-REAL-SUBSTEP-EMISSION1 — real CGPT prep checkpoints (no timers).
 */

import type { PageCgptInput } from './generatePageCreativeInjection.js';

export type PageConceptCgptSubstepDigest = {
  pageIntelligence: string;
  brandContext: string;
  keyMessages: string;
  visualMoodboard: string;
};

export function compilePageIntelligenceSlice(input: PageCgptInput): string {
  const page = input.pageContext;
  return [
    page.pageName,
    page.pageRole,
    page.purpose,
    `${page.requiredContent.length} required content lines`,
    `${page.functionalRequirements.length} functional reqs`,
  ].join(' · ');
}

export function compileBrandContextSlice(input: PageCgptInput): string {
  const project = input.projectContext;
  return [
    project.brandTruth,
    project.designLanguage,
    project.tone,
    project.projectConstraints ? 'constraints loaded' : 'no constraints',
  ].join(' · ');
}

export function compileKeyMessagesSlice(input: PageCgptInput): string {
  const page = input.pageContext;
  const contract = input.functionContract;
  return [
    page.requiredContent.slice(0, 3).join(' / ') || '—',
    `${contract.immutableBehaviors.length} immutable behaviors`,
    contract.version,
  ].join(' · ');
}

export function compileVisualMoodboardSlice(input: PageCgptInput): string {
  const page = input.pageContext;
  const project = input.projectContext;
  return [
    `${page.existingReferences.length} page refs`,
    `${project.approvedReferences.length} project refs`,
    page.currentCaptureSummary || 'capture summary pending',
  ].join(' · ');
}

export function compileAllCgptSubstepDigests(input: PageCgptInput): PageConceptCgptSubstepDigest {
  return {
    pageIntelligence: compilePageIntelligenceSlice(input),
    brandContext: compileBrandContextSlice(input),
    keyMessages: compileKeyMessagesSlice(input),
    visualMoodboard: compileVisualMoodboardSlice(input),
  };
}
