/**
 * P0.VR.3G + P0.VR.3H — Complex page structural shell.
 */

import type { ReactNode } from 'react';
import { BracketHeading, EmptyState, PageIntro } from '../pages/Site00PagePrimitives';
import { Site00ExperiencePage } from './Site00ExperiencePage';

export type ComplexShellReviewFlag = 'CREATIVE_DIRECTION_REQUIRED' | 'FUNCTIONAL_REVIEW_REQUIRED' | null;

type Props = {
  pageClassName: string;
  pageLabel: string;
  title: string;
  subtitle?: string;
  reviewFlag: ComplexShellReviewFlag;
  primarySlot?: ReactNode;
  secondarySlot?: ReactNode;
};

export function Site00ComplexPageShell({
  pageClassName,
  pageLabel,
  title,
  subtitle,
  reviewFlag,
  primarySlot,
  secondarySlot,
}: Props) {
  return (
    <Site00ExperiencePage pageClassName={pageClassName} pageLabel={pageLabel}>
      <PageIntro
        title={<BracketHeading>{title}</BracketHeading>}
        subtitle={subtitle}
        body={
          reviewFlag === 'CREATIVE_DIRECTION_REQUIRED'
            ? 'CREATIVE DIRECTION REQUIRED — STRUCTURAL SHELL ONLY. NO AUTO ART DIRECTION.'
            : reviewFlag === 'FUNCTIONAL_REVIEW_REQUIRED'
              ? 'FUNCTIONAL REVIEW REQUIRED — WORKFLOW AND DATA CONTRACT PLACEHOLDER.'
              : 'STRUCTURAL SHELL — FOUNDER REVIEW BEFORE RELEASE.'
        }
      />
      <section className="site00-complex-shell__regions">
        <div className="site00-complex-shell__primary" data-region="PRIMARY">
          {primarySlot ?? (
            <EmptyState title="PRIMARY REGION PLACEHOLDER" body="Content and workflow slots reserved for founder-directed completion." />
          )}
        </div>
        {secondarySlot ? (
          <div className="site00-complex-shell__secondary" data-region="SECONDARY">
            {secondarySlot}
          </div>
        ) : null}
      </section>
    </Site00ExperiencePage>
  );
}
