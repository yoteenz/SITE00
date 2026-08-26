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

export type CompiledAstralPrompt = {
  promptText: string;
  promptHash: string;
  promptVersion: string;
  negativeConstraints: string[];
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
): CompiledAstralPrompt {
  const assetBody = bodyForContract(contract, vars);
  const referenceContext = contract.referenceSources.length
    ? `REFERENCE CONTEXT: Use attached reference images as visual authority for atmosphere, palette, composition, and destination identity. Generate the WORLD behind the UI — not the UI itself.\nSources: ${contract.referenceSources.join(', ')}`
    : 'REFERENCE CONTEXT: Follow Astral World master visual contract.';

  const outputReq = `OUTPUT REQUIREMENTS: ${contract.aspectRatio} aspect ratio, minimum ${contract.widthTarget}x${contract.heightTarget}, environment-only clean artwork unless portrait contract. Safe zones: ${contract.safeZones.join(', ')}.`;

  const negative = `NEGATIVE CONSTRAINTS: ${contract.negativeConstraints.join('. ')}.`;

  const promptText = [
    ASTRAL_MASTER_VISUAL_CONTRACT_V1,
    `ASSET: ${contract.assetKey}`,
    `ROLE: ${contract.role}`,
    `SLOT: ${contract.targetSlot}`,
    referenceContext,
    assetBody,
    outputReq,
    negative,
  ].join('\n\n');

  const promptHash = createHash('sha256').update(promptText).digest('hex').slice(0, 16);

  return {
    promptText,
    promptHash,
    promptVersion: contract.promptVersion,
    negativeConstraints: contract.negativeConstraints,
  };
}
