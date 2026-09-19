import type {
  ClientOpportunity,
  ClientOpportunityInterestSignal,
  ClientOpportunityType,
  ClientProjectPulse,
} from './types.js';

export type OpportunityEligibilityInput = {
  projectId: string;
  currentServices: string[];
  currentPhase: string;
  projectType: string;
  appState: string;
  attentionState: string;
  postLaunchState: boolean;
  liveDays: number | null;
  dismissedOffers: string[];
  purchasedServices: string[];
  hasCriticalIssue: boolean;
  hasOpenClientAction: boolean;
  clientSuppression: string[];
};

const OFFER_SERVICE_MAP: Record<string, string> = {
  MARKETING: 'MARKETING',
  'SITE CARE': 'SITE_CARE',
  SITE_CARE: 'SITE_CARE',
  EXPANSION: 'EXPANSION',
  REFRESH: 'REFRESH',
};

function serviceIncluded(services: string[], offer: string): boolean {
  const normalized = offer.toUpperCase();
  return services.some((s) => s.toUpperCase().includes(normalized.replace('_', ' ')) || s.toUpperCase() === normalized);
}

export function isOpportunitySuppressed(input: OpportunityEligibilityInput, offer: string): boolean {
  if (input.hasCriticalIssue) return true;
  if (input.dismissedOffers.includes(offer)) return true;
  const serviceKey = OFFER_SERVICE_MAP[offer.toUpperCase()] ?? offer.toUpperCase();
  if (serviceIncluded(input.purchasedServices, serviceKey)) return true;
  if (input.clientSuppression.includes(offer)) return true;
  return false;
}

export function buildEligibleOpportunities(input: OpportunityEligibilityInput): ClientOpportunity[] {
  const candidates: ClientOpportunity[] = [];
  const now = new Date().toISOString();

  if (!input.postLaunchState && !serviceIncluded(input.currentServices, 'MARKETING')) {
    if (!isOpportunitySuppressed(input, 'MARKETING')) {
      candidates.push({
        opportunityId: `opp-marketing-${input.projectId}`,
        projectId: input.projectId,
        opportunityType: 'IDLE_OPPORTUNITY',
        recommendedOffer: 'MARKETING',
        reason: 'Website project without marketing service',
        timing: 'WHILE_YOU_WAIT',
        priority: 2,
        surface: input.hasOpenClientAction ? 'IDLE' : 'HOME',
        message: 'See how SITE 00 could carry your new identity into launch.',
        cta: 'SEE WHAT MARKETING COULD LOOK LIKE',
        eligibility: true,
        suppressionState: 'NONE',
        createdAt: now,
      });
    }
  }

  if (input.postLaunchState && !serviceIncluded(input.currentServices, 'SITE_CARE')) {
    if (!isOpportunitySuppressed(input, 'SITE_CARE')) {
      candidates.push({
        opportunityId: `opp-site-care-${input.projectId}`,
        projectId: input.projectId,
        opportunityType: 'POST_LAUNCH_OPPORTUNITY',
        recommendedOffer: 'SITE CARE',
        reason: 'Live site without Site Care',
        timing: input.liveDays != null && input.liveDays >= 30 ? 'POST_30_DAYS' : 'POST_LAUNCH',
        priority: 3,
        surface: 'POST_LAUNCH',
        message: 'Keep your site maintained, monitored, and evolving after launch.',
        cta: 'EXPLORE SITE CARE',
        eligibility: true,
        suppressionState: 'NONE',
        createdAt: now,
      });
    }
  }

  if (input.postLaunchState && input.liveDays != null && input.liveDays >= 60 && !serviceIncluded(input.currentServices, 'MARKETING')) {
    if (!isOpportunitySuppressed(input, 'MARKETING')) {
      candidates.push({
        opportunityId: `opp-post-marketing-${input.projectId}`,
        projectId: input.projectId,
        opportunityType: 'POST_LAUNCH_OPPORTUNITY',
        recommendedOffer: 'MARKETING',
        reason: 'Post-launch marketing expansion',
        timing: 'POST_60_DAYS',
        priority: 4,
        surface: 'POST_LAUNCH',
        message: 'Extend your brand into ongoing marketing content.',
        cta: 'EXPLORE MARKETING',
        eligibility: true,
        suppressionState: 'NONE',
        createdAt: now,
      });
    }
  }

  return candidates.sort((a, b) => a.priority - b.priority);
}

export function selectPrimaryOpportunity(
  opportunities: ClientOpportunity[],
  pulse: Pick<ClientProjectPulse, 'nextForYou' | 'projectSignal'>,
): ClientOpportunity | null {
  if (pulse.nextForYou) return null;
  if (pulse.projectSignal === 'WAITING_ON_CLIENT') return null;
  const eligible = opportunities.filter((o) => o.eligibility && o.suppressionState === 'NONE');
  return eligible[0] ?? null;
}

export function recordOpportunityInterest(
  offer: string,
  signal: ClientOpportunityInterestSignal,
): { offer: string; signal: ClientOpportunityInterestSignal; recordedAt: string } {
  return { offer, signal, recordedAt: new Date().toISOString() };
}

export function opportunityTypeForOffer(offer: string): ClientOpportunityType {
  const key = offer.toUpperCase();
  if (key.includes('SITE CARE')) return 'SUPPORT_OPPORTUNITY';
  if (key.includes('MARKETING')) return 'SERVICE_OPPORTUNITY';
  if (key.includes('EXPANSION') || key.includes('REFRESH')) return 'EXPANSION_OPPORTUNITY';
  return 'PROJECT_OPPORTUNITY';
}
