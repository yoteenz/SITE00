/**
 * P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1
 */

import { useMemo, useState } from 'react';

import {
  buildPageFamilyInteractionReviewPresentation,
  filterInteractionReviewRows,
  type InteractionReviewGrouping,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyInteractionReviewPresentation.js';
import type { PageFamilyBlueprint } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import type { PageFamilyInteractionMap } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyInteractionMap.js';
import { DesignPageFamilyInteractionInspector } from './DesignPageFamilyInteractionInspector.js';

type Props = {
  blueprint: PageFamilyBlueprint | null;
  interactionMap: PageFamilyInteractionMap | null;
  onApprove?: () => void;
  onClose: () => void;
};

export function DesignPageFamilyInteractionMapReview({
  blueprint,
  interactionMap,
  onApprove,
  onClose,
}: Props) {
  const presentation = useMemo(
    () => buildPageFamilyInteractionReviewPresentation({ blueprint, interactionMap }),
    [blueprint, interactionMap],
  );
  const [grouping, setGrouping] = useState<InteractionReviewGrouping>('BY_PAGE');
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);

  if (!presentation) {
    return (
      <div className="tod-psr-interaction-review" data-testid="page-family-interaction-map-review">
        <p>INTERACTION MAP NOT COMPILED</p>
        <button type="button" onClick={onClose}>
          CLOSE
        </button>
      </div>
    );
  }

  const rows = filterInteractionReviewRows(presentation, grouping, expandedPageId);
  const selectedRecord =
    selectedInteractionId ?
      presentation.records.find((r) => r.interactionId === selectedInteractionId) ?? null
    : null;

  return (
    <div className="tod-psr-interaction-review" data-testid="page-family-interaction-map-review">
      <header className="tod-psr-interaction-review__head">
        <h2>INTERACTION MAP REVIEW</h2>
        <button type="button" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <p className="tod-psr-interaction-review__summary" data-testid="page-family-interaction-summary">
        {presentation.summary.total} TOTAL · {presentation.summary.mapped} MAPPED · {presentation.summary.inherited}{' '}
        INHERITED · {presentation.summary.pageSpecific} PAGE-SPECIFIC · {presentation.summary.unmapped} UNMAPPED ·
        EXPERIENCE {presentation.summary.experiencePatternCoverage}
      </p>

      <div className="tod-psr-interaction-review__groups">
        {(['BY_PAGE', 'BY_TYPE', 'BY_PATTERN', 'UNMAPPED', 'OVERRIDES'] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={grouping === g ? 'tod-psr__linkBtn tod-psr__linkBtn--active' : 'tod-psr__linkBtn'}
            onClick={() => {
              setGrouping(g);
              setExpandedPageId(null);
            }}
          >
            {g.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {grouping === 'BY_PAGE' ?
        <div data-testid="page-family-interaction-by-page">
          {presentation.byPage.map((page) => (
            <div key={page.pageId} className="tod-psr-interaction-review__page">
              <button
                type="button"
                className="tod-psr-card tod-psr-card--family"
                onClick={() => setExpandedPageId((cur) => (cur === page.pageId ? null : page.pageId))}
              >
                {page.pageName} · {page.total} INTERACTIONS · {page.mapped} MAPPED · {page.unmapped} UNMAPPED ·{' '}
                {page.inherited} INHERITED
              </button>
              {expandedPageId === page.pageId ?
                filterInteractionReviewRows(presentation, 'BY_PAGE', page.pageId).map((row) => (
                  <button
                    key={row.interactionId}
                    type="button"
                    className="tod-psr-card tod-psr-card--interaction"
                    data-testid={`page-family-interaction-row-${row.interactionId}`}
                    onClick={() => setSelectedInteractionId(row.interactionId)}
                  >
                    {row.controlLabel} · {row.actionType} → {row.destinationOrEffect} · PATTERN{' '}
                    {row.patternId ?? '—'} · STATUS {row.status}
                  </button>
                ))
              : null}
            </div>
          ))}
        </div>
      : (
        rows.map((row) => (
          <button
            key={row.interactionId}
            type="button"
            className="tod-psr-card tod-psr-card--interaction"
            onClick={() => setSelectedInteractionId(row.interactionId)}
          >
            {row.controlLabel} · {row.actionType} → {row.destinationOrEffect}
          </button>
        ))
      )}

      {presentation.readyForApproval && !presentation.approved && onApprove ?
        <button
          type="button"
          className="tod-psr__primary"
          data-testid="page-family-approve-interaction-map"
          onClick={onApprove}
        >
          APPROVE INTERACTION MAP
        </button>
      : null}

      {selectedRecord ?
        <DesignPageFamilyInteractionInspector
          record={selectedRecord}
          onClose={() => setSelectedInteractionId(null)}
        />
      : null}
    </div>
  );
}
