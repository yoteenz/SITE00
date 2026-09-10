/**
 * P0.CGO.1 — Campaign World Genesis Engine.
 */

import type {
  CampaignWorldBible,
  CampaignWorldCandidate,
  WorldGenesisInput,
  WorldGenesisResult,
} from './types.js';
import { generateOriginalWorlds } from './worldCandidateTemplates.js';
import { checkCampaignGenerationGate } from '../../site00-brand-lore/brandCreativeContext/readiness.js';
import {
  buildForensicBilliardsBenchmark,
  buildWeakLuxuryBenchmark,
} from './forensicBenchmark.js';
import { compareYield } from './conceptualYieldScore.js';

export class CampaignWorldGenesisEngine {
  generateWorldCandidates(input: WorldGenesisInput): WorldGenesisResult {
    const gate = input.skipGenerationGate
      ? { allowed: true }
      : checkCampaignGenerationGate(input.brandContext ?? null);
    if (!gate.allowed) {
      return {
        brandSlug: input.brandSlug,
        candidates: [],
        safe: null,
        fresh: null,
        wildCard: null,
        weakBenchmark: buildWeakLuxuryBenchmark(),
      };
    }

    const candidates = generateOriginalWorlds({
      brandSlug: input.brandSlug,
      productCategory: input.productCategory,
      brandContext: input.brandContext ?? null,
    });

    candidates.sort((a, b) => compareYield(a.conceptualYield, b.conceptualYield));

    const safe = candidates.find((c) => c.tier === 'SAFE') ?? candidates[0] ?? null;
    const fresh = candidates.find((c) => c.tier === 'FRESH') ?? candidates[1] ?? null;
    const wildCard = candidates.find((c) => c.tier === 'WILD_CARD') ?? candidates[2] ?? null;

    return {
      brandSlug: input.brandSlug,
      candidates,
      safe,
      fresh,
      wildCard,
      weakBenchmark: buildWeakLuxuryBenchmark(),
    };
  }

  getForensicBenchmark(): CampaignWorldCandidate {
    return buildForensicBilliardsBenchmark();
  }

  compareForensicVsWeak(): {
    forensic: CampaignWorldCandidate;
    weak: CampaignWorldCandidate;
    yieldDelta: number;
    summary: string;
  } {
    const forensic = buildForensicBilliardsBenchmark();
    const weak = buildWeakLuxuryBenchmark();
    const delta = forensic.conceptualYield.overall - weak.conceptualYield.overall;
    return {
      forensic,
      weak,
      yieldDelta: delta,
      summary:
        delta > 0.3
          ? `Forensic high-yield world (${Math.round(forensic.conceptualYield.overall * 100)}%) clearly beats weak generic concept (${Math.round(weak.conceptualYield.overall * 100)}%)`
          : 'Yield comparison inconclusive',
    };
  }

  approveWorldToBible(input: {
    candidate: CampaignWorldCandidate;
    brandId: string;
    campaignId: string;
    brandContextVersion?: number;
  }): CampaignWorldBible {
    const c = input.candidate;
    const he = c.humanExpression;
    return {
      worldId: `world-${input.campaignId}-${Date.now()}`,
      campaignId: input.campaignId,
      brandId: input.brandId,
      brandContextVersion: input.brandContextVersion,
      conceptThesis: c.coreConcept,
      associationChain: c.associationChain,
      campaignTitleLanguage: c.campaignTitleLanguage,
      setting: c.setting,
      environmentRole: 'STORY_ENGINE',
      productRole: c.productIntegration[0] ?? 'CO_STAR',
      humanRole: he.hands.length ? 'HANDS_AND_PRESENCE' : 'CO_STAR',
      humanExpressionRules: he,
      motifs: c.motifs,
      propSystem: c.propSystem,
      stylingDirection: `Motifs: ${c.motifs.slice(0, 3).join(', ')}. Avoid generic editorial posing.`,
      hairDirection: he.hair.join('; ') || 'Incidental unless specified as hero surface',
      nailDirection: he.nails.join('; ') || 'Optional detail surface for motif propagation',
      makeupDirection: he.makeup.join('; ') || 'Support behavior — not beauty-portrait default',
      wardrobeDirection: he.wardrobe.join('; ') || 'Behavior-appropriate — not gown default',
      graphicLanguage: c.convergenceMap.dimensions.GRAPHIC_LANGUAGE ?? c.motifs.slice(0, 2).join(' + '),
      colorLogic: c.convergenceMap.dimensions.COLOR ?? 'Derived from setting materials',
      materialLogic: c.convergenceMap.dimensions.PROP_SYSTEM ?? c.propSystem.join(', '),
      motionLogic: c.convergenceMap.dimensions.MOTION ?? 'Behavior-led motion',
      copyBehavior: c.copyLanguage.length ? 'LOW — visual sequence leads' : 'MINIMAL',
      revealStrategy: 'PROGRESSIVE',
      sequenceGrammar: ['WORLD', 'CLUE', 'DETAIL', 'INTERACTION', 'REVEAL', 'PAYOFF'],
      nonNegotiables: [
        'Environment must act as story engine — not backdrop only',
        'No centered product in clue frames',
        'Behavior required — no static posing without purpose',
        ...c.motifs.slice(0, 2).map((m) => `Motif "${m}" must appear with variation`),
      ],
      avoidances: [
        'Generic editorial poses',
        'Product centered in every frame',
        'Studio polish in supposed organic world',
        'Copy explaining what visuals should show',
      ],
      approvedAt: new Date().toISOString(),
      approvalStage: 'WORLD',
    };
  }
}

export const campaignWorldGenesisEngine = new CampaignWorldGenesisEngine();
