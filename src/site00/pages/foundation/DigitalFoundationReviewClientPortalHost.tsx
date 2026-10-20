import { useCallback, useEffect, useState } from 'react';
import type { DfView } from '../../foundation-client/model';
import DigitalFoundationReviewClientPortalBody from './DigitalFoundationReviewClientPortalBody';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { DF_VIEW_ORDER } from '../../foundation-client/model';
import { DfReviewInertProvider } from '../../foundation-client/reviewInert';
import type { DfReviewEntry } from './digitalFoundationReviewRegistry';
import { useReviewPreviewState } from './DigitalFoundationReviewPreviewContext';

const PORTAL_TABS: { view: DfView; label: string }[] = [
  { view: 'OVERVIEW', label: 'OVERVIEW' },
  { view: 'ROADMAP', label: 'ROADMAP' },
  { view: 'NEEDS_YOU', label: 'NEEDS YOU' },
  { view: 'RECORDS', label: 'RECORDS' },
];

const OBJECT: DfObjectKind = 'crown';

const TAB_FOR: Partial<Record<DfView, DfView>> = { RECORD: 'RECORDS', STAGE: 'ROADMAP' };

/**
 * Navigable portal shell on a review fixture. The four areas stay reachable from every view; on a completed
 * fixture the overview also opens the completion milestone and the next threshold.
 */
export default function DigitalFoundationReviewClientPortalHost({
  entry,
  initialView = 'OVERVIEW',
}: {
  entry?: DfReviewEntry;
  initialView?: DfView;
}) {
  useReviewPreviewState();
  const [view, setView] = useState<DfView>(initialView);
  const [recordId, setRecordId] = useState<string | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const go = useCallback((next: DfView, rec?: string) => {
    setView(next);
    setRecordId(rec);
  }, []);

  const tab = TAB_FOR[view] ?? view;
  const menuViews: DfView[] = [...DF_VIEW_ORDER, 'ROADMAP', 'STAGE', 'NEEDS_YOU', 'RECORDS', 'COMM_PREFS'];
  if (entry?.fixtureContract === 'M_COMPLETE_CREDIT') menuViews.push('COMPLETE', 'LOCATION');

  return (
    <div className="df-review__portal-host" data-portal-view={view}>
      <p className="df-review__sim df-review__sim--inline">
        SIMULATED · CLIENT FOUNDATION PORTAL · {entry?.fixtureContract ?? 'J_PAYMENT_SUCCESS'}
      </p>
      <div className="df-review__portal-tabs" role="tablist" aria-label="Client portal areas">
        {PORTAL_TABS.map((t) => (
          <button
            key={t.view}
            type="button"
            role="tab"
            aria-selected={tab === t.view}
            className={`df-review__portal-tab${tab === t.view ? ' df-review__portal-tab--on' : ''}`}
            onClick={() => go(t.view)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <DfReviewInertProvider>
        <div className={`df-root${menuOpen ? ' df-root--menu-open' : ''}`}>
          <DfFrame view={view} object={OBJECT} onMenu={() => setMenuOpen((o) => !o)} menuOpen={menuOpen}>
            <DigitalFoundationReviewClientPortalBody view={view} entry={entry} recordId={recordId} onNavigate={go} />
          </DfFrame>
          <DfMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            views={menuViews}
            current={view}
            onNavigate={(v) => {
              setMenuOpen(false);
              go(v);
            }}
          />
        </div>
      </DfReviewInertProvider>
    </div>
  );
}
