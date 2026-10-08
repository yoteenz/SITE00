/**
 * Development fixtures for previews and tests. DEMO DATA ONLY — every fixture carries fixture: 'DEMO_ONLY', and
 * delivery refuses any payload that carries it (provider.ts deliveryGuard / createDryRunEmailProvider).
 * Values echo the design-preview world (PREVIEW GUEST, $6,500 Safe to Spend) so reviewers recognise them as samples.
 */

import type { EmailPayload } from './provider.js';
import type { EmailId } from './types.js';

export const FIXTURE_MARK = 'DEMO_ONLY' as const;
export const FIXTURE_RECIPIENT = { userId: '00000000-0000-0000-0000-000000000000', email: 'preview.guest@example.com', emailVerified: true, firstName: 'Emma', timezone: 'UTC', locale: 'en-US' } as const;

const L = (route: string) => `https://example.com/production/jurnl/runtime/${route}`;

export const EMAIL_FIXTURES: Readonly<Record<string, { email: EmailId; payload: EmailPayload }>> = {
  FX_WELCOME: { email: 'A01', payload: { fixture: FIXTURE_MARK, state: 'SETUP_NOT_STARTED', values: { firstName: 'Emma' }, links: { setupUrl: L('setup') } } },
  FX_VERIFY: { email: 'A02', payload: { fixture: FIXTURE_MARK, state: 'FIRST_SEND', values: { recipientEmail: 'preview.guest@example.com', linkExpiry: 'in 24 hours' }, links: { confirmationUrl: L('entry/verify-email?link=valid') } } },
  FX_FINISH_SETUP: {
    email: 'A03',
    payload: { fixture: FIXTURE_MARK, state: 'EARLY', values: { firstName: 'Emma', remainingSteps: [{ title: 'INCOME' }, { title: 'COMMITMENTS' }, { title: 'PRIORITIES' }, { title: 'BOUNDARIES' }], resumeAt: 'F02.04' }, links: { setupUrl: L('setup') } },
  },
  FX_STS_READY: { email: 'A04', payload: { fixture: FIXTURE_MARK, state: 'READY', asOf: 'OCT 8', values: { firstName: 'Emma', safeToSpend: '$6,500', availableThrough: 'OCT 18', currency: 'USD' }, links: { safeWhyUrl: L('safe/why'), todayUrl: L('today') } } },
  FX_WEEKLY_BRIEF: {
    email: 'A05',
    payload: {
      fixture: FIXTURE_MARK,
      state: 'HEALTHY',
      asOf: 'OCT 8',
      values: {
        firstName: 'Emma',
        weekOf: 'OCT 6',
        safeToSpend: '$6,500',
        availableThrough: 'OCT 18',
        upcomingItems: [{ name: 'RENT', date: 'THU', amount: '$1,800' }, { name: 'GROCERIES', date: 'FRI', amount: '$120' }],
        movedItems: [{ name: 'ATELIER', date: 'YESTERDAY', amount: '$86' }, { name: 'MARKET', date: 'YESTERDAY', amount: '$42' }],
      },
      links: { todayUrl: L('today') },
    },
  },
  FX_PURCHASE_NUDGE: { email: 'A06', payload: { fixture: FIXTURE_MARK, state: 'CLOSE', values: { purchaseName: 'LINEN SOFA', purchaseAmount: '$1,400', category: 'HOME', affordability: 'CLOSE' }, links: { purchaseUrl: L('purchases/demo-purchase') } } },
  FX_MILESTONE: { email: 'A07', payload: { fixture: FIXTURE_MARK, state: 'GOAL_FUNDED', values: { firstName: 'Emma', goalName: 'LISBON IN SPRING', goalAmount: '$2,400', reachedOn: 'OCT 8' }, links: { goalUrl: L('goals/demo-goal') } } },
  FX_RESET: { email: 'A08', payload: { fixture: FIXTURE_MARK, state: 'REQUESTED', values: { recipientEmail: 'preview.guest@example.com', requestedAt: 'OCT 8, 9:41 AM UTC', linkExpiry: 'in 1 hour' }, links: { recoveryUrl: L('entry/new-password?token=preview') } } },
};

export const FIXTURE_RULES = [
  'Fixtures use example.com addresses and links only.',
  'Every fixture payload carries fixture: DEMO_ONLY; delivery refuses it.',
  'Fixture names and amounts never appear in production templates as defaults or fallbacks.',
] as const;
