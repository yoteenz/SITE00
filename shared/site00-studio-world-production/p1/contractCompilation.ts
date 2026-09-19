/**
 * P1 contract compilation — page-family + surface contracts from approved proof.
 */

import { createHash } from 'node:crypto';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import type { ExperienceImplementationContract } from '../../site00-brand-lore/experienceExpression/types.js';
import { compileDesignProofImplementationContract } from '../../site00-brand-lore/experienceExpression/designProofImplementationContract.js';
import { buildProjectWorkspaceCanon } from '../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import { heroProofInsufficientForSiteImplementation } from '../siteProductionLogic.js';
import type {
  PageFamilyImplementationContract,
  SiteSurfaceExperienceBrief,
  SiteSurfaceImplementationContract,
} from '../siteProductionTypes.js';
import { compileSurfaceExperienceBrief } from '../siteProductionLogic.js';
import { P1_CONTROLLED_ROUTE, P1_PAGE_FAMILY_ID } from './constants.js';
import { buildP1SiteMethodologyContext } from './siteMethodologySnapshot.js';

export type P1CompiledContracts = {
  designProofContract: ExperienceImplementationContract;
  pageFamilyContract: PageFamilyImplementationContract;
  surfaceExperienceBrief: SiteSurfaceExperienceBrief;
  surfaceContract: SiteSurfaceImplementationContract;
  contractFingerprint: string;
  stale: false;
};

function contractFingerprint(parts: unknown[]): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 16);
}

export function compileP1ContractsForProjectsIndex(params: {
  projectId: string;
  proof: SurfaceDesignProof;
  approvedProofsFingerprint: string;
}): P1CompiledContracts {
  if (heroProofInsufficientForSiteImplementation()) {
    // Enforced at compile time — page-family contract required alongside proof contract
  }

  const ctx = buildP1SiteMethodologyContext(params.projectId);
  const family = ctx.families.find((f) => f.familyId === P1_PAGE_FAMILY_ID)!;
  const page = ctx.inventory.surfaces.find((s) => s.route === P1_CONTROLLED_ROUTE)!;
  const workspaceCanon = buildProjectWorkspaceCanon();

  const designProofContract = compileDesignProofImplementationContract({
    proof: params.proof,
    workspaceCanon,
  });

  const fingerprints = {
    ...ctx.fingerprints,
    approvedProofsFingerprint: params.approvedProofsFingerprint,
    assetBindingsFingerprint: contractFingerprint(
      params.proof.generatedAssets.map((a) => a.requirementId),
    ),
  };

  const surfaceExperienceBrief = compileSurfaceExperienceBrief({
    projectId: params.projectId,
    page,
    strategy: ctx.strategy,
    family,
    functionalCanonFingerprint: ctx.functionalCanonFingerprint,
  });

  // Enrich brief with P1-required fields
  surfaceExperienceBrief.hostCanonFingerprint = ctx.hostCanonFingerprint;
  surfaceExperienceBrief.experienceDirectionId = params.proof.proofRecordId;

  const pageFamilyContract: PageFamilyImplementationContract = {
    id: `pfc-${P1_PAGE_FAMILY_ID}-${params.projectId}`,
    projectId: params.projectId,
    familyId: P1_PAGE_FAMILY_ID,
    familyPurpose: family.familyThesis,
    memberSurfaces: family.surfaceMembers,
    layoutGrammar: family.layoutGrammar,
    componentGrammar: {
      functionalRoles: [
        { roleId: 'active-piece', roleName: 'Active Piece', behaviorRules: ['Dominant focal region'], visualImplementationSeparate: true },
        { roleId: 'review-judgment', roleName: 'Review / Judgment', behaviorRules: ['Elevated review band'], visualImplementationSeparate: true },
        { roleId: 'work-cluster', roleName: 'Secondary Work Cluster', behaviorRules: ['Subordinate work items'], visualImplementationSeparate: true },
        { roleId: 'work-history', roleName: 'Work History', behaviorRules: ['Tertiary history strip'], visualImplementationSeparate: true },
      ],
    },
    responsiveTranslation: [family.responsivePhilosophy],
    interactionRules: family.interactionGrammar,
    contentBehavior: family.contentBehavior,
    designTokenOwnership: { host: 'HOST', client: 'CLIENT', shared: 'SHARED' },
    clientExpressionRules: family.clientExpressionBehavior,
    approvedFamilyProofIds: [params.proof.proofRecordId],
    assetBindings: params.proof.generatedAssets.map((a) => a.requirementId),
    functionalRequirements: page.functionalRequirements,
    accessibilityRequirements: family.accessibilityRequirements,
    doNotConstraints: [
      'Do not collapse asymmetric layout into generic cards',
      'Do not invent dark command center aesthetic',
      'Do not substitute approved assets with CSS',
      'Do not change Host Canon',
      'Composer is production engineer — not creative director',
      ...designProofContract.doNotConstraints,
    ],
    fingerprints,
    lifecycleState: 'READY',
    compiledAt: new Date().toISOString(),
  };

  const surfaceContract: SiteSurfaceImplementationContract = {
    id: `sc-${page.pageId}-${params.projectId}`,
    projectId: params.projectId,
    pageId: page.pageId,
    route: P1_CONTROLLED_ROUTE,
    pageFamilyContractId: pageFamilyContract.id,
    surfaceExperienceBriefId: surfaceExperienceBrief.id,
    functionalRequirements: page.functionalRequirements,
    contentDataRequirements: ['projects index payload', 'client studio projects', 'search filter state'],
    fingerprints,
    lifecycleState: 'READY',
    compiledAt: new Date().toISOString(),
  };

  const fp = contractFingerprint([
    pageFamilyContract.id,
    surfaceContract.id,
    designProofContract.contractId,
    fingerprints,
  ]);

  return {
    designProofContract,
    pageFamilyContract,
    surfaceExperienceBrief,
    surfaceContract,
    contractFingerprint: fp,
    stale: false,
  };
}

export function heroProofAloneCannotDispatchComposer(
  hasPageFamilyContract: boolean,
  hasSurfaceContract: boolean,
): boolean {
  return !hasPageFamilyContract || !hasSurfaceContract;
}
