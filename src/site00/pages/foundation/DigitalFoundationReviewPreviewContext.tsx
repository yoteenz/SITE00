import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import type { ClientCatalogEntry } from '../../foundation-client/api';
import type { IntakeDraft } from '../../foundation-client/model';
import type { ReviewBootstrapBundle } from './digitalFoundationReviewBootstrap';

export type ReviewPreviewState = {
  dataSource: string;
  catalog: ClientCatalogEntry[] | null;
  config: DigitalFoundationCommercialConfig | null;
  quotePayload: ClientDigitalFoundationPayload | null;
  quoteToken: string;
  paidPayload: ClientDigitalFoundationPayload | null;
  paidToken: string;
  postIntakePayload: ClientDigitalFoundationPayload | null;
  proposalReadyPayload: ClientDigitalFoundationPayload | null;
  paymentFailurePayload: ClientDigitalFoundationPayload | null;
  completePayload: ClientDigitalFoundationPayload | null;
  completeToken: string;
  postIntakeFetchedAt: Date;
  draft: IntakeDraft;
  setDraft: Dispatch<SetStateAction<IntakeDraft>>;
  setQuotePayload: Dispatch<SetStateAction<ClientDigitalFoundationPayload | null>>;
  bootstrap: ReviewBootstrapBundle | null;
};

const Ctx = createContext<ReviewPreviewState | null>(null);

export function DigitalFoundationReviewPreviewProvider({
  value,
  children,
}: {
  value: ReviewPreviewState;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReviewPreviewState(): ReviewPreviewState {
  const v = useContext(Ctx);
  if (!v) throw new Error('Review preview state missing');
  return v;
}
