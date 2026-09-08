/**
 * B5.8 — Right copy / details inspector (desktop).
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { SocialFormatPreviewModel } from './types.js';

type Tab = 'copy' | 'slide' | 'asset';

type Props = {
  format: SocialFormatPreviewModel;
  selectedSlotIndex: number;
  editCopyHref?: string;
};

export function CopyReviewInspector({ format, selectedSlotIndex, editCopyHref }: Props) {
  const [tab, setTab] = useState<Tab>('copy');
  const sequenceSlots = format.slots.filter((s) => !['x-copy'].includes(s.slotId));
  const slot = sequenceSlots[selectedSlotIndex] ?? sequenceSlots[0] ?? format.slots[0];

  return (
    <aside className="site00-spp-inspector" aria-label="Copy and details">
      <div className="site00-spp-inspector__tabs" role="tablist">
        {(['copy', 'slide', 'asset'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'is-active' : undefined}
            onClick={() => setTab(t)}
          >
            {t === 'copy' ? 'POST COPY' : t === 'slide' ? 'SLIDE DETAILS' : 'ASSET INFO'}
          </button>
        ))}
      </div>

      <div className="site00-spp-inspector__body">
        {tab === 'copy' && (
          <div className="site00-spp-inspector__copy">
            <label>
              <span>PRIMARY CAPTION</span>
              <p>{format.caption ?? format.copyText ?? 'Caption pending — edit in format workspace.'}</p>
            </label>
            <label>
              <span>ALT CAPTION A</span>
              <p className="site00-spp-inspector__muted">
                {format.altCaptionA ?? 'Available when copy intelligence is wired for this format.'}
              </p>
            </label>
            <label>
              <span>ALT CAPTION B</span>
              <p className="site00-spp-inspector__muted">
                {format.altCaptionB ?? 'Available when copy intelligence is wired for this format.'}
              </p>
            </label>
            <label>
              <span>CTA</span>
              <p>{format.ctaCopy ?? 'View the full story →'}</p>
            </label>
            {format.whyThisCopy ? (
              <div className="site00-spp-inspector__why">
                <strong>WHY THIS COPY</strong>
                <p>{format.whyThisCopy}</p>
              </div>
            ) : (
              <div className="site00-spp-inspector__why site00-spp-inspector__why--placeholder">
                <strong>WHY THIS COPY</strong>
                <p>Direct, platform-native copy will appear here once campaign copy director output is linked.</p>
              </div>
            )}
            {editCopyHref && (
              <Link to={editCopyHref} className="site00-spp-inspector__edit">
                EDIT COPY →
              </Link>
            )}
          </div>
        )}

        {tab === 'slide' && slot && (
          <dl className="site00-spp-inspector__meta">
            <div>
              <dt>ROLE</dt>
              <dd>{slot.assetRole ?? '—'}</dd>
            </div>
            <div>
              <dt>SEQUENCE</dt>
              <dd>{slot.sequenceNumber ?? '—'}</dd>
            </div>
            <div>
              <dt>CLASSIFICATION</dt>
              <dd>{slot.assetType ?? '—'}</dd>
            </div>
            <div>
              <dt>APPROVAL</dt>
              <dd>{slot.approvalState ?? 'PENDING'}</dd>
            </div>
            <div>
              <dt>NOTES</dt>
              <dd>{slot.notes ?? '—'}</dd>
            </div>
          </dl>
        )}

        {tab === 'asset' && slot && (
          <dl className="site00-spp-inspector__meta">
            <div>
              <dt>TYPE</dt>
              <dd>{slot.mediaType}</dd>
            </div>
            <div>
              <dt>SOURCE</dt>
              <dd>{slot.source ?? '—'}</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd>{slot.approvalState ?? '—'}</dd>
            </div>
            <div>
              <dt>VERSION</dt>
              <dd>{slot.version ?? '—'}</dd>
            </div>
            <div>
              <dt>FILE</dt>
              <dd className="site00-spp-inspector__file">{slot.filePath ? 'Attached' : 'Missing'}</dd>
            </div>
          </dl>
        )}
      </div>
    </aside>
  );
}
