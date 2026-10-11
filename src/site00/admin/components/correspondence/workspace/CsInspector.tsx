import { useEffect, useState, type ReactNode } from 'react';
import { mappingsForEvent } from '../../../../../../shared/site00-digital-foundation/communications/eventMap.js';
import { DEVICE_PREVIEW_WIDTHS } from '../../../../../../shared/site00-correspondence-studio/devicePreview.js';
import { APPROVAL_PERSISTENCE_MODE, type StoredReviewBundle } from '../../../../../../shared/site00-correspondence-studio/review/repositoryReviewStore.js';
import type {
  BrandAuthorityContract,
  CampaignDefinition,
  CorrespondenceWorkspaceManifest,
  EmailTemplateVersion,
  ReviewState,
} from '../../../../../../shared/site00-correspondence-studio/types.js';
import {
  reviewStateLabel,
  type CopyContract,
  type EmailBlock,
} from '../../../../../../shared/site00-correspondence-studio/workspaceLibrary.js';
import type { EmailDocumentState } from './emailDocument';
import { CsIcon } from './CsIcons';

export type InspectorTab = 'content' | 'design' | 'settings' | 'review';

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'content', label: 'CONTENT' },
  { id: 'design', label: 'DESIGN' },
  { id: 'settings', label: 'SETTINGS' },
  { id: 'review', label: 'REVIEW & TEST' },
];

export const REVIEW_ACTIONS: ReviewState[] = [
  'founder_review',
  'revision_required',
  'approved',
  'approved_with_revisions',
  'delivery_ready',
];

type Entry = CorrespondenceWorkspaceManifest['templates'][string];

type Props = {
  tab: InspectorTab;
  onTab: (tab: InspectorTab) => void;
  entry: Entry;
  version: EmailTemplateVersion;
  docState: EmailDocumentState;
  contract: CopyContract | null;
  brand: BrandAuthorityContract;
  campaign: CampaignDefinition;
  bundle: StoredReviewBundle;
  versionStateOf: (v: EmailTemplateVersion) => ReviewState;
  onSelectVersion: (versionId: string) => void;
  onSetState: (state: ReviewState) => void;
  onComment: (body: string) => void;
  onJumpToBlock: (block: EmailBlock) => boolean;
  footer: ReactNode;
};

function ReadOnlyField({ label, value, source }: { label: string; value: string | null; source: string }) {
  return (
    <div className="csw-field">
      <span className="csw-label">{label}</span>
      <div className="csw-field__row">
        <output className={`csw-field__value${value ? '' : ' is-empty'}`}>{value ?? 'NOT IN CONTRACT'}</output>
        <span className="csw-field__src" title={`Read only · source: ${source}`}>
          {source}
        </span>
      </div>
    </div>
  );
}

function BlockThumb({ block }: { block: EmailBlock }) {
  if (block.imageSrc) return <img src={block.imageSrc} alt="" loading="lazy" />;
  if (block.kind === 'primary_cta') return <span className="csw-block__cta">{block.summary.slice(0, 18)}</span>;
  if (block.kind === 'header') return <span className="csw-block__word">{block.summary.split(' ').slice(0, 2).join(' ')}</span>;
  return (
    <span className="csw-block__lines" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function CsInspector(props: Props) {
  const { tab, onTab, entry, version, docState, contract, brand, campaign, bundle } = props;
  const doc = docState.status === 'ready' ? docState.doc : null;
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setNotice(null);
  }, [version.version_id]);

  const subject = doc?.subject ?? contract?.subject ?? null;
  const preheader = doc?.preheader ?? contract?.preheader ?? null;
  const copySource = doc?.subject ? 'COMPOSITION' : contract ? 'REGISTRY' : 'NONE';
  const triggers = contract?.trigger_event ? mappingsForEvent(contract.trigger_event as Parameters<typeof mappingsForEvent>[0]) : [];

  return (
    <section className="csw-inspector" aria-label="Editorial inspector">
      <div className="csw-tabs" role="tablist" aria-label="Inspector">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="csw-inspector__body">
        {tab === 'content' ? (
          <>
            <h2 className="csw-heading">
              EMAIL DETAILS <span className="csw-ro">READ ONLY</span>
            </h2>
            <ReadOnlyField label="TEMPLATE NAME" value={entry.display_name} source="REGISTRY" />
            <div className="csw-field">
              <label className="csw-label" htmlFor="csw-version">
                VERSION
              </label>
              <div className="csw-field__row">
                <div className="csw-select csw-select--boxed">
                  <select
                    id="csw-version"
                    value={version.version_id}
                    disabled={entry.versions.length < 2}
                    onChange={(e) => props.onSelectVersion(e.target.value)}
                  >
                    {entry.versions.map((v) => (
                      <option key={v.version_id} value={v.version_id}>
                        {v.label}
                        {v.version_id === entry.current_version_id ? ' · CURRENT' : ''}
                      </option>
                    ))}
                  </select>
                  {entry.versions.length > 1 ? <CsIcon name="chevron-down" size={13} /> : null}
                </div>
                <span className="csw-field__src" title="Versions come from the template manifest">
                  {entry.versions.length} {entry.versions.length === 1 ? 'VERSION' : 'VERSIONS'}
                </span>
              </div>
            </div>
            <ReadOnlyField label="SUBJECT LINE" value={subject} source={copySource} />
            <ReadOnlyField label="PREHEADER TEXT" value={preheader} source={copySource} />

            <h2 className="csw-heading csw-heading--gap">
              CONTENT BLOCKS <span className="csw-ro">STRUCTURE</span>
            </h2>
            {doc?.blocks?.length ? (
              <ol className="csw-blocks">
                {doc.blocks.map((block) => (
                  <li key={block.index}>
                    <button
                      type="button"
                      className="csw-block"
                      onClick={() => {
                        const ok = props.onJumpToBlock(block);
                        setNotice(ok ? null : `${block.label} IS ONLY SHOWN ON ${block.viewport === 'mobile' ? 'MOBILE' : 'DESKTOP'}.`);
                      }}
                      title="Show this block in the preview"
                    >
                      <span className="csw-block__thumb">
                        <BlockThumb block={block} />
                      </span>
                      <span className="csw-block__text">
                        <span className="csw-block__label">
                          {block.label}
                          {block.viewport ? <em>{block.viewport === 'mobile' ? 'MOBILE ONLY' : 'DESKTOP ONLY'}</em> : null}
                        </span>
                        <span className="csw-block__summary">{block.summary || '—'}</span>
                      </span>
                      <CsIcon name="chevron" size={14} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="csw-note">
                {docState.status === 'loading'
                  ? 'READING STRUCTURE…'
                  : doc
                    ? 'THIS TEMPLATE IS RENDERED FROM THE EMAIL PACK; ITS BLOCK STRUCTURE IS NOT INDEXED.'
                    : 'NO COMPOSITION YET. BLOCKS APPEAR WHEN A COMPOSED VERSION EXISTS.'}
              </p>
            )}
            {notice ? (
              <p className="csw-note" role="status">
                {notice}
              </p>
            ) : null}
            {doc?.boardNote ? <p className="csw-note csw-note--board">{doc.boardNote}</p> : null}

            <h2 className="csw-heading csw-heading--gap">BRAND &amp; STYLE</h2>
            <div className="csw-brand-row">
              <div className="csw-field">
                <span className="csw-label">BRAND</span>
                <output className="csw-field__value csw-field__value--short">{brand.display_name}</output>
              </div>
              <div className="csw-field">
                <span className="csw-label">COLOR THEME</span>
                {brand.uses_site00_visual_dna ? (
                  <span className="csw-swatches" aria-label="SITE 00 canvas colours: red, ink, stone, white">
                    <i style={{ background: '#d90c0c' }} />
                    <i style={{ background: '#141414' }} />
                    <i style={{ background: '#f6f5f2' }} />
                    <i style={{ background: '#ffffff' }} />
                  </span>
                ) : brand.colors ? (
                  <span className="csw-swatches">
                    {Object.entries(brand.colors).map(([k, c]) => (
                      <i key={k} style={{ background: c }} title={k} />
                    ))}
                  </span>
                ) : (
                  <output className="csw-field__value is-empty">NO PALETTE ON THIS BRAND AUTHORITY</output>
                )}
              </div>
            </div>
            <ReadOnlyField
              label="TYPE SCALE"
              value={brand.uses_site00_visual_dna ? 'SAIRA SEMI CONDENSED · EDITORIAL' : brand.typography?.family ?? null}
              source="BRAND"
            />
          </>
        ) : null}

        {tab === 'design' ? (
          <>
            <h2 className="csw-heading">
              COMPOSITION <span className="csw-ro">READ ONLY</span>
            </h2>
            <dl className="csw-dl">
              <dt>EDITORIAL REGISTER</dt>
              <dd>{version.editorial_register ?? 'NOT ASSIGNED'}</dd>
              <dt>IMPLEMENTATION SCOPE</dt>
              <dd>{version.implementation_scope.replace(/_/g, ' ').toUpperCase()}</dd>
              <dt>CANVAS BRAND</dt>
              <dd>{brand.uses_site00_visual_dna ? 'SITE 00 DNA' : brand.display_name}</dd>
              <dt>DEVICE WIDTHS</dt>
              <dd>
                MOBILE {DEVICE_PREVIEW_WIDTHS.mobile} · TABLET {DEVICE_PREVIEW_WIDTHS.tablet} · DESKTOP {DEVICE_PREVIEW_WIDTHS.desktop}
              </dd>
              <dt>EDITORIAL INTENT</dt>
              <dd className="csw-mono">{version.editorial_intent_ref ?? '—'}</dd>
              <dt>COPY CONTRACT</dt>
              <dd className="csw-mono">{version.copy_ref ?? '—'}</dd>
              <dt>ASSET PROVENANCE</dt>
              <dd className="csw-mono">{version.asset_provenance_ref ?? '—'}</dd>
              <dt>VISUAL AUTHORITY</dt>
              <dd className="csw-mono">{campaign.visual_authority_ref ?? '—'}</dd>
              <dt>VOICE</dt>
              <dd className="csw-mono">{brand.voice_ref ?? campaign.editorial_direction_ref ?? '—'}</dd>
            </dl>
          </>
        ) : null}

        {tab === 'settings' ? (
          <>
            <h2 className="csw-heading">
              DELIVERY SETTINGS <span className="csw-ro">READ ONLY</span>
            </h2>
            <dl className="csw-dl">
              <dt>FAMILY</dt>
              <dd>{entry.classification.toUpperCase()}</dd>
              <dt>CAMPAIGN</dt>
              <dd>{campaign.name}</dd>
              <dt>AUDIENCE</dt>
              <dd>{campaign.target_audience ?? '—'}</dd>
              <dt>BRAND AUTHORITY</dt>
              <dd>{brand.display_name}</dd>
              {brand.approval_requirements?.length ? (
                <>
                  <dt>APPROVAL REQUIREMENTS</dt>
                  <dd>{brand.approval_requirements.join(' · ').toUpperCase()}</dd>
                </>
              ) : null}
              <dt>TRIGGER</dt>
              <dd>{contract?.trigger_event?.replace(/_/g, ' ') ?? 'NONE'}</dd>
              <dt>SEND</dt>
              <dd>
                {triggers.length
                  ? triggers.map((m) => `${m.event_type.replace(/_/g, ' ')} · ${m.enabled ? 'ON' : 'OFF'}`).join(' / ')
                  : 'OFF'}{' '}
                · NO LIVE SENDING IN CORRESPONDENCE STUDIO V1
              </dd>
              {contract?.primary_cta ? (
                <>
                  <dt>PRIMARY ACTION</dt>
                  <dd>{contract.primary_cta}</dd>
                </>
              ) : null}
              <dt>SENDER</dt>
              <dd>{doc?.from ?? 'PENDING REGISTRATION'}</dd>
            </dl>
          </>
        ) : null}

        {tab === 'review' ? (
          <>
            <h2 className="csw-heading">REVIEW STATE</h2>
            <p className="csw-review-state">
              <span className={`csw-dot csw-state--${bundle.review_state}`} aria-hidden="true" />
              {reviewStateLabel(bundle.review_state)}
            </p>
            <div className="csw-state-grid" role="group" aria-label="Set review state for this version">
              {REVIEW_ACTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={bundle.review_state === s}
                  className={bundle.review_state === s ? 'is-active' : ''}
                  onClick={() => props.onSetState(s)}
                >
                  {reviewStateLabel(s)}
                </button>
              ))}
            </div>

            <h2 className="csw-heading csw-heading--gap">VERSION HISTORY</h2>
            <ol className="csw-versions">
              {entry.versions.map((v) => {
                const isSel = v.version_id === version.version_id;
                return (
                  <li key={v.version_id}>
                    <button
                      type="button"
                      className={isSel ? 'is-selected' : ''}
                      aria-current={isSel ? 'true' : undefined}
                      onClick={() => props.onSelectVersion(v.version_id)}
                    >
                      <span className="csw-versions__label">
                        {v.label}
                        {v.version_id === entry.current_version_id ? <em>CURRENT</em> : null}
                      </span>
                      <span className="csw-versions__meta">
                        {v.created_at.slice(0, 10)} · {v.implementation_scope.replace(/_/g, ' ').toUpperCase()} ·{' '}
                        {reviewStateLabel(props.versionStateOf(v))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <h2 className="csw-heading csw-heading--gap">APPROVAL HISTORY</h2>
            {bundle.approvals.length ? (
              <ol className="csw-history">
                {[...bundle.approvals].reverse().map((a, i) => (
                  <li key={`${a.decided_at}-${i}`}>
                    <b>{reviewStateLabel(a.review_state)}</b>
                    <span>
                      {a.decided_by.toUpperCase()} · {a.decided_at.slice(0, 16).replace('T', ' ')}
                    </span>
                    {a.note ? <span>{a.note}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="csw-note">NO DECISIONS RECORDED FOR THIS VERSION.</p>
            )}

            <h2 className="csw-heading csw-heading--gap">FOUNDER NOTES</h2>
            <label className="csw-sr" htmlFor="csw-note-draft">
              Internal note
            </label>
            <textarea
              id="csw-note-draft"
              className="csw-textarea"
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="INTERNAL NOTE · NEVER INCLUDED IN A CLIENT PACKAGE"
            />
            <button
              type="button"
              className="csw-btn csw-btn--outline csw-btn--small"
              disabled={!draft.trim()}
              onClick={() => {
                props.onComment(draft);
                setDraft('');
              }}
            >
              SAVE NOTE
            </button>
            {bundle.comments.length ? (
              <ol className="csw-history">
                {[...bundle.comments].reverse().map((c) => (
                  <li key={c.id}>
                    <span>{c.created_at.slice(0, 16).replace('T', ' ')} · INTERNAL</span>
                    <span className="csw-history__body">{c.body}</span>
                  </li>
                ))}
              </ol>
            ) : null}

            <h2 className="csw-heading csw-heading--gap">PREVIEW CHECKS</h2>
            {doc?.checks ? (
              <dl className="csw-dl csw-dl--inline">
                <dt>IMAGES</dt>
                <dd>{doc.checks.images}</dd>
                <dt>MISSING ALT</dt>
                <dd className={doc.checks.imagesMissingAlt ? 'is-warn' : ''}>{doc.checks.imagesMissingAlt}</dd>
                <dt>LINKS</dt>
                <dd>{doc.checks.links}</dd>
                <dt>PERSONALIZED FIELDS</dt>
                <dd>{doc.checks.personalizedFields}</dd>
                <dt>FIELDS NOT IN CONTRACT</dt>
                <dd className={doc.checks.pendingFields ? 'is-warn' : ''}>{doc.checks.pendingFields}</dd>
              </dl>
            ) : (
              <p className="csw-note">CHECKS RUN ON COMPOSED VERSIONS ONLY.</p>
            )}

            <h2 className="csw-heading csw-heading--gap">TEST SEND</h2>
            <p className="csw-note">
              <CsIcon name="lock" size={14} /> OFF. NO SENDER IS REGISTERED AND CORRESPONDENCE STUDIO V1 DOES NOT SEND EMAIL.
            </p>
            <p className="csw-note">
              DECISIONS AND NOTES ARE SAVED IN THIS BROWSER ({APPROVAL_PERSISTENCE_MODE.replace(/-/g, ' ').toUpperCase()}). NOTHING IS
              WRITTEN TO A DATABASE.
            </p>
          </>
        ) : null}
      </div>

      <div className="csw-inspector__footer">{props.footer}</div>
    </section>
  );
}
