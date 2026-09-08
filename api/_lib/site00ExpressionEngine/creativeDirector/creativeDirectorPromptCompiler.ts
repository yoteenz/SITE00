/**
 * C1.1 — Compile pass-specific reasoning prompts (structured, not one giant string).
 */

import type { MinimalCreativeBrief } from '../../../../shared/site00-expression-engine/creative-director/types.js';

export function compileCulturalReadTask(brief: MinimalCreativeBrief): Record<string, string> {
  return {
    task: 'CULTURAL_READ',
    subject: brief.subject,
    thesis: brief.thesis,
    brandTruth: brief.brandTruth,
    instruction: 'Identify surface topic, obvious take, underlying tension, hypocrisy, and why it matters now.',
  };
}

export function compileTerritoryGenerationTask(brief: MinimalCreativeBrief): Record<string, string> {
  return {
    task: 'CREATIVE_TERRITORIES',
    subject: brief.subject,
    thesis: brief.thesis,
    lineageAvoid: brief.priorEntryLineage.flatMap((e) => e.surfaceMechanismsToAvoid).join('; '),
    instruction: 'Generate 4-6 genuinely divergent territories — not aesthetic variants of one idea.',
  };
}

export function compileSelfCritiqueTask(brief: MinimalCreativeBrief): Record<string, string> {
  return {
    task: 'SELF_CRITIQUE',
    criticalQuestion: 'Would the founder have to come in and connect the dots?',
    antiOverfit: 'Do not assume phone, edit suite, broadcast, or Entry 002 surface mechanics.',
    instruction: 'Critique as senior creative director; diagnose failures for targeted revision.',
  };
}

export function compileNarrativeBridgeTask(brief: MinimalCreativeBrief, winningTerritory: string): Record<string, string> {
  return {
    task: 'NARRATIVE_SYNTHESIS_BRIDGE',
    entryId: brief.entryId,
    winningTerritory,
    instruction: 'Every beat must answer what happens, why now, what caused it, what changes.',
  };
}
