/**
 * SITE 00 FAMILY PRODUCTION CONTRACT (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * Project-agnostic. A "family" is one product area of an ingested project (JURNL F01 ENTRY is the first proof
 * case). The contract carries everything a family needs to move from authority to implementation to founder
 * approval — screens alone never complete a family (SCREEN_COMPLETE != FAMILY_COMPLETE).
 *
 * Nothing here knows about JURNL. Project data lives under shared/site00-projects-runtime/<project>/.
 */

import type { AssetClass, AssetPolicy } from './assetFirstPolicy.js';
import type { FamilyBudgetRecord, GenerationSettings } from './productionBudget.js';
import type { FamilyMonetization } from '../site00-monetization/contract.js';

export const FAMILY_PRODUCTION_CONTRACT_VERSION = 'SITE00.FAMILY_PRODUCTION_CONTRACT.V1' as const;

/** Founder authority states. Generated output is never approved by inference. */
export type FamilyApprovalStatus =
  | 'NOT_STARTED'
  | 'GENERATED'
  | 'IN_REVIEW'
  | 'IMPLEMENTATION_READY'
  | 'FOUNDER_APPROVED'
  | 'CANONICAL'
  | 'SUPERSEDED'
  | 'REJECTED';

export type FamilyImplementationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'LIVE_QA_PASSED' | 'FOUNDER_APPROVED';

export type FamilyQaStatus = 'NOT_RUN' | 'UNIT_PASS' | 'LIVE_PASS' | 'FAIL';

/** How loudly the project's brand speaks on the family's surfaces. */
export type BrandExpressionLevel = 'HERO' | 'EDITORIAL' | 'FUNCTIONAL' | 'SYSTEM';

export type FamilyScreenRole = 'PARENT' | 'CHILD' | 'GRANDCHILD';

export type FamilyScreenNode = {
  id: string;
  name: string;
  role: FamilyScreenRole;
  parentId: string | null;
  /** Route inside the project runtime (relative, e.g. `entry/create`). */
  runtimeRoute: string;
  /** Visual authority (reference only — never mounted as UI). */
  authorityFile: string | null;
  approvalStatus: FamilyApprovalStatus;
  implementationStatus: FamilyImplementationStatus;
  /** State ids this screen renders (keys into `states`). */
  stateIds: string[];
  /** Family boundary this screen hands off to (e.g. `F02`). */
  bridgeTo?: string;
};

export type FamilyStateAuthority = {
  id: string;
  label: string;
  screenId: string;
  /** Authority sheet that shows the state (reference only). */
  authorityFile: string | null;
  /** Runtime selector: `?state=<id>` on the screen route opens this state. */
  implemented: boolean;
};

export type FamilyInteractionType =
  | 'route_transition'
  | 'bottom_drawer'
  | 'full_screen_sheet'
  | 'modal'
  | 'inline'
  | 'inline_expansion'
  | 'toast_banner'
  | 'loading'
  | 'focus_input'
  | 'external_app_handoff'
  | 'native_os_handoff';

export type FamilyInteraction = {
  id: string;
  sourceScreen: string;
  trigger: string;
  type: FamilyInteractionType;
  componentRef: string;
  navigationResult: string;
  authorityFile: string;
  sharing: 'shared' | 'distinct' | 'shared_shell_distinct_content';
};

export type FamilyDataObject = {
  id: string;
  description: string;
  fields: string[];
  persistence: 'NONE' | 'SESSION' | 'DEVICE' | 'PROVIDER' | 'UNRESOLVED';
  notes?: string;
};

export type FamilyComponentRef = {
  id: string;
  scope: 'GLOBAL' | 'FAMILY';
  /** Host structural primitive the project expresses (project-scoped tokens, project-owned visuals). */
  primitive: string;
  description: string;
};

export type FamilyAssetRequirement = {
  id: string;
  assetClass: AssetClass;
  scope: 'GLOBAL_INHERITED' | 'FAMILY';
  status: 'CANONICAL' | 'CODE_CONSTRUCTED' | 'REFERENCE_ONLY' | 'MISSING' | 'NOT_CANONICAL';
  source: string;
  notes?: string;
};

export type FamilyIconRequirement = {
  id: string;
  label: string;
  variants: ('LINEAR' | 'FILLED')[];
  authorityFile: string;
  implementation: 'LIVE_CODE_SVG' | 'RASTER' | 'MISSING';
};

export type FamilyResponsiveTarget = { id: 'MOBILE' | 'TABLET' | 'DESKTOP'; width: number; height: number; primary: boolean; rule: string };

export type FamilyLineage = {
  parentAuthority: string;
  sourceSprints: string[];
  notes?: string;
};

export type FamilySupersession = {
  supersedes: string[];
  supersededBy: string | null;
  notes?: string;
};

export type FamilyProductionContract = {
  contractVersion: typeof FAMILY_PRODUCTION_CONTRACT_VERSION;
  familyId: string;
  familyName: string;
  projectId: string;
  purpose: string;
  parentScreen: string;
  screens: FamilyScreenNode[];
  states: FamilyStateAuthority[];
  interactions: FamilyInteraction[];
  dataObjects: FamilyDataObject[];
  globalComponents: FamilyComponentRef[];
  familyComponents: FamilyComponentRef[];
  globalAssets: FamilyAssetRequirement[];
  familyAssets: FamilyAssetRequirement[];
  iconRequirements: FamilyIconRequirement[];
  responsive: FamilyResponsiveTarget[];
  brandExpressionLevel: BrandExpressionLevel;
  generationSettings: GenerationSettings | null;
  generationBudget: FamilyBudgetRecord | null;
  assetPolicy: AssetPolicy;
  approvalStatus: FamilyApprovalStatus;
  implementationStatus: FamilyImplementationStatus;
  qaStatus: FamilyQaStatus;
  founderApproval: { approved: boolean; approvedAt: string | null; note: string };
  lineage: FamilyLineage;
  supersession: FamilySupersession;
  /** Named paths through the screen tree (screen ids in order). */
  journeys?: { id: string; label: string; path: string[] }[];
  /** Copy-claim substantiation summary (project keeps the full register). */
  claims?: { withheld: number; flagged: number; rule: string };
  /**
   * OPTIONAL monetization metadata (shared/site00-monetization). Non-monetized projects omit it; nothing in the gate
   * or completeness contract depends on it.
   */
  monetization?: FamilyMonetization;
};

/** Family monetization metadata, or null when the project does not monetize this family. */
export const familyMonetization = (c: FamilyProductionContract): FamilyMonetization | null => c.monetization ?? null;

export const childrenOf = (c: FamilyProductionContract) => c.screens.filter((s) => s.role === 'CHILD');
export const grandchildrenOf = (c: FamilyProductionContract) => c.screens.filter((s) => s.role === 'GRANDCHILD');
export const screenById = (c: FamilyProductionContract, id: string) => c.screens.find((s) => s.id === id) ?? null;
export const statesForScreen = (c: FamilyProductionContract, screenId: string) => c.states.filter((s) => s.screenId === screenId);
export const interactionsForScreen = (c: FamilyProductionContract, screenId: string) =>
  c.interactions.filter((i) => i.sourceScreen === screenId);
