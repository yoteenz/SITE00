/**
 * Project Workspace hero run types.
 */

import type { HeroFrameJudgment } from './constants.js';
import type { ProjectWorkspaceCanon } from './projectWorkspaceCanon.js';
import type { ClientProjectExpressionProfile } from './clientProjectExpressionProfile.js';
import type { HeroFrameAssetSubset } from './heroFrameAssetSubset.js';
import type { ProjectWorkspaceEnvironment } from './projectWorkspaceEnvironment.js';
import type { ExperienceAssetGenerationReceipt } from '../experienceExpression/assetGeneration.js';
import type { ExperienceProductionAsset } from '../experienceExpression/assetLifecycle.js';

export type NdxbookHeroFrameComposition = {
  compositionId: string;
  projectId: string;
  surface: 'PROJECT_HOME';
  deviceClass: 'DESKTOP';
  storagePath: string | null;
  publicUrl: string | null;
  workspaceRecognizable: true;
  clientRecognizable: true;
  artworkParticipates: true;
  activeSpecimenPresent: boolean;
  literalWorkshopBlocked: true;
  dossierLiteralizationBlocked: true;
  genericDashboardBlocked: true;
  composedAt: string | null;
};

export type ProjectWorkspaceHeroRun = {
  projectId: string;
  workspaceCanon: ProjectWorkspaceCanon;
  clientExpression: ClientProjectExpressionProfile;
  heroSubset: HeroFrameAssetSubset | null;
  environment: ProjectWorkspaceEnvironment | null;
  generatedAssets: ExperienceProductionAsset[];
  generationReceipts: ExperienceAssetGenerationReceipt[];
  heroComposition: NdxbookHeroFrameComposition | null;
  heroJudgment: HeroFrameJudgment;
  heroGenerated: boolean;
  generationStarted: boolean;
  accounting: {
    falRequests: number;
    estimatedCostUsd: number;
  };
  compiledAt: string;
};
