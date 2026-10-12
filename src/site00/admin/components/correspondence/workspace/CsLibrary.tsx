import { DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP } from '../../../../../../shared/site00-digital-foundation/communications/eventMap.js';
import type { CampaignDefinition, ReviewState } from '../../../../../../shared/site00-correspondence-studio/types.js';
import {
  countByClassification,
  reviewStateLabel,
  type LibraryClassification,
  type LibraryRow,
} from '../../../../../../shared/site00-correspondence-studio/workspaceLibrary.js';
import type { ClientDeliverySummary } from './useWorkspaceReview';
import { CsIcon } from './CsIcons';

export type LibraryMode = 'emails' | 'campaigns' | 'automations' | 'archive' | 'deliveries';

const TABS: { id: Exclude<LibraryMode, 'deliveries'>; label: string }[] = [
  { id: 'emails', label: 'EMAILS' },
  { id: 'campaigns', label: 'CAMPAIGNS' },
  { id: 'automations', label: 'AUTOMATIONS' },
  { id: 'archive', label: 'ARCHIVE' },
];

const FAMILIES: { id: LibraryClassification | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'transactional', label: 'TRANSACTIONAL' },
  { id: 'operational', label: 'OPERATIONAL' },
  { id: 'marketing', label: 'MARKETING' },
];

type Props = {
  mode: LibraryMode;
  onMode: (mode: LibraryMode) => void;
  query: string;
  onQuery: (q: string) => void;
  family: LibraryClassification | 'all';
  onFamily: (f: LibraryClassification | 'all') => void;
  reviewOnly: boolean;
  onReviewOnly: (on: boolean) => void;
  scopeRows: LibraryRow[];
  visibleRows: LibraryRow[];
  selectedId: string | null;
  onSelect: (row: LibraryRow) => void;
  reviewStateOf: (row: LibraryRow) => ReviewState;
  thumbnails: Record<string, string | null>;
  campaigns: CampaignDefinition[];
  activeCampaignId: string | null;
  onCampaign: (campaign: CampaignDefinition | null) => void;
  delivery: ClientDeliverySummary | null;
};

function previewPathOf(row: LibraryRow): string | null {
  const v = row.current_version.preview_source;
  return v.kind === 'repository_html' ? v.publicPreviewPath ?? null : null;
}

export function CsLibrary(props: Props) {
  const { mode, onMode, scopeRows } = props;
  const counts = countByClassification(scopeRows);

  return (
    <section className="csw-library" aria-label="Email library">
      <div className="csw-tabs" role="tablist" aria-label="Library views">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            className={mode === tab.id ? 'is-active' : ''}
            onClick={() => onMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'emails' || mode === 'archive' ? (
        <>
          <div className="csw-library__tools">
            <label className="csw-search">
              <CsIcon name="search" size={15} />
              <span className="csw-sr">Search templates</span>
              <input
                type="search"
                value={props.query}
                onChange={(e) => props.onQuery(e.target.value)}
                placeholder="SEARCH TEMPLATES…"
              />
            </label>
            <button
              type="button"
              className={`csw-icon-btn${props.reviewOnly ? ' is-on' : ''}`}
              aria-pressed={props.reviewOnly}
              onClick={() => props.onReviewOnly(!props.reviewOnly)}
              title="Show only versions awaiting founder review"
            >
              <CsIcon name="filter" size={16} />
              <span className="csw-sr">Awaiting founder review only</span>
            </button>
          </div>
          {mode === 'emails' ? (
            <div className="csw-chips" role="group" aria-label="Email family">
              {FAMILIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={props.family === f.id}
                  className={props.family === f.id ? 'is-active' : ''}
                  onClick={() => props.onFamily(f.id)}
                >
                  {f.label} <b>{counts[f.id]}</b>
                </button>
              ))}
            </div>
          ) : null}
          {props.activeCampaignId ? (
            <p className="csw-scope">
              <span>CAMPAIGN · {props.campaigns.find((c) => c.campaign_id === props.activeCampaignId)?.name ?? props.activeCampaignId}</span>
              <button type="button" onClick={() => props.onCampaign(null)}>
                ALL CAMPAIGNS
              </button>
            </p>
          ) : null}
          <ul className="csw-rows">
            {props.visibleRows.map((row) => {
              const state = props.reviewStateOf(row);
              const path = previewPathOf(row);
              const thumb = path ? props.thumbnails[path] : null;
              const selected = row.template_id === props.selectedId;
              return (
                <li key={`${row.campaign_id}:${row.template_id}`}>
                  <button
                    type="button"
                    className={`csw-row${selected ? ' is-selected' : ''}`}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => props.onSelect(row)}
                  >
                    <span className={`csw-row__thumb${thumb ? '' : ' is-empty'}`} aria-hidden="true">
                      {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span>{row.composed ? '' : 'NOT COMPOSED'}</span>}
                    </span>
                    <span className="csw-row__text">
                      <span className="csw-row__code">{row.code}</span>
                      <span className="csw-row__name">{row.display_name}</span>
                      <span className="csw-row__meta">
                        <i aria-hidden="true">↳</i> {row.classification.toUpperCase()}
                        {row.version_count > 1 ? ` · ${row.version_count} VERSIONS` : ''}
                      </span>
                    </span>
                    <span className={`csw-row__state csw-state--${state}`}>{reviewStateLabel(state)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {props.visibleRows.length === 0 ? (
            <p className="csw-empty">
              {mode === 'archive'
                ? 'NO ARCHIVED VERSIONS. ARCHIVE IS A REVIEW STATE; NOTHING HAS BEEN ARCHIVED YET.'
                : scopeRows.length === 0
                  ? 'NO CAMPAIGNS ARE REGISTERED FOR THIS BRAND AUTHORITY.'
                  : 'NO TEMPLATES MATCH THIS FILTER.'}
            </p>
          ) : null}
        </>
      ) : null}

      {mode === 'campaigns' ? (
        <ul className="csw-cards">
          {props.campaigns.length === 0 ? <p className="csw-empty">NO CAMPAIGNS ARE REGISTERED FOR THIS BRAND AUTHORITY.</p> : null}
          {props.campaigns.map((c) => {
            const total = c.email_families.reduce((n, f) => n + f.template_ids.length, 0);
            return (
              <li key={c.campaign_id}>
                <button
                  type="button"
                  className={`csw-card${props.activeCampaignId === c.campaign_id ? ' is-selected' : ''}`}
                  onClick={() => props.onCampaign(c)}
                >
                  <span className="csw-micro">{c.project_id.replace(/-/g, ' ').toUpperCase()}</span>
                  <strong>{c.name}</strong>
                  {c.primary_objective ? <span className="csw-card__body">{c.primary_objective}</span> : null}
                  <span className="csw-card__meta">
                    {c.email_families.length} FAMILIES · {total} TEMPLATES
                  </span>
                  <span className="csw-card__families">
                    {c.email_families.map((f) => (
                      <span key={f.family_id}>
                        {f.label} {f.template_ids.length}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {mode === 'automations' ? (
        <div className="csw-automations">
          <p className="csw-note">
            <CsIcon name="lock" size={14} /> LIFECYCLE TRIGGER MAP · READ ONLY. EVERY TRIGGER IS OFF UNTIL THE FOUNDER APPROVES THE
            TEMPLATE AND ITS SEND FLAG.
          </p>
          <ul className="csw-trigger-list">
            {DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP.map((m) => (
              <li key={m.event_type}>
                <span className="csw-trigger__event">{m.event_type.replace(/_/g, ' ')}</span>
                <span className="csw-trigger__tpl">{m.template_ids.length ? m.template_ids.join(', ').toUpperCase() : 'NO TEMPLATE'}</span>
                <span className="csw-trigger__state">{m.enabled ? 'ON' : 'OFF'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === 'deliveries' ? (
        <div className="csw-deliveries">
          <h2 className="csw-heading">CLIENT DELIVERY</h2>
          {props.delivery ? (
            <>
              <p className="csw-delivery__count">
                <b>{props.delivery.approved.length}</b> OF {props.delivery.total} TEMPLATES APPROVED FOR EXPORT
              </p>
              <p className="csw-note">
                ONLY APPROVED VERSIONS ENTER A CLIENT PACKAGE. INTERNAL COMMENTS NEVER SHIP. SCOPE ·{' '}
                {props.delivery.scopeLabel}
              </p>
              <h3 className="csw-label">IN PACKAGE</h3>
              <ul className="csw-plain-list">
                {props.delivery.approved.length === 0 ? <li>NONE YET</li> : null}
                {props.delivery.approved.map((id) => (
                  <li key={id}>{id.toUpperCase()}</li>
                ))}
              </ul>
              <h3 className="csw-label">HELD BACK · NOT APPROVED</h3>
              <p className="csw-plain">{props.delivery.rejected.length} TEMPLATES</p>
              <h3 className="csw-label">EXPORT</h3>
              <p className="csw-note">
                THIS PLAN READS THE APPROVALS SAVED IN THIS BROWSER. THE REPOSITORY PACKAGER{' '}
                <code>scripts/correspondence-studio/build-client-delivery.py</code> BUILDS A DESIGN-ONLY SAMPLE ZIP. THE STUDIO DOES NOT
                UPLOAD OR SEND ANYTHING.
              </p>
            </>
          ) : (
            <p className="csw-empty">SELECT A CAMPAIGN TO PLAN A CLIENT DELIVERY.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
