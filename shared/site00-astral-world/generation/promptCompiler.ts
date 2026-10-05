/**
 * P0.E.FT4 — Prompt compiler: master contract + asset contract + reference context.
 */

import { createHash } from 'node:crypto';
import type { VisualAssetContract } from './types.js';
import { ASTRAL_MASTER_VISUAL_CONTRACT_V1 } from './masterVisualContract.js';
import {
  ARTIFACT_PROMPT_BODIES,
} from './artifactContracts.js';
import { ENVIRONMENT_PROMPT_BODIES } from './environmentContracts.js';
import {
  compileFriendAvatarPrompt,
  compileReaderPortraitPrompt,
  type PortraitPromptVars,
} from './portraitContracts.js';
import type { CanonicalScreenMaster } from '../screen-masters/types.js';

export type ScreenBoundPromptContext = {
  screenMaster: CanonicalScreenMaster;
  assetRole?: string;
  compositionRequirements?: string[];
};

export type CompiledAstralPrompt = {
  promptText: string;
  promptHash: string;
  promptVersion: string;
  negativeConstraints: string[];
  screenMasterId?: string;
  screenMasterVersion?: number;
};

function bodyForContract(contract: VisualAssetContract, vars?: PortraitPromptVars): string {
  if (contract.promptTemplateId === 'READER_PROFILE_PORTRAIT') {
    return compileReaderPortraitPrompt(vars ?? {});
  }
  if (contract.promptTemplateId === 'FRIEND_AVATAR') {
    return compileFriendAvatarPrompt(vars ?? {});
  }
  return (
    ENVIRONMENT_PROMPT_BODIES[contract.promptTemplateId]
    ?? ENVIRONMENT_PROMPT_BODIES[contract.assetKey]
    ?? ARTIFACT_PROMPT_BODIES[contract.promptTemplateId]
    ?? ARTIFACT_PROMPT_BODIES[contract.assetKey]
    ?? `Generate ${contract.assetKey} for Astral World.`
  );
}

export function compileAstralPrompt(
  contract: VisualAssetContract,
  vars?: PortraitPromptVars,
  screenContext?: ScreenBoundPromptContext,
): CompiledAstralPrompt {
  const assetBody = bodyForContract(contract, vars);
  const referenceContext = contract.referenceSources.length
    ? `REFERENCE CONTEXT: Use attached reference images as visual authority for atmosphere, palette, composition, and destination identity. Generate the WORLD behind the UI — not the UI itself.\nSources: ${contract.referenceSources.join(', ')}`
    : 'REFERENCE CONTEXT: Follow Astral World master visual contract.';

  const screenBlock = screenContext
    ? [
        `CANONICAL SCREEN: ${screenContext.screenMaster.screenId} v${screenContext.screenMaster.version}`,
        `SCREEN ROUTE: ${screenContext.screenMaster.route}`,
        `RECONSTRUCT THIS EXACT SCREEN. Match the attached canonical screen master composition.`,
        `Preserve camera, geometry, subject/object positions, lighting, palette, and spatial hierarchy.`,
        `Do not redesign. Do not add new objects. Do not remove meaningful objects.`,
        screenContext.assetRole ? `ASSET ROLE ON SCREEN: ${screenContext.assetRole}` : '',
        ...(screenContext.compositionRequirements ?? []),
      ].filter(Boolean).join('\n')
    : '';

  const outputReq = `OUTPUT REQUIREMENTS: ${contract.aspectRatio} aspect ratio, minimum ${contract.widthTarget}x${contract.heightTarget}, environment-only clean artwork unless portrait contract. Safe zones: ${contract.safeZones.join(', ')}.`;

  const negative = `NEGATIVE CONSTRAINTS: ${contract.negativeConstraints.join('. ')}.`;

  const promptText = [
    ASTRAL_MASTER_VISUAL_CONTRACT_V1,
    `ASSET: ${contract.assetKey}`,
    `ROLE: ${contract.role}`,
    `SLOT: ${contract.targetSlot}`,
    screenBlock,
    referenceContext,
    assetBody,
    outputReq,
    negative,
  ].filter(Boolean).join('\n\n');

  const promptHash = createHash('sha256').update(promptText).digest('hex').slice(0, 16);

  return {
    promptText,
    promptHash,
    promptVersion: contract.promptVersion,
    negativeConstraints: contract.negativeConstraints,
    screenMasterId: screenContext?.screenMaster.screenId,
    screenMasterVersion: screenContext?.screenMaster.version,
  };
}
