/**
 * Founder Blueprint review — a submitted Builder Hybrid Spatial Studio Blueprint, readable without the JSON.
 *
 * Hosted inside the existing canonical intake detail (`/admin/site00/intakes/builder/:id`). Reads the versioned
 * `submitted_payload` and the revision requests on the same intake row. Mutations are the existing admin intake
 * actions only (MARK IN REVIEW, REQUEST REVISION); each re-reads the record first so a decision taken on an
 * outdated version never lands on a newer one. Nothing here estimates, quotes, accepts or activates a project.
 */
import { useMemo, useState, type ReactNode } from 'react';
import type { IntakeAuditEvent, IntakeDetail, IntakeType } from '../../../../../shared/site00-intakes/types';
import { normalizeIntakeStatus } from '../../../../../shared/site00-intakes/types';
import { builderProjectActivationHint } from '../../../../../shared/site00-builder-spatial-intake/projectActivation';
import { parseBuilderSpatialDraft } from '../../../builder-experience/spatialStudio/intakeDraft';
import { compose } from '../../../builder-studio/buildObject/composition';
import { BuildThumbnail } from '../../../builder-studio/buildObject/BuildObjectStage';
import { buildSpec, expandInvestment, spacedRange, stateSummaryLine } from '../../../builder-studio/studioModel';
import {
  FOUNDER_STAGE_LABEL,
  blueprintVersions,
  diffVersions,
  founderActions,
  founderReviewStage,
  revisionExchanges,
  spatialSubmission,
  staleDecisionReason,
  versionFacts,
  versionSnapshot,
} from '../../../builder-studio/reviewModel';
import { site00AdminIntakesApi } from '../../services/intakesApi';
import '../../styles/site00-admin-blueprint-review.css';

type Section = 'BLUEPRINT' | 'CONFIGURATION' | 'ESTIMATE' | 'VERSIONS' | 'REVISIONS';

function when(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase();
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

export function BuilderBlueprintReview({
  intake,
  events,
  onChanged,
}: {
  intake: IntakeDetail;
  events: IntakeAuditEvent[];
  /** Reload the detail after a confirmed mutation (or after a stale-decision refusal). */
  onChanged: () => void;
}) {
  const intakeType: IntakeType = intake.intakeType;
  const submitted = spatialSubmission(intake);
  const versions = useMemo(() => blueprintVersions(submitted), [submitted]);
  const latest = versions[versions.length - 1] ?? null;
  const [selected, setSelected] = useState<number | null>(null);
  const shownVersion = versions.find((v) => v.version === selected) ?? latest;
  const [section, setSection] = useState<Section>('BLUEPRINT');
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'review' | 'revision' | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const stage = founderReviewStage(intake);
  const allowed = founderActions(intake);
  const exchanges = useMemo(() => revisionExchanges(intake), [intake]);
  const activation = builderProjectActivationHint(intake);
  const status = normalizeIntakeStatus(intake.status);
  const draft = parseBuilderSpatialDraft(intake.draftPayload);
  const seen = { version: latest?.version ?? null, status };

  /** Re-read the record and refuse when it moved since the founder looked at it. */
  const guard = async (): Promise<boolean> => {
    try {
      const fresh = await site00AdminIntakesApi.detail(intakeType, intake.id);
      const reason = staleDecisionReason(fresh.intake, seen);
      if (reason) {
        setNotice({ tone: 'error', text: reason });
        // A message written for the older version must not silently re-target the new one.
        setRevisionOpen(false);
        onChanged();
        return false;
      }
      return true;
    } catch (e) {
      setNotice({ tone: 'error', text: `COULD NOT CONFIRM THE CURRENT VERSION — NOTHING CHANGED. ${e instanceof Error ? e.message.toUpperCase() : ''}` });
      return false;
    }
  };

  const markInReview = async () => {
    setBusy('review');
    setNotice(null);
    if (await guard()) {
      try {
        await site00AdminIntakesApi.markInReview(intakeType, intake.id);
        setNotice({ tone: 'ok', text: `VERSION ${seen.version} MARKED IN REVIEW. THE CLIENT SEES UNDER REVIEW.` });
        onChanged();
      } catch (e) {
        setNotice({ tone: 'error', text: `NOT MARKED — ${e instanceof Error ? e.message.toUpperCase() : 'REQUEST FAILED'}` });
      }
    }
    setBusy(null);
  };

  const requestRevision = async () => {
    const text = message.trim();
    if (!text) {
      setNotice({ tone: 'error', text: 'WRITE WHAT THE CLIENT SHOULD CHANGE.' });
      return;
    }
    setBusy('revision');
    setNotice(null);
    if (await guard()) {
      try {
        await site00AdminIntakesApi.requestRevision(intakeType, intake.id, text);
        setNotice({ tone: 'ok', text: `REVISION REQUESTED FOR VERSION ${seen.version}. THE CLIENT CAN EDIT AND RESUBMIT; VERSION ${seen.version} STAYS ON RECORD.` });
        setMessage('');
        setRevisionOpen(false);
        onChanged();
      } catch (e) {
        setNotice({ tone: 'error', text: `NOT REQUESTED — ${e instanceof Error ? e.message.toUpperCase() : 'REQUEST FAILED'}` });
      }
    }
    setBusy(null);
  };

  if (!submitted || !latest || !shownVersion) {
    return (
      <section className="site00-admin-panel site00-admin-panel--wide bbr" aria-label="BLUEPRINT REVIEW">
        <h2 className="site00-admin-panel__title">BLUEPRINT REVIEW</h2>
        <p className="bbr-stage">{FOUNDER_STAGE_LABEL[stage]}</p>
        <p className="bbr-muted">
          THE CLIENT HAS NOT SUBMITTED A BLUEPRINT YET.
          {draft ? ` CURRENT DRAFT: ${stateSummaryLine(draft.spatialStudio)} · ROOM ${draft.spatialStudio.room}.` : ''}
        </p>
      </section>
    );
  }

  const facts = versionFacts(shownVersion);
  const snap = versionSnapshot(shownVersion);
  const estimate = snap.estimate;
  const previous = versions.find((v) => v.version === shownVersion.version - 1) ?? null;
  const changes = previous ? diffVersions(versionFacts(previous), facts) : [];
  const isRevision = latest.version > 1;
  const pendingRequest = stage === 'REVISION_REQUESTED' ? exchanges[exchanges.length - 1] ?? null : null;
  const spec = buildSpec(shownVersion.spatialState);

  const sections: { id: Section; label: string }[] = [
    { id: 'BLUEPRINT', label: 'OPEN BLUEPRINT' },
    { id: 'CONFIGURATION', label: 'INSPECT CONFIGURATION' },
    { id: 'ESTIMATE', label: 'REVIEW ESTIMATE' },
    { id: 'VERSIONS', label: `VIEW VERSION HISTORY (${versions.length})` },
    { id: 'REVISIONS', label: `VIEW CLIENT RESPONSE (${exchanges.length})` },
  ];

  return (
    <section className="site00-admin-panel site00-admin-panel--wide bbr" aria-label="BLUEPRINT REVIEW" data-stage={stage}>
      <header className="bbr-head">
        <div className="bbr-head__id">
          <h2 className="site00-admin-panel__title">BLUEPRINT REVIEW</h2>
          <p className="bbr-title">
            {facts.buildKind} · {facts.level}
          </p>
          <p className="bbr-muted">
            {intake.publicReference} · {intake.email ?? 'NO EMAIL ON RECORD'} · {intake.ownerKind === 'AUTHENTICATED' ? 'SIGNED-IN CLIENT' : 'GUEST'}
          </p>
        </div>
        <div className="bbr-head__state">
          <span className={`bbr-badge bbr-badge--${stage.toLowerCase()}`}>{FOUNDER_STAGE_LABEL[stage]}</span>
          <p className="bbr-muted">
            LATEST: VERSION {latest.version} · {when(latest.submittedAt)}
          </p>
        </div>
      </header>

      <div className="bbr-actions" role="toolbar" aria-label="REVIEW ACTIONS">
        {sections.map((s) => (
          <button key={s.id} type="button" className={`bbr-tab${section === s.id ? ' is-on' : ''}`} aria-pressed={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
        {isRevision ? (
          <button
            type="button"
            className="bbr-tab"
            onClick={() => {
              setSelected(latest.version);
              setSection('BLUEPRINT');
            }}
          >
            REOPEN REVISED BLUEPRINT · V{latest.version}
          </button>
        ) : null}
        <span className="bbr-actions__spacer" />
        <button type="button" className="bbr-btn" disabled={!allowed.markInReview || busy !== null} onClick={() => void markInReview()}>
          {busy === 'review' ? 'MARKING…' : 'MARK IN REVIEW'}
        </button>
        <button type="button" className="bbr-btn bbr-btn--red" disabled={!allowed.requestRevision || busy !== null} onClick={() => setRevisionOpen((v) => !v)}>
          REQUEST REVISION
        </button>
      </div>

      {notice ? (
        <p className={`bbr-notice bbr-notice--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      ) : null}

      {revisionOpen && allowed.requestRevision ? (
        <div className="bbr-revision-form">
          <label htmlFor="bbr-revision-message">
            REQUEST A REVISION OF VERSION {latest.version} · THE CLIENT SEES THIS MESSAGE
          </label>
          <textarea
            id="bbr-revision-message"
            rows={3}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="WHAT SHOULD THE CLIENT CHANGE BEFORE RESUBMITTING?"
          />
          <p className="bbr-muted">
            REOPENS THE BLUEPRINT FOR THE CLIENT. VERSION {latest.version} IS KEPT EXACTLY AS SUBMITTED. THIS IS NOT A REFINED ESTIMATE AND NOT A PROJECT DECISION.
          </p>
          <div className="bbr-revision-form__actions">
            <button type="button" className="bbr-btn bbr-btn--red" disabled={busy !== null} onClick={() => void requestRevision()}>
              {busy === 'revision' ? 'SENDING…' : `SEND REVISION REQUEST FOR V${latest.version}`}
            </button>
            <button type="button" className="bbr-btn bbr-btn--ghost" onClick={() => setRevisionOpen(false)}>
              CANCEL
            </button>
          </div>
        </div>
      ) : null}

      {pendingRequest ? (
        <p className="bbr-waiting">
          WAITING ON CLIENT · REVISION REQUESTED {when(pendingRequest.request.requestedAt)} FOR VERSION {pendingRequest.request.forSubmissionVersion}: “{pendingRequest.request.message}”
        </p>
      ) : null}

      <div className="bbr-versions" role="radiogroup" aria-label="VERSION">
        {versions.map((v) => (
          <button
            key={v.version}
            type="button"
            role="radio"
            aria-checked={v.version === shownVersion.version}
            className={`bbr-version${v.version === shownVersion.version ? ' is-on' : ''}`}
            onClick={() => setSelected(v.version)}
          >
            V{v.version}
            <span>{when(v.submittedAt)}</span>
            {v.version === latest.version ? <em>LATEST</em> : <em>SUPERSEDED</em>}
          </button>
        ))}
      </div>

      <div className="bbr-body">
        {section === 'BLUEPRINT' ? (
          <div className="bbr-grid">
            <figure className="bbr-object">
              <BuildThumbnail composition={compose('blueprint', spec)} width={520} height={360} alt={`BUILD OBJECT FOR VERSION ${facts.version}`} />
              <figcaption>BUILD OBJECT · VERSION {facts.version}</figcaption>
            </figure>
            <dl className="bbr-dl">
              <Row k="SUBMISSION" v={`VERSION ${facts.version} · ${when(facts.submittedAt)}`} />
              <Row k="BUILD TYPE" v={facts.buildKind} />
              <Row k="BUILD LEVEL" v={facts.level} />
              <Row k="STRUCTURE" v={facts.structure} />
              <Row k="VISUAL DIRECTION" v={`${facts.feel} · ${facts.visualSystem}`} />
              <Row k="CAPABILITIES" v={facts.capabilities.join(' · ') || '—'} />
              <Row k="PACE" v={facts.pace} />
              <Row k="CLIENT NOTE" v={facts.notes || '—'} />
              <Row k="INITIAL ESTIMATE" v={facts.investment ? `${expandInvestment(facts.investment)} · ${spacedRange(facts.window ?? '')}` : 'NOT RECORDED'} />
            </dl>
            <div className="bbr-pages">
              <h3>PAGES · {facts.pages.length}</h3>
              {snap.blueprint.experiences.length ? (
                snap.blueprint.experiences.map((g) => (
                  <p key={g.group}>
                    <strong>{g.group}</strong> {g.items.map((i) => `${i.label} (${i.depth})`).join(' · ')}
                  </p>
                ))
              ) : (
                <p className="bbr-muted">NO PAGE LIST — {facts.buildKind === 'WORLD' ? 'A WORLD IS SHAPED AS PLACES AT REVIEW' : 'NONE RECORDED'}.</p>
              )}
              {changes.length ? (
                <>
                  <h3>CHANGED FROM VERSION {previous!.version}</h3>
                  <ul className="bbr-changes">
                    {changes.map((c) => (
                      <li key={c.label}>
                        <strong>{c.label}</strong> {c.from} → {c.to}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {section === 'CONFIGURATION' ? (
          <div className="bbr-grid bbr-grid--2">
            <dl className="bbr-dl">
              <Row k="01 PLACE" v={facts.place} />
              <Row k="02 FEEL" v={facts.feel} />
              <Row k="03 WORK" v={facts.modules} />
              <Row k="04 PACE" v={facts.pace} />
              <Row k="CLIENT NOTE" v={facts.notes || '—'} />
              <Row k="READY AT SUBMIT" v={facts.ready ? 'YES — NO OPEN BLOCKERS' : `NO — ${facts.blockers.join(', ')}`} />
            </dl>
            <dl className="bbr-dl">
              <Row k="BUILD" v={snap.selection.build ?? '—'} />
              <Row k="STRUCTURE" v={snap.selection.structure ?? (snap.selection.world ? `WORLD · ${snap.selection.world.form}` : '—')} />
              <Row k="EXPRESSION" v={`${snap.selection.expression.primary ?? '—'} · ${snap.selection.expression.edition}`} />
              <Row k="CAPABILITIES" v={snap.selection.capabilities.join(' · ') || '—'} />
              <Row k="DELIVERY" v={snap.selection.delivery} />
              <Row k="VIEWPORTS" v={snap.selection.viewports} />
              <Row k="KEEP IT SIMPLE" v={snap.selection.keepItSimple ? 'YES' : 'NO'} />
              <Row k="SCOPE" v={`${snap.scope.signal} · ${snap.scope.plain}`} />
            </dl>
          </div>
        ) : null}

        {section === 'ESTIMATE' ? (
          <div className="bbr-grid bbr-grid--2">
            <dl className="bbr-dl">
              <Row k="KIND" v="INITIAL ESTIMATE · AUTOMATED FROM THE CLIENT'S CHOICES · NOT A QUOTE" />
              <Row k="INVESTMENT" v={estimate ? expandInvestment(estimate.investment) : 'NOT RECORDED'} />
              <Row k="WINDOW" v={estimate ? spacedRange(estimate.productionWindow) : 'NOT RECORDED'} />
              <Row k="CONFIDENCE" v={estimate?.confidence.label ?? '—'} />
              <Row k="DELIVERY" v={estimate?.delivery.selected ?? '—'} />
              <Row
                k="PRIORITY"
                v={
                  estimate
                    ? estimate.delivery.priority.available
                      ? `${spacedRange(estimate.delivery.priority.window)} · ${expandInvestment(estimate.delivery.priority.investment)}`
                      : `NOT AVAILABLE — ${estimate.delivery.priority.reason}`
                    : '—'
                }
              />
              <Row k="ESTIMATOR" v={`${shownVersion.estimatorVersion}${estimate ? ` · ${estimate.reference}` : ''}`} />
            </dl>
            <div className="bbr-pages">
              <h3>ASSUMPTIONS</h3>
              <ul className="bbr-changes">{(estimate?.assumptions ?? []).map((a) => <li key={a}>{a}</li>)}</ul>
              <h3>REFINED COMMERCIAL ESTIMATE</h3>
              <p className="bbr-muted">
                NOT AVAILABLE. THE BUILDER INTAKE HAS NO REFINED-ESTIMATE CONTRACT YET, SO A REFINED RANGE CANNOT BE RECORDED OR SHOWN TO THE CLIENT FROM HERE.
              </p>
            </div>
          </div>
        ) : null}

        {section === 'VERSIONS' ? (
          <ol className="bbr-history">
            {[...versions].reverse().map((v) => {
              const f = versionFacts(v);
              const prev = versions.find((p) => p.version === v.version - 1);
              const diff = prev ? diffVersions(versionFacts(prev), f) : [];
              return (
                <li key={v.version}>
                  <p className="bbr-history__head">
                    <strong>VERSION {v.version}</strong> · {when(v.submittedAt)} · {f.investment ? `${expandInvestment(f.investment)} · ${spacedRange(f.window ?? '')}` : 'NO ESTIMATE'} · ESTIMATOR {v.estimatorVersion}
                    {v.version === latest.version ? ' · LATEST' : ' · SUPERSEDED, KEPT AS SUBMITTED'}
                  </p>
                  <p className="bbr-muted">{stateSummaryLine(v.spatialState)}</p>
                  {diff.length ? (
                    <ul className="bbr-changes">
                      {diff.map((c) => (
                        <li key={c.label}>
                          <strong>{c.label}</strong> {c.from} → {c.to}
                        </li>
                      ))}
                    </ul>
                  ) : prev ? (
                    <p className="bbr-muted">NO CHANGES FROM VERSION {prev.version}.</p>
                  ) : (
                    <p className="bbr-muted">ORIGINAL SUBMISSION.</p>
                  )}
                  <button
                    type="button"
                    className="bbr-link"
                    onClick={() => {
                      setSelected(v.version);
                      setSection('BLUEPRINT');
                    }}
                  >
                    OPEN VERSION {v.version}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : null}

        {section === 'REVISIONS' ? (
          exchanges.length ? (
            <ol className="bbr-history">
              {exchanges.map((x, i) => (
                <li key={`${x.request.requestedAt}-${i}`}>
                  <p className="bbr-history__head">
                    <strong>REVISION REQUESTED</strong> · {when(x.request.requestedAt)} · FOR VERSION {x.request.forSubmissionVersion} · {x.request.adminEmail}
                  </p>
                  <p className="bbr-quote">“{x.request.message}”</p>
                  {x.response ? (
                    <>
                      <p className="bbr-history__head">
                        <strong>CLIENT RESPONSE · VERSION {x.response.version}</strong> · {when(x.response.submittedAt)}
                      </p>
                      {x.changes.length ? (
                        <ul className="bbr-changes">
                          {x.changes.map((c) => (
                            <li key={c.label}>
                              <strong>{c.label}</strong> {c.from} → {c.to}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="bbr-muted">RESUBMITTED WITHOUT CHANGES.</p>
                      )}
                      <button
                        type="button"
                        className="bbr-link"
                        onClick={() => {
                          setSelected(x.response!.version);
                          setSection('BLUEPRINT');
                        }}
                      >
                        REOPEN REVISED BLUEPRINT · V{x.response.version}
                      </button>
                    </>
                  ) : (
                    <p className="bbr-muted">WAITING ON CLIENT — NO RESUBMISSION YET.</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="bbr-muted">NO REVISION REQUESTED YET.</p>
          )
        ) : null}
      </div>

      <div className="bbr-decisions">
        <h3>DECISIONS ARE SEPARATE</h3>
        <dl className="bbr-dl bbr-dl--small">
          <Row k="INFORMATIONAL REVIEW" v="MARK IN REVIEW — status only. The client sees UNDER REVIEW. Nothing is reopened or priced." />
          <Row k="REVISION REQUEST" v="Reopens the Blueprint for the client with your message. The submitted version stays on record; the client resubmits a new version." />
          <Row k="REFINED COMMERCIAL ESTIMATE" v="Not available — no contract on the Builder intake yet. The initial estimate above is automated and not a quote." />
          <Row
            k="PROJECT ACCEPTANCE"
            v={`Manual: CONVERTED + linked project through BLDR operations. Production activation is gated${activation.blockers.length ? ` (${activation.blockers.join(', ')})` : ' — ready'}.`}
          />
        </dl>
        <p className="bbr-muted">
          AUDIT: {events.filter((e) => /SUBMITTED|RESUBMITTED|REVISION|REVIEW|CONVERTED/.test(e.eventType)).map((e) => `${e.eventType.replace(/_/g, ' ')} ${when(e.createdAt)}`).join(' · ') || '—'}
        </p>
      </div>
    </section>
  );
}
