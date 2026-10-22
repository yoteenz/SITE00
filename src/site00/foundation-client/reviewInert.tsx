/**
 * Review-mode guard. Inside `/foundation/review` every mutation (approve, request change, builder handoff,
 * save-for-later, founder task actions) is inert: the control renders, the request is never sent.
 */
import { createContext, useContext, type ReactNode } from 'react';

const DfReviewInertContext = createContext(false);

export function DfReviewInertProvider({ children }: { children: ReactNode }) {
  return <DfReviewInertContext.Provider value>{children}</DfReviewInertContext.Provider>;
}

export function useDfReviewInert(): boolean {
  return useContext(DfReviewInertContext);
}

export const DF_REVIEW_INERT_MESSAGE = 'REVIEW MODE — NOTHING WAS SENT.';
