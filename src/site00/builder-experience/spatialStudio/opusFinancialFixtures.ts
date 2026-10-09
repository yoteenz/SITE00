import { createPlatformBooks } from '../../../studioos/platform-economics/books';
import { CLIENT_ACCOUNT_FINANCIAL_CONTRACT, FINANCIAL_GATES, STATEMENT_INTERACTIONS } from '../../../studioos/platform-economics/clientExperience';
import { clientStatement } from '../../../studioos/platform-economics/clientStatement';
import { ELIGIBILITY_CONTRACT_NOTES } from '../../../studioos/platform-economics/illustration';
import { LIVE_MONEY_MOVEMENT } from '../../../studioos/platform-economics/processor';
import type { PlatformActor } from '../../../studioos/platform-economics/types';
import { blueprintEconomicsForSelection } from './blueprintEconomics';
import { spatialSelectionToBuilder } from './mapping';
import { emptySpatialState } from './types';

const client: PlatformActor = { actorId: 'client-a', role: 'CLIENT_OWNER', clientOrgId: 'org-a' };

/** Fixture data for the Opus visual pass. Numbers come from the economics engine at call time. */
export function buildOpusFinancialFixtures() {
  const shop = spatialSelectionToBuilder({
    ...emptySpatialState(),
    placePath: 'ADVANCED',
    feelVibe: 'MODERN',
    workModules: ['PAGES', 'SHOP'],
    pace: 'STANDARD',
  });
  const pages = spatialSelectionToBuilder({
    ...emptySpatialState(),
    placePath: 'SIMPLE',
    feelVibe: 'EDITORIAL',
    workModules: ['PAGES'],
    pace: 'STANDARD',
  });
  const books = createPlatformBooks();
  const created = books.createAgreement({
    projectId: 'project-a',
    clientOrgId: 'org-a',
    currency: 'USD',
    platformFeeApplicable: true,
    coveredTransactionTypes: ['ECOMMERCE'],
  });
  if (!created.ok) throw new Error(created.code);
  books.activate(created.agreement.agreementId, { author: 'founder', at: '2026-04-01T00:00:00.000Z' });
  books.ingestCapture({
    agreementId: created.agreement.agreementId,
    sourceTransactionId: 'example-sale',
    transactionType: 'ECOMMERCE',
    currency: 'USD',
    components: [
      { code: 'SERVICE', minor: 10_000 },
      { code: 'TAX', minor: 800 },
    ],
    processorFeeMinor: 290,
    processorEventId: 'example-evt',
    occurredAt: '2026-04-04T00:00:00.000Z',
  });
  const statement = clientStatement(books, {
    projectId: 'project-a',
    periodStart: '2026-04-01T00:00:00.000Z',
    periodEnd: '2026-04-30T00:00:00.000Z',
    actor: client,
  });
  if (!statement.ok) throw new Error(statement.code);
  const empty = clientStatement(books, {
    projectId: 'project-a',
    periodStart: '2026-03-01T00:00:00.000Z',
    periodEnd: '2026-03-31T00:00:00.000Z',
    actor: client,
  });
  if (!empty.ok) throw new Error(empty.code);
  return {
    label: 'OPUS_FIXTURE' as const,
    notClientHistory: true as const,
    blueprintWithCommerce: blueprintEconomicsForSelection(shop, '$17,000–$22,000'),
    blueprintWithoutCommerce: blueprintEconomicsForSelection(pages, '$6,000–$7,000'),
    postedStatement: statement,
    emptyPeriod: empty,
    denied: { ok: false as const, code: 'FORBIDDEN' as const },
    account: CLIENT_ACCOUNT_FINANCIAL_CONTRACT,
    interactions: STATEMENT_INTERACTIONS,
    eligibilityNotes: ELIGIBILITY_CONTRACT_NOTES,
    gates: FINANCIAL_GATES,
    liveMoneyMovement: LIVE_MONEY_MOVEMENT,
  };
}
