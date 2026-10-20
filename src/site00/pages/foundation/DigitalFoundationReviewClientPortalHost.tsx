import { useCallback, useEffect, useState } from 'react';
import type { DfView } from '../../foundation-client/model';
import DigitalFoundationReviewClientPortalBody from './DigitalFoundationReviewClientPortalBody';
import { DfFrame, DfMenu, type DfObjectKind } from '../../foundation-client/shell';
import { DF_VIEW_ORDER } from '../../foundation-client/model';
import { reviewAnchorForView } from './reviewLinks';
import { scrollToReviewAnchor } from './reviewLinks';
import { useReviewPreviewState } from './DigitalFoundationReviewPreviewContext';

const PORTAL_TABS: { view: DfView; label: string }[] = [
  { view: 'OVERVIEW', label: 'OVERVIEW' },
  { view: 'ROADMAP', label: 'ROADMAP' },
  { view: 'NEEDS_YOU', label: 'NEEDS YOU' },
  { view: 'RECORDS', label: 'RECORDS' },
];

const OBJECT: DfObjectKind = 'crown';

function viewFromAnchor(anchorId: string): DfView {
  if (anchorId === 'df-r-client-portal') return 'OVERVIEW';
  const match = anchorId.match(/^df-r-([A-Z_]+)$/);
  const raw = match?.[1];
  if (raw && PORTAL_TABS.some((t) => t.view === raw)) return raw as DfView;
  return 'OVERVIEW';
}

export default function DigitalFoundationReviewClientPortalHost({ anchorId }: { anchorId: string }) {
  useReviewPreviewState();
  const [view, setView] = useState<DfView>(() => viewFromAnchor(anchorId));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setView(viewFromAnchor(anchorId));
  }, [anchorId]);

  const goTab = useCallback((next: DfView) => {
    setView(next);
    scrollToReviewAnchor(reviewAnchorForView(next));
  }, []);

  const body = <DigitalFoundationReviewClientPortalBody view={view} onNavigate={goTab} />;

  const menuViews = [...DF_VIEW_ORDER, 'ROADMAP', 'STAGE', 'NEEDS_YOU', 'RECORDS', 'COMM_PREFS'] as DfView[];

  return (
    <div className="df-review__portal-host">
      <p className="df-review__sim df-review__sim--inline">SIMULATED · CLIENT FOUNDATION PORTAL · J_PAYMENT_SUCCESS</p>
      <div className="df-review__portal-tabs" role="tablist" aria-label="Client portal areas">
        {PORTAL_TABS.map((tab) => (
          <button
            key={tab.view}
            type="button"
            role="tab"
            aria-selected={view === tab.view}
            className={`df-review__portal-tab${view === tab.view ? ' df-review__portal-tab--on' : ''}`}
            onClick={() => goTab(tab.view)}
          >
            {tab.label}
          </button>
        ))}
        <a className="df-review__portal-tab df-review__portal-tab--link" href={`#${reviewAnchorForView(view)}`}>
          DEEP LINK
        </a>
      </div>
      <div className={`df-root${menuOpen ? ' df-root--menu-open' : ''}`}>
        <DfFrame view={view} object={OBJECT} onMenu={() => setMenuOpen((o) => !o)} menuOpen={menuOpen}>
          {body}
        </DfFrame>
        <DfMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          views={menuViews}
          current={view}
          onNavigate={() => setMenuOpen(false)}
        />
      </div>
    </div>
  );
}
