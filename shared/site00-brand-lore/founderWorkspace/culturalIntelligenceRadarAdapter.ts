/**
 * Cultural Intelligence → Radar Room presentation adapter.
 */

import type { CulturalSignalPresentation } from '../../site00-studio-world-production/founderWorkspace/types.js';
import type { LiveCulturalIntelligenceRun, LiveWorldSignal } from '../../site00-studio-world-production/liveCulturalIntelligence/types.js';

function signalLeadLine(signal: LiveWorldSignal): string {
  if (signal.velocity >= 0.6 && signal.saturation < 0.7) return 'Pattern forming →';
  if (signal.lifecycleState === 'EMERGING') return 'Emerging conversation →';
  if (signal.lifecycleState === 'PEAKING') return 'At peak attention →';
  if (signal.audienceRelevance >= 0.7) return 'Audience relevance high →';
  return `${signal.lifecycleState.replace(/_/g, ' ').toLowerCase()} →`;
}

function signalCategory(signal: LiveWorldSignal): string {
  const domain = signal.domains[0];
  if (domain) return domain.replace(/_/g, ' ');
  return signal.signalType.replace(/_/g, ' ');
}

export function signalToPresentation(signal: LiveWorldSignal): CulturalSignalPresentation {
  const strength = Math.max(signal.velocity, signal.momentum, signal.audienceRelevance);
  return {
    id: signal.id,
    headline: signal.title,
    category: signalCategory(signal),
    leadLine: signalLeadLine(signal),
    strengthHint: strength >= 0.5 ? 'Strong' : strength >= 0.3 ? 'Moderate' : 'Watching',
    inspectScore: strength,
    attention: signal.velocity >= 0.6 ? 'READY_TO_REVIEW' : 'INFORMATIONAL',
  };
}

export function buildLiveSignalsPresentation(run: LiveCulturalIntelligenceRun | null): CulturalSignalPresentation[] {
  if (!run?.signals.length) return [];
  return [...run.signals]
    .sort((a, b) => b.velocity - a.velocity || b.audienceRelevance - a.audienceRelevance)
    .slice(0, 12)
    .map(signalToPresentation);
}

export function culturalIntelligenceInspectPayload(run: LiveCulturalIntelligenceRun | null): Record<string, unknown> {
  if (!run) return { status: 'NOT_STARTED' };
  return {
    status: run.status,
    signalCount: run.signals.length,
    sourceAdapters: run.sourceAdapters.map((a) => ({ provider: a.provider, status: a.status })),
    accounting: run.accounting,
    provingRunId: run.provingRunId ?? null,
    lastCheckedAt: run.lastCheckedAt,
  };
}
