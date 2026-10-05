/**
 * Sprint B1 Phase 1 — close ENTRY 001 missing Expression Engine requirements.
 * No asset regeneration; completes TikTok plan, X expression, founder judgment exposure.
 */

import type {
  CreativeEntry,
  FounderJudgmentReadiness,
  TikTokTranslationPlan,
  XThreadExpression,
} from '../../../shared/site00-expression-engine/types.js';
import { runFormatNativeQA } from './formatNativeQA.js';
import {
  buildEntry001ProductionPlan,
  reconstructEntry001,
  resolveEntry001Objective,
} from './entry001Forensic.js';

export function buildEntry001TikTokTranslationPlan(): TikTokTranslationPlan {
  const qa = runFormatNativeQA({
    sourceFormat: 'REEL',
    targetFormat: 'TIKTOK',
    adaptationKind: 'REEDIT',
  });

  return {
    planId: 'tt-plan-entry-001',
    entryId: 'entry-001',
    adaptationDecision: 'REEDIT',
    adaptationRationale:
      'Existing Reel contains authoritative narrative (penthouse, channel surf, WE distortion, TV shutoff). TikTok requires faster hook and native pacing — achievable via re-edit of existing footage, not resize-only repost. REGENERATE not required unless re-edit fails FORMAT_NATIVE_QA.',
    openingHook:
      'Cold open on distorted anchor voice saying "WE owe Britney" — 0.0–1.5s before any establishing wide. Text overlay: WHO IS "WE"?',
    pacing: 'Hook-first; cut on beat every 1.5–2.5s; no cinematic linger from Reel opening',
    runtimeTargetSec: { min: 22, max: 34 },
    editStructure: [
      '0:00–0:02 — distorted broadcast VO hook (no penthouse establish)',
      '0:02–0:08 — rapid channel-surf montage (Food Network → news)',
      '0:08–0:14 — NDX reaction micro-beats + lime accent insert',
      '0:14–0:20 — TV shutoff + silence beat',
      '0:20–0:26 — phone transition + WHO TF IS WE? title',
      '0:26–0:30 — comment-bait end card: "who is we though?"',
    ],
    spokenReactionBehavior:
      'NDX internal reaction only — no explanatory VO; optional whisper "wait" on double-take',
    culturalReceiptBehavior:
      'On-screen receipt: clip of public apology discourse vs earlier ridicule headlines (text cards, not carousel repost)',
    commentResponsePotential:
      'End card question + pinned comment template inviting "we" examples; designed for stitch/duet reaction',
    assetReuseVsReedit: {
      reuseFromReel: ['penthouse plates', 'channel surf sequence', 'TV shutoff', 'phone transition', 'title card typography'],
      requiresReedit: ['hook reorder', 'pacing compression', 'caption-safe reframing', 'native TikTok sound bed mix'],
    },
    captionBehavior:
      'Short provocative caption — not Instagram carousel copy. Example lead: "everyone says WE owe her an apology. cool. who is WE?"',
    thesisPreserved: true,
    status: 'PRODUCTION_READY',
  };
}

export function buildEntry001XThreadExpression(): XThreadExpression {
  return {
    expressionId: 'x-expr-entry-001',
    entryId: 'entry-001',
    thesis: 'WHO TF IS WE? — challenges collective pronoun in Britney discourse',
    beats: [
      {
        beat: 'DROP',
        copy:
          'everyone suddenly agrees "WE owe Britney an apology."\n\nok but WHO is "WE"?',
        mediaBehavior: 'Single stark text card — no carousel image repost',
      },
      {
        beat: 'JOKE',
        copy:
          'the same internet that called her crazy for a decade now talks like it was always on her side.\n\ncollective amnesia is wild.',
        mediaBehavior: 'Screenshot-style receipt collage (headlines) — thread-native, not IG export',
      },
      {
        beat: 'RECEIPT',
        copy:
          'receipt thread:\n• tabloid ridicule era headlines\n• "#FreeBritney" pivot\n• post-conservatorship apology discourse\n\nsame audience. different costume.',
        mediaBehavior: 'Numbered receipt list — X-native typography, no square feed tile',
      },
      {
        beat: 'QUESTION',
        copy:
          'when people say "WE" failed Britney — who exactly?\n\nmedia? audiences? both?\n\ndid "WE" include the people laughing?',
        mediaBehavior: 'Plain text question stack — engagement via quote-tweet replies',
      },
      {
        beat: 'SYNTHESIS',
        copy:
          'maybe the problem isn\'t only what happened to her.\n\nmaybe it\'s how "WE" lets itself rewrite participation as sympathy after the fact.',
        mediaBehavior: 'Synthesis text only — thesis preserved, no caption paste from Instagram',
      },
      {
        beat: 'BREADCRUMB',
        copy: 'ENTRY 001 — WHO TF IS WE? → NDXBOOK',
        mediaBehavior: 'Link to entry filing / highlight — breadcrumb not CTA spam',
      },
    ],
    status: 'COMPLETE',
  };
}

const ENTRY_001_JUDGMENT_SCOPES: Array<{ scope: FounderJudgmentReadiness['scope']; scopeId: string }> = [
  { scope: 'ENTRY', scopeId: 'entry-001' },
  { scope: 'REEL', scopeId: 'format-reel' },
  { scope: 'CAROUSEL', scopeId: 'format-carousel' },
  { scope: 'STORY', scopeId: 'format-story' },
  { scope: 'CTA_STORY', scopeId: 'format-cta-story' },
  { scope: 'COVER', scopeId: 'format-cover' },
  { scope: 'HIGHLIGHT', scopeId: 'format-highlight' },
  { scope: 'TIKTOK', scopeId: 'format-tiktok' },
  { scope: 'X', scopeId: 'format-x' },
];

export function exposeEntry001FounderJudgmentReadiness(
  entry?: CreativeEntry,
): FounderJudgmentReadiness[] {
  const base = entry ?? reconstructEntry001();
  return ENTRY_001_JUDGMENT_SCOPES.map(({ scope, scopeId }) => {
    const recorded = base.founderJudgments.find(
      (j) => j.scopeId === scopeId || (scope === 'ENTRY' && j.scope === 'ENTRY'),
    );
    return {
      scope,
      scopeId,
      state: recorded?.action ?? 'UNREVIEWED',
      explicitRecord: Boolean(recorded),
    };
  });
}

export function closeEntry001Phase1(): {
  entry: CreativeEntry;
  tiktokPlan: TikTokTranslationPlan;
  xExpression: XThreadExpression;
  founderJudgmentReadiness: FounderJudgmentReadiness[];
} {
  const tiktokPlan = buildEntry001TikTokTranslationPlan();
  const xExpression = buildEntry001XThreadExpression();
  const base = reconstructEntry001();

  const platformTranslations = base.platformTranslations.map((t) => {
    if (t.platform === 'TIKTOK') {
      return {
        ...t,
        mode: tiktokPlan.adaptationDecision,
        targetBehavior: 'Native TikTok re-edit — faster hook, comment-response potential',
        requirements: [
          'NOT automatic reel repost',
          tiktokPlan.openingHook,
          `runtime ${tiktokPlan.runtimeTargetSec.min}-${tiktokPlan.runtimeTargetSec.max}s`,
        ],
        status: 'COMPLETE' as const,
      };
    }
    if (t.platform === 'X') {
      return {
        ...t,
        mode: 'REWRITE' as const,
        targetBehavior: 'DROP→JOKE→RECEIPT→QUESTION→SYNTHESIS→BREADCRUMB thread complete',
        requirements: xExpression.beats.map((b) => b.beat),
        status: 'COMPLETE' as const,
      };
    }
    return t;
  });

  const formatExpressions = base.formatExpressions.map((f) => {
    if (f.format === 'TIKTOK') return { ...f, status: 'PLANNED' as const };
    if (f.format === 'X') return { ...f, status: 'PLANNED' as const };
    return f;
  });

  const productionPlan = buildEntry001ProductionPlan();
  const updatedTasks = productionPlan.tasks.map((t) => {
    if (t.format === 'TIKTOK') {
      return {
        ...t,
        description: 'TikTok-native re-edit per tt-plan-entry-001',
        status: 'PLANNED' as const,
        authoritativeReferences: ['legacy-reel-001-manual', 'tt-plan-entry-001'],
      };
    }
    if (t.format === 'X') {
      return {
        ...t,
        description: 'X thread expression x-expr-entry-001 — 6-beat native thread',
        status: 'PLANNED' as const,
        authoritativeReferences: ['x-expr-entry-001'],
      };
    }
    return t;
  });

  const entry: CreativeEntry = {
    ...base,
    formatExpressions,
    platformTranslations,
    productionPlan: { ...productionPlan, tasks: updatedTasks },
    founderJudgments: [],
    metadata: {
      tiktokTranslationPlanId: tiktokPlan.planId,
      xThreadExpressionId: xExpression.expressionId,
      sprint: 'B1_PHASE_1',
    } as never,
    updatedAt: new Date().toISOString(),
  };

  return {
    entry,
    tiktokPlan,
    xExpression,
    founderJudgmentReadiness: exposeEntry001FounderJudgmentReadiness(entry),
  };
}

export function entry001TikTokIsReeditNotRepost(): boolean {
  const plan = buildEntry001TikTokTranslationPlan();
  return plan.adaptationDecision === 'REEDIT' && plan.status === 'PRODUCTION_READY';
}
